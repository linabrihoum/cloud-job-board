import { SITE } from "@/lib/site";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between an ISO date (YYYY-MM-DD) and now, floored at 0. */
export function daysSince(isoDate: string, now: Date = new Date()): number {
  const then = Date.parse(isoDate);
  return Math.max(0, Math.floor((now.getTime() - then) / DAY_MS));
}

/**
 * "today", "yesterday", "5 days ago", "3 weeks ago", "2 months ago".
 * Rendered at build time, so it's as fresh as the latest deploy — which
 * happens on every merge.
 */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const days = daysSince(isoDate, now);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function isNew(isoDate: string, now: Date = new Date()): boolean {
  return daysSince(isoDate, now) <= SITE.newWithinDays;
}

export function isStale(isoDate: string, now: Date = new Date()): boolean {
  return daysSince(isoDate, now) > SITE.staleAfterDays;
}
