import "@testing-library/jest-dom";

// Mock ResizeObserver (ReactFlow needs this)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as any;
