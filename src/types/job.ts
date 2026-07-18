import type { CanonicalTag } from "@/lib/tags";

export type WorkMode = "remote" | "hybrid" | "onsite";

export type JobSource = "hand-picked" | "remoteok" | "weworkremotely" | "remotive";

export interface Job {
  /** Stable unique id, prefixed by source, e.g. "remoteok-1131263" */
  id: string;
  title: string;
  company: string;
  /** City/region text, or "Anywhere" for fully location-flexible roles */
  location: string;
  workMode: WorkMode;
  tags: CanonicalTag[];
  /**
   * Link to the posting. Hand-picked jobs link to the company's own page;
   * feed-sourced jobs link wherever the source's terms require (RemoteOK
   * requires a direct link back to their listing).
   */
  url: string;
  source: JobSource;
  /** ISO date the job was posted, e.g. "2026-07-18" */
  postedAt: string;
}
