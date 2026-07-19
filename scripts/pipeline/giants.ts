/**
 * Fetchers for cloud giants that run their own career portals instead of a
 * standard hiring system. Same rules as everything else: public JSON
 * endpoints only, direct links to the company's official posting.
 *
 * Covered: Amazon (amazon.jobs) and Netflix (Eightfold). Microsoft's
 * search API host no longer resolves and Google retired their public
 * careers API — both would require scraping, which this project doesn't do.
 */

import type { Job } from "@/types/job";
import { detectTags } from "@/lib/tags";
import { htmlToMd } from "./html";
import { extractSalary, slugify } from "./transform";
import { fetchJsonRetry } from "./util";

const KEYWORDS = ["devops", "site reliability engineer", "cloud engineer", "platform engineer", "kubernetes"];

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map one amazon.jobs search hit onto the Job shape. Pure — fixture-tested. */
export function mapAmazonJob(j: any): Job | null {
  if (!j?.id || !j.title || !j.job_path) return null;
  const company = j.business_category === "aws" ? "Amazon Web Services (AWS)" : "Amazon";
  const location = String(j.normalized_location ?? j.location ?? "").trim() || "See posting";
  const html = [j.description, j.basic_qualifications && `<h3>Basic qualifications</h3>${j.basic_qualifications}`, j.preferred_qualifications && `<h3>Preferred qualifications</h3>${j.preferred_qualifications}`]
    .filter(Boolean)
    .join("");
  const description = html ? htmlToMd(html) : "";
  const postedAt = j.posted_date ? new Date(j.posted_date).toISOString().slice(0, 10) : "";
  if (!postedAt || postedAt === "Invalid Da") return null;
  return {
    id: `amazon-${j.id}`,
    slug: slugify(`${company}-${j.title}-${j.id}`),
    title: String(j.title).replace(/\s+/g, " ").trim(),
    company,
    companyWebsite: j.business_category === "aws" ? "aws.amazon.com" : "amazon.com",
    location,
    workMode: /virtual|remote/i.test(`${j.location} ${location}`) ? "remote" : "onsite",
    tags: detectTags(`${j.title}\n${description}`),
    url: `https://www.amazon.jobs${j.job_path}`,
    source: "amazon",
    postedAt,
    ...(description ? { description } : {}),
    ...(j.job_schedule_type === "full-time" ? { employmentType: "Full-time" } : {}),
    ...(description && extractSalary(description) ? { salary: extractSalary(description) } : {}),
  };
}

export async function fetchAmazonJobs(): Promise<Job[]> {
  const byId = new Map<string, Job>();
  for (const keyword of KEYWORDS) {
    const data = (await fetchJsonRetry(
      `https://www.amazon.jobs/en/search.json?base_query=${encodeURIComponent(keyword)}&result_limit=100&offset=0`,
      { headers: { "user-agent": "Mozilla/5.0 (compatible; cloud-job-board)" } }
    )) as any;
    for (const raw of data?.jobs ?? []) {
      const job = mapAmazonJob(raw);
      if (job) byId.set(job.id, job);
    }
  }
  return [...byId.values()];
}

/** Map one Netflix (Eightfold) position onto the Job shape. Pure. */
export function mapNetflixPosition(p: any): Job | null {
  if (!p?.id || !p.name || !p.canonicalPositionUrl) return null;
  const location = String(p.location ?? "").replace(/,(?=\S)/g, ", ").trim() || "See posting";
  const description = p.job_description ? htmlToMd(String(p.job_description)) : "";
  const postedAt = p.t_create ? new Date(p.t_create * 1000).toISOString().slice(0, 10) : "";
  if (!postedAt) return null;
  const flexibility = String(p.work_location_option ?? p.location_flexibility ?? "");
  return {
    id: `netflix-${p.id}`,
    slug: slugify(`netflix-${p.name}-${p.display_job_id ?? p.id}`),
    title: String(p.name).replace(/\s+/g, " ").trim(),
    company: "Netflix",
    companyWebsite: "netflix.com",
    location,
    workMode: /remote/i.test(`${flexibility} ${location}`) ? "remote" : "onsite",
    tags: detectTags(`${p.name}\n${description}`),
    url: String(p.canonicalPositionUrl),
    source: "netflix",
    postedAt,
    ...(description ? { description } : {}),
    ...(description && extractSalary(description) ? { salary: extractSalary(description) } : {}),
  };
}

export async function fetchNetflixJobs(): Promise<Job[]> {
  const byId = new Map<string, Job>();
  for (const keyword of KEYWORDS) {
    const data = (await fetchJsonRetry(
      `https://explore.jobs.netflix.net/api/apply/v2/jobs?domain=netflix.com&query=${encodeURIComponent(keyword)}&num=50&start=0`,
      { headers: { "user-agent": "Mozilla/5.0 (compatible; cloud-job-board)" } }
    )) as any;
    for (const raw of data?.positions ?? []) {
      const job = mapNetflixPosition(raw);
      if (job) byId.set(job.id, job);
    }
  }
  return [...byId.values()];
}

export const GIANTS: { source: Job["source"]; fetch: () => Promise<Job[]> }[] = [
  { source: "amazon", fetch: fetchAmazonJobs },
  { source: "netflix", fetch: fetchNetflixJobs },
];
