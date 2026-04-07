import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import useEdgeAndNode from "../../src/hooks/useEdgeAndNode";
import { Connection, Edge } from "reactflow";

function setup(initialNodes = []) {
  const setNodes = vi.fn();
  const { result } = renderHook(() => useEdgeAndNode({ setNodes }));

  return { result, setNodes };
}

describe("React Flow Hook Test", () => {
  it("initializes with empty edges", () => {
    const { result } = setup();
    expect(result.current.edges).toEqual([]);
  });

  it("adds edge on connect", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    expect(result.current.edges.length).toBe(1);
    expect(result.current.edges[0].animated).toBe(true);
  });

  it("removes edge on double click", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    act(() => {
      result.current.onEdgeDoubleClick({} as any, { id: "e1" } as any);
    });

    expect(result.current.edges).toEqual([]);
  });

  it("reconnects edge successfully", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    act(() => {
      result.current.onReconnectStart();
    });

    act(() => {
      result.current.onReconnect(
        { id: "e1", source: "1", target: "2" } as Edge,
        { source: "1", target: "3" } as Connection,
      );
    });

    expect(result.current.edges[0].target).toBe("3");
  });

  it("removes edge if reconnect fails", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    act(() => {
      result.current.onReconnectStart(); // mark as failed
    });

    act(() => {
      result.current.onReconnectEnd({} as any, { id: "e1" } as any);
    });

    expect(result.current.edges).toEqual([]);
  });

  it("removes node and related edges on context menu", () => {
    const setNodes = vi.fn();
    const { result } = renderHook(() => useEdgeAndNode({ setNodes }));

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    const preventDefault = vi.fn();

    act(() => {
      result.current.onNodeContextMenu(
        { preventDefault } as any,
        { id: "1" } as any,
      );
    });

    expect(preventDefault).toHaveBeenCalled();

    // edges referencing node removed
    expect(result.current.edges).toEqual([]);

    // nodes filtered
    expect(setNodes).toHaveBeenCalled();
  });

  it("keeps edge when reconnect is successful", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    act(() => {
      result.current.onReconnectStart();
    });

    act(() => {
      result.current.onReconnect(
        { id: "e1" } as Edge,
        { source: "1", target: "3" } as Connection,
      );
    });

    act(() => {
      result.current.onReconnectEnd({} as any, { id: "e1" } as any);
    });

    expect(result.current.edges.length).toBe(1);
  });

  it("keeps edge when reconnect is successful", () => {
    const { result } = setup();

    act(() => {
      result.current.onConnect({
        id: "e1",
        source: "1",
        target: "2",
      });
    });

    act(() => {
      result.current.onReconnectStart();
    });

    act(() => {
      result.current.onReconnect(
        { id: "e1" } as Edge,
        { source: "1", target: "3" } as Connection,
      );
    });

    act(() => {
      result.current.onReconnectEnd({} as any, { id: "e1" } as any);
    });

    expect(result.current.edges.length).toBe(1);
  });
});
