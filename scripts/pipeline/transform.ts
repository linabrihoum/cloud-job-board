/** Pure transforms between raw ATS postings and the site's Job shape.
 * Kept free of network and file I/O so tests can cover them directly. */

import { detectTags } from "@/lib/tags";
import type { Job } from "@/types/job";
import type { Ats, RawPosting } from "./ats";

/** A job title must look like a cloud/SRE/platform/DevOps role. This is the
 * relevance gate — source tags and categories are not trusted. */
const RELEVANT_TITLE =
  /devops|devsecops|\bsre\b|site reliability|field reliability|database reliability|platform engineer|cloud engineer|cloud architect|cloud infrastructure|cloud operations|cloud security|infrastructure engineer|systems engineer|solutions architect|kubernetes|observability engineer|network engineer|release engineer/i;

/** ...but generic words like "reliability" and "systems" also appear in
 * hardware/aerospace/manufacturing/IT-support roles. Titles matching these
 * domains are out — tuned against real SpaceX/Stripe boards. */
const IRRELEVANT_TITLE =
  /hardware|electrical|mechanical|avionics|embedded|manufactur|structural|civil|industrial|propulsion|thermal|control systems|test engineer|quality engineer|quality systems|\brf\b|radar|fraud|payments?|pre-?sales|partner|equipment|fluids|power systems|wireless|optical|solar|launch|supply chain|facilities|valves|silicon|\bgnc\b|windows|endpoint/i;

export function isRelevantTitle(title: string): boolean {
  return RELEVANT_TITLE.test(title) && !IRRELEVANT_TITLE.test(title);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function workModeOf(location: string): Job["workMode"] {
  return /remote/i.test(location) ? "remote" : "onsite";
}

/** Pull a salary range out of description text when the hiring system
 * doesn't publish one structurally. Conservative: only clear $-ranges. */
export function extractSalary(text: string): string | undefined {
  const m = text.match(
    /\$\s?(\d{2,3})(?:[,.](\d{3}))?(k)?\s*(?:-|–|—|to)\s*\$?\s?(\d{2,3})(?:[,.](\d{3}))?(k)?/i
  );
  if (!m) return undefined;
  const num = (whole: string, thousands?: string, k?: string) =>
    k ? Number(whole) * 1000 : thousands ? Number(whole) * 1000 + Number(thousands) : Number(whole);
  const min = num(m[1], m[2], m[3]);
  const max = num(m[4], m[5], m[6]);
  // Ranges below ~$40k are usually hourly rates or noise — leave them out.
  if (min < 40000 || max <= min) return undefined;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${fmt(min)}–${fmt(max)}`;
}

export interface MapContext {
  ats: Ats;
  boardSlug: string;
  companyName: string;
  companyWebsite?: string;
  /** Converts the posting's HTML description to markdown-lite text. */
  htmlToMd: (html: string) => string;
}

export function mapPostingToJob(posting: RawPosting, ctx: MapContext): Job {
  const postingId = posting.url.replace(/\/+$/, "").split("/").pop() ?? "unknown";
  const location = posting.location.trim() || "Anywhere";
  const description = posting.html ? ctx.htmlToMd(posting.html) : "";
  const salary = posting.salary ?? extractSalary(description);
  return {
    id: `${ctx.ats}-${ctx.boardSlug}-${postingId}`,
    slug: slugify(`${ctx.companyName}-${posting.title}`),
    title: posting.title.replace(/\s+/g, " ").trim(),
    company: ctx.companyName,
    ...(ctx.companyWebsite ? { companyWebsite: ctx.companyWebsite } : {}),
    location,
    workMode: workModeOf(location),
    tags: detectTags(`${posting.title}\n${description}`),
    url: posting.url,
    source: ctx.ats,
    postedAt: posting.postedAt,
    ...(description ? { description } : {}),
    ...(posting.employmentType ? { employmentType: posting.employmentType } : {}),
    ...(salary ? { salary } : {}),
  };
}

/** Same company + same normalized title = the same job; keep the newest. */
export function dedupeJobs(jobs: Job[]): Job[] {
  const byKey = new Map<string, Job>();
  for (const job of jobs) {
    const key = `${slugify(job.company)}|${slugify(job.title)}`;
    const existing = byKey.get(key);
    if (!existing || job.postedAt > existing.postedAt) byKey.set(key, job);
  }
  return [...byKey.values()];
}

/** Freshness gate: drop anything posted more than `maxDays` ago. */
export function dropStale(jobs: Job[], maxDays: number, now: Date = new Date()): Job[] {
  const cutoff = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return jobs.filter((j) => j.postedAt >= cutoff);
}

/** No company may flood the board: keep at most `max` per company,
 * newest first. */
export function capPerCompany(jobs: Job[], max: number): Job[] {
  const counts = new Map<string, number>();
  return [...jobs]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .filter((job) => {
      const key = slugify(job.company);
      const n = counts.get(key) ?? 0;
      if (n >= max) return false;
      counts.set(key, n + 1);
      return true;
    });
}

/** Ensure slugs are unique by suffixing collisions (-2, -3, ...). */
export function uniqueSlugs(jobs: Job[]): Job[] {
  const seen = new Map<string, number>();
  return jobs.map((job) => {
    const count = seen.get(job.slug) ?? 0;
    seen.set(job.slug, count + 1);
    return count === 0 ? job : { ...job, slug: `${job.slug}-${count + 1}` };
  });
}
