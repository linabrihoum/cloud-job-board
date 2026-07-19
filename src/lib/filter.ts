import type { Job, WorkMode } from "@/types/job";

export const REGIONS = ["US", "Europe", "LATAM", "Asia", "Global"] as const;
export type Region = (typeof REGIONS)[number] | "Other";

export const LEVELS = ["junior", "mid", "senior", "staff", "principal", "manager"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
  principal: "Principal",
  manager: "Manager",
};

/** Derive a coarse region from a listing's location text. */
export function regionOf(location: string): Region {
  const l = location.toLowerCase();
  if (
    /\b(usa?|united states|u\.s\.)\b/.test(l) ||
    /\b(al|az|ca|co|fl|ga|il|ma|md|mi|mn|nc|nj|ny|oh|or|pa|tx|ut|va|wa|dc)\b/.test(l) ||
    /chicago|san francisco|new york|seattle|austin|boston|denver|atlanta|salt lake|washington|arlington|redwood/.test(l)
  ) {
    return "US";
  }
  if (
    /europe|\beu\b|netherlands|germany|france|spain|portugal|poland|ireland|italy|sweden|norway|denmark|finland|austria|switzerland|belgium|czech|romania|greece|united kingdom|\buk\b|london|berlin|amsterdam|paris|madrid|lisbon|dublin|warsaw/.test(l)
  ) {
    return "Europe";
  }
  if (/latam|latin america|brazil|brasil|s[ãa]o paulo|mexico|argentina|colombia|chile|peru|uruguay/.test(l)) {
    return "LATAM";
  }
  if (/asia|korea|seoul|japan|tokyo|singapore|india|kuala lumpur|malaysia|vietnam|philippines|indonesia|hong kong|taiwan/.test(l)) {
    return "Asia";
  }
  if (/global|anywhere|worldwide|remote/.test(l)) return "Global";
  return "Other";
}

/** Derive a seniority level from a job title. Order matters: the most
 * specific markers win (a "Senior Engineering Manager" is a manager). */
export function levelOf(title: string): Level {
  const t = title.toLowerCase();
  if (/\bmanager\b|\bhead of\b|\bdirector\b|\bvp\b|vice president/.test(t)) return "manager";
  if (/principal/.test(t)) return "principal";
  if (/\bstaff\b/.test(t)) return "staff";
  if (/junior|\bentry\b|new grad|graduate|intern/.test(t)) return "junior";
  if (/senior|\bsr\.?\b|\blead\b/.test(t)) return "senior";
  return "mid";
}

export type WorkModeFilter = WorkMode | "all";

export interface JobFilter {
  /** Keyword matched against title, company, and tags (case-insensitive). */
  q: string;
  /** Work-mode restriction, or "all" for no restriction. */
  mode: WorkModeFilter;
  /** Selected technology tags; a job must carry every selected tag. */
  tags: string[];
  /** Region restriction (derived from location), or "all". */
  region: Region | "all";
  /** Seniority restriction (derived from title), or "all". */
  level: Level | "all";
}

export const EMPTY_FILTER: JobFilter = { q: "", mode: "all", tags: [], region: "all", level: "all" };

export function isEmptyFilter(f: JobFilter): boolean {
  return (
    f.q.trim() === "" &&
    f.mode === "all" &&
    f.tags.length === 0 &&
    f.region === "all" &&
    f.level === "all"
  );
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
    if (f.region !== "all" && regionOf(job.location) !== f.region) return false;
    if (f.level !== "all" && levelOf(job.title) !== f.level) return false;
    const jobTags: readonly string[] = job.tags;
    for (const tag of f.tags) {
      if (!jobTags.includes(tag)) return false;
    }
    return true;
  });
}

/** Read a filter from URL search params (?q=sre&mode=remote&region=US&level=senior&tags=AWS,Go). */
export function parseFilter(params: URLSearchParams): JobFilter {
  const mode = params.get("mode");
  const region = params.get("region");
  const level = params.get("level");
  return {
    q: params.get("q") ?? "",
    mode: mode === "remote" || mode === "hybrid" || mode === "onsite" ? mode : "all",
    tags: (params.get("tags") ?? "").split(",").filter(Boolean),
    region: (REGIONS as readonly string[]).includes(region ?? "") ? (region as Region) : "all",
    level: (LEVELS as readonly string[]).includes(level ?? "") ? (level as Level) : "all",
  };
}

/** Serialize a filter back to a query string ("" when nothing is active). */
export function toQueryString(f: JobFilter): string {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.mode !== "all") params.set("mode", f.mode);
  if (f.region !== "all") params.set("region", f.region);
  if (f.level !== "all") params.set("level", f.level);
  if (f.tags.length) params.set("tags", f.tags.join(","));
  const s = params.toString();
  return s ? `?${s}` : "";
}
