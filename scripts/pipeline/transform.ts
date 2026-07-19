/** Pure transforms between raw ATS postings and the site's Job shape.
 * Kept free of network and file I/O so tests can cover them directly. */

import { detectTags } from "@/lib/tags";
import type { Job } from "@/types/job";
import type { Ats, RawPosting } from "./ats";

/** A job title must look like a cloud/SRE/platform/DevOps role. This is the
 * relevance gate — source tags and categories are not trusted. */
const RELEVANT_TITLE =
  /devops|\bsre\b|site reliability|reliability engineer|platform engineer|cloud engineer|cloud architect|cloud infrastructure|cloud operations|infrastructure engineer|systems engineer|solutions architect|kubernetes/i;

export function isRelevantTitle(title: string): boolean {
  return RELEVANT_TITLE.test(title);
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
    ...(posting.salary ? { salary: posting.salary } : {}),
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

/** Ensure slugs are unique by suffixing collisions (-2, -3, ...). */
export function uniqueSlugs(jobs: Job[]): Job[] {
  const seen = new Map<string, number>();
  return jobs.map((job) => {
    const count = seen.get(job.slug) ?? 0;
    seen.set(job.slug, count + 1);
    return count === 0 ? job : { ...job, slug: `${job.slug}-${count + 1}` };
  });
}
