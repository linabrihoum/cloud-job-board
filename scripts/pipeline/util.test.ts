import { describe, expect, it } from "vitest";
import { mapPool } from "./util";

describe("mapPool", () => {
  it("processes every item and keeps input order", async () => {
    const out = await mapPool([3, 1, 2], 2, async (n) => {
      await new Promise((r) => setTimeout(r, n * 5));
      return n * 10;
    });
    expect(out).toEqual([30, 10, 20]);
  });

  it("never exceeds the concurrency limit", async () => {
    let inFlight = 0;
    let peak = 0;
    await mapPool(Array.from({ length: 12 }, (_, i) => i), 4, async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 10));
      inFlight--;
    });
    expect(peak).toBeLessThanOrEqual(4);
  });

  it("handles empty input", async () => {
    expect(await mapPool([], 5, async (x) => x)).toEqual([]);
  });
});
