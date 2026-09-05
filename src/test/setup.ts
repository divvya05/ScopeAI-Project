import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const noop = () => {};

class IntersectionObserverStub {
  readonly root: Element | null = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = noop;
  unobserve = noop;
  disconnect = noop;
  takeRecords = () => [];
}

class ResizeObserverStub {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverStub,
  });

  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverStub,
  });

  Object.defineProperty(window, "scrollTo", {
    writable: true,
    configurable: true,
    value: noop,
  });

  Object.defineProperty(window, "scrollBy", {
    writable: true,
    configurable: true,
    value: noop,
  });

  Object.defineProperty(Element.prototype, "scrollIntoView", {
    writable: true,
    configurable: true,
    value: noop,
  });
}

if (typeof globalThis.crypto?.randomUUID !== "function") {
  Object.defineProperty(globalThis, "crypto", {
    configurable: true,
    writable: true,
    value: {
      ...(globalThis.crypto ?? {}),
      randomUUID: () => "00000000-0000-4000-8000-000000000000",
    },
  });
}