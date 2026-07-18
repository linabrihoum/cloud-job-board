import { describe, expect, it } from "vitest";
import { daysSince, formatRelativeDate, isNew, isStale } from "@/lib/dates";

const NOW = new Date("2026-07-18T12:00:00Z");

describe("daysSince", () => {
  it("counts whole days", () => {
    expect(daysSince("2026-07-18", NOW)).toBe(0);
    expect(daysSince("2026-07-15", NOW)).toBe(3);
  });

  it("never goes negative for future dates", () => {
    expect(daysSince("2026-07-25", NOW)).toBe(0);
  });
});

describe("formatRelativeDate", () => {
  it("uses words for the recent past", () => {
    expect(formatRelativeDate("2026-07-18", NOW)).toBe("today");
    expect(formatRelativeDate("2026-07-17", NOW)).toBe("yesterday");
    expect(formatRelativeDate("2026-07-13", NOW)).toBe("5 days ago");
  });

  it("switches to weeks, then months", () => {
    expect(formatRelativeDate("2026-06-27", NOW)).toBe("3 weeks ago");
    expect(formatRelativeDate("2026-04-18", NOW)).toBe("3 months ago");
  });
});

describe("freshness flags", () => {
  it("marks recent listings as new", () => {
    expect(isNew("2026-07-16", NOW)).toBe(true);
    expect(isNew("2026-07-01", NOW)).toBe(false);
  });

  it("marks old listings as stale", () => {
    expect(isStale("2026-04-01", NOW)).toBe(true);
    expect(isStale("2026-07-01", NOW)).toBe(false);
  });
});
