/**
 * USAJobs source — federal cloud/DevSecOps roles via the official Search
 * API (developer.usajobs.gov). Applying happens on USAJobs itself, which
 * is the government's official application path, so listings satisfy the
 * direct-apply rule.
 *
 * The API needs a free key: register at https://developer.usajobs.gov/,
 * then set USAJOBS_EMAIL and USAJOBS_API_KEY. Without them this source is
 * skipped.
 */

import type { Job } from "@/types/job";
import { slugify } from "./transform";

const SEARCH_KEYWORDS = [
  "DevOps",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "DevSecOps",
  "Kubernetes",
];

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map one USAJobs search item onto the Job shape. Pure — fixture-tested. */
export function mapUsaJobsItem(item: any): Job | null {
  const d = item?.MatchedObjectDescriptor;
  if (!d?.PositionID || !d.PositionTitle || !d.PositionURI) return null;

  const location = String(d.PositionLocationDisplay ?? "United States").trim();
  const remote = /anywhere in the u\.s\.|remote/i.test(location);

  let salary: string | undefined;
  const pay = Array.isArray(d.PositionRemuneration) ? d.PositionRemuneration[0] : undefined;
  if (pay?.MinimumRange && pay?.MaximumRange && pay?.RateIntervalCode === "PA") {
    const k = (n: string) => `$${Math.round(Number(n) / 1000)}k`;
    salary = `${k(pay.MinimumRange)}–${k(pay.MaximumRange)}`;
  }

  const summary = String(d.UserArea?.Details?.JobSummary ?? "").trim();
  const closes = String(d.ApplicationCloseDate ?? "").slice(0, 10);
  const description = [summary, closes && `**Applications close ${closes}.**`]
    .filter(Boolean)
    .join("\n");

  const company = String(d.OrganizationName ?? d.DepartmentName ?? "U.S. Government").trim();
  const schedule = Array.isArray(d.PositionSchedule) ? d.PositionSchedule[0]?.Name : undefined;

  return {
    id: `usajobs-${d.PositionID}`,
    slug: slugify(`${company}-${d.PositionTitle}-${d.PositionID}`),
    title: String(d.PositionTitle).replace(/\s+/g, " ").trim(),
    company,
    location: remote ? `${location.replace(/\s*\(remote job\)\s*/i, "")} · Remote` : location,
    workMode: remote ? "remote" : "onsite",
    tags: [],
    url: String(d.PositionURI),
    source: "usajobs",
    postedAt: String(d.PublicationStartDate ?? "").slice(0, 10),
    ...(description ? { description } : {}),
    ...(schedule ? { employmentType: schedule } : {}),
    ...(salary ? { salary } : {}),
  };
}

/** Query the search API across the keyword set; dedupe by PositionID. */
export async function fetchUsaJobs(email: string, apiKey: string): Promise<Job[]> {
  const byId = new Map<string, Job>();
  for (const keyword of SEARCH_KEYWORDS) {
    const url = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(keyword)}&ResultsPerPage=100`;
    const res = await fetch(url, {
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": email,
        "Authorization-Key": apiKey,
      },
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `usajobs auth failed (${res.status}). Check the USAJOBSAPI secret, and add a ` +
          `USAJOBS_EMAIL secret set to the email the key was registered with — ` +
          `USAJobs expects it as the User-Agent.`
      );
    }
    if (!res.ok) throw new Error(`${res.status} for usajobs "${keyword}"`);
    const data = (await res.json()) as any;
    for (const item of data?.SearchResult?.SearchResultItems ?? []) {
      const job = mapUsaJobsItem(item);
      if (job) byId.set(job.id, job);
    }
  }
  return [...byId.values()];
}
