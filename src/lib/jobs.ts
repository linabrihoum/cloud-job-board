import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CANONICAL_TAGS } from "@/lib/tags";
import type { Job } from "@/types/job";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const jobSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase words joined by dashes"),
  title: z.string().min(1),
  company: z.string().min(1),
  companyWebsite: z
    .string()
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, "companyWebsite must be a bare domain like acme.com")
    .optional(),
  location: z.string().min(1),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  tags: z.array(z.enum(CANONICAL_TAGS)),
  url: z.string().url(),
  source: z.enum([
    "hand-picked",
    "greenhouse",
    "lever",
    "ashby",
    "workable",
    "smartrecruiters",
    "usajobs",
  ]),
  postedAt: z
    .string()
    .regex(ISO_DATE, "postedAt must be an ISO date like 2026-07-18")
    .refine((d) => !Number.isNaN(Date.parse(d)), "postedAt is not a real date"),
  description: z.string().optional(),
  employmentType: z.string().min(1).optional(),
  salary: z.string().min(1).optional(),
});

export const jobsFileSchema = z.array(jobSchema);

const JOBS_FILE = path.join(process.cwd(), "src", "data", "jobs.json");

/**
 * Reads and validates jobs.json, returning jobs sorted newest-first.
 * Throws (failing the build or test run) with a message that points at the
 * offending entry if the data is malformed.
 */
export function loadJobs(): Job[] {
  const raw = fs.readFileSync(JOBS_FILE, "utf8");
  return parseJobs(raw);
}

/** Parse + validate a jobs.json string. Split out so tests can feed it bad data. */
export function parseJobs(raw: string): Job[] {
  const data: unknown = JSON.parse(raw);
  const result = jobsFileSchema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const index = typeof first.path[0] === "number" ? first.path[0] : "?";
    throw new Error(
      `Invalid job data in jobs.json at entry ${index} (${first.path.join(".")}): ${first.message}`
    );
  }
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const job of result.data) {
    if (ids.has(job.id)) {
      throw new Error(`Duplicate job id in jobs.json: ${job.id}`);
    }
    if (slugs.has(job.slug)) {
      throw new Error(`Duplicate job slug in jobs.json: ${job.slug}`);
    }
    ids.add(job.id);
    slugs.add(job.slug);
  }
  return sortNewestFirst(result.data);
}

export function getJobBySlug(jobs: Job[], slug: string): Job | undefined {
  return jobs.find((j) => j.slug === slug);
}

/** Up to `limit` other jobs sharing at least one tag, newest first. */
export function relatedJobs(jobs: Job[], job: Job, limit = 3): Job[] {
  const tags = new Set(job.tags);
  return jobs
    .filter((j) => j.id !== job.id && j.tags.some((t) => tags.has(t)))
    .slice(0, limit);
}

export function sortNewestFirst(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/** Distinct tags actually present in the data, in canonical-list order. */
export function tagsInUse(jobs: Job[]): string[] {
  const used = new Set(jobs.flatMap((j) => j.tags));
  return CANONICAL_TAGS.filter((t) => used.has(t));
}
