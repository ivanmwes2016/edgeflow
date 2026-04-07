import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSimulation } from "../../src/hooks/useSimulation";

const mockPayload = {
  nodes: [{ id: "1", label: "API", type: "api" }],
  edges: [{ source: "1", target: "2" }],
};

// --- EventSource mock ---
class MockEventSource {
  static instance: MockEventSource;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  listeners: Record<string, () => void> = {};
  close = vi.fn();

  constructor() {
    MockEventSource.instance = this;
  }
  addEventListener(event: string, cb: () => void) {
    this.listeners[event] = cb;
  }

  // helpers to simulate server events in tests
  emit(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }
  emitDone() {
    this.listeners["done"]?.();
  }
  emitError() {
    this.onerror?.();
  }
}

beforeEach(() => {
  vi.stubGlobal("EventSource", MockEventSource);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobId: "job-123" }),
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

// --- Tests ---
describe("useSimulation", () => {
  it("returns correct initial state", () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    expect(result.current.deployLogs).toEqual([]);
    expect(result.current.simVisible).toBe(false);
    expect(result.current.simulating).toBe(false);
  });

  it("does nothing when nodes are empty", async () => {
    const { result } = renderHook(() =>
      useSimulation({ nodes: [], edges: [] }),
    );
    await act(() => result.current.simulate());
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.simulating).toBe(false);
  });

  it("sets simulating and simVisible on start", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    expect(result.current.simulating).toBe(true);
    expect(result.current.simVisible).toBe(true);
  });

  it("POSTs payload to the correct endpoint", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/deploy/run"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(mockPayload),
      }),
    );
  });

  it("appends incoming SSE messages to deployLogs", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    act(() => {
      MockEventSource.instance.emit("Starting containers...");
      MockEventSource.instance.emit("Done.");
    });
    expect(result.current.deployLogs).toEqual([
      "Starting containers...",
      "Done.",
    ]);
  });

  it("stops simulating and closes EventSource on done event", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    act(() => MockEventSource.instance.emitDone());
    expect(MockEventSource.instance.close).toHaveBeenCalled();
    expect(result.current.simulating).toBe(false);
  });

  it("stops simulating on EventSource error", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    act(() => MockEventSource.instance.emitError());
    expect(result.current.simulating).toBe(false);
  });

  it("handles fetch failure gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    expect(result.current.simulating).toBe(false);
  });

  it("close() hides the panel", async () => {
    const { result } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    act(() => result.current.close());
    expect(result.current.simVisible).toBe(false);
  });

  it("closes EventSource on unmount", async () => {
    const { result, unmount } = renderHook(() => useSimulation(mockPayload));
    await act(() => result.current.simulate());
    unmount();
    expect(MockEventSource.instance.close).toHaveBeenCalled();
  });
});
