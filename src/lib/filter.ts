import type { Job, WorkMode } from "@/types/job";

export interface JobFilter {
  /** Keyword matched against title, company, and tags (case-insensitive). */
  q: string;
  /** Work-mode restriction, or "all" for no restriction. */
  mode: WorkMode | "all";
  /** Selected technology tags; a job must carry every selected tag. */
  tags: string[];
}

export const EMPTY_FILTER: JobFilter = { q: "", mode: "all", tags: [] };

export function isEmptyFilter(f: JobFilter): boolean {
  return f.q.trim() === "" && f.mode === "all" && f.tags.length === 0;
}

/** All conditions combine with AND. */
export function filterJobs(jobs: Job[], f: JobFilter): Job[] {
  const q = f.q.trim().toLowerCase();
  return jobs.filter((job) => {
    if (q) {
      const hay = `${job.title} ${job.company} ${job.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.mode !== "all" && job.workMode !== f.mode) return false;
    const jobTags: readonly string[] = job.tags;
    for (const tag of f.tags) {
      if (!jobTags.includes(tag)) return false;
    }
    return true;
  });
}

/** Read a filter from URL search params (?q=sre&mode=remote&tags=AWS,Go). */
export function parseFilter(params: URLSearchParams): JobFilter {
  const mode = params.get("mode");
  return {
    q: params.get("q") ?? "",
    mode: mode === "remote" || mode === "hybrid" || mode === "onsite" ? mode : "all",
    tags: (params.get("tags") ?? "").split(",").filter(Boolean),
  };
}

/** Serialize a filter back to a query string ("" when nothing is active). */
export function toQueryString(f: JobFilter): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.mode !== "all") params.set("mode", f.mode);
  if (f.tags.length) params.set("tags", f.tags.join(","));
  const s = params.toString();
  return s ? `?${s}` : "";
}
