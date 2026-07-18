import type { CanonicalTag } from "@/lib/tags";

export type WorkMode = "remote" | "hybrid" | "onsite";

export type JobSource = "hand-picked" | "greenhouse" | "lever" | "ashby";

export interface Job {
  /** Stable unique id, prefixed by source, e.g. "greenhouse-ujet-4709322005" */
  id: string;
  /** URL-friendly unique slug for the detail page, e.g. "ujet-senior-site-reliability-engineer-sre" */
  slug: string;
  title: string;
  company: string;
  /** Company website domain (e.g. "honeycomb.io") — used for the logo. */
  companyWebsite?: string;
  /** City/region text, or "Anywhere" for fully location-flexible roles */
  location: string;
  workMode: WorkMode;
  tags: CanonicalTag[];
  /**
   * Link to the company's own posting — always. Hand-picked jobs link to
   * the company careers page; sourced jobs link to the company's posting
   * on its own hiring system (Greenhouse/Lever/Ashby).
   */
  url: string;
  source: JobSource;
  /** ISO date the job was posted, e.g. "2026-07-18" */
  postedAt: string;
  /**
   * Role description in markdown-lite (## headings, - bullets, **bold**),
   * converted from the company's own posting at ingestion. Plain text only —
   * no HTML is ever stored or rendered raw.
   */
  description?: string;
}
