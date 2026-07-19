// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Effects } from "@/components/Effects";

function mockMatchMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("reduced-motion") ? reduced : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("js");
});

describe("Effects", () => {
  it("marks <html> as js-enabled so reveal/tilt styles activate", () => {
    mockMatchMedia(false);
    vi.stubGlobal("IntersectionObserver", NoopObserver);
    render(<Effects />);
    expect(document.documentElement.classList.contains("js")).toBe(true);
  });

  it("does nothing under prefers-reduced-motion (content stays visible)", () => {
    mockMatchMedia(true);
    render(<Effects />);
    expect(document.documentElement.classList.contains("js")).toBe(false);
  });
});
