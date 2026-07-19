import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTER,
  filterJobs,
  isEmptyFilter,
  levelOf,
  parseFilter,
  regionOf,
  toQueryString,
} from "@/lib/filter";
import type { Job } from "@/types/job";

const base: Omit<Job, "id" | "slug" | "title" | "company" | "workMode" | "tags"> = {
  location: "Anywhere",
  url: "https://example.com/careers/x",
  source: "hand-picked",
  postedAt: "2026-07-18",
};

const jobs: Job[] = [
  { ...base, id: "a", slug: "a", title: "Senior SRE", company: "Acme", workMode: "remote", tags: ["AWS", "Kubernetes"] },
  { ...base, id: "b", slug: "b", title: "Cloud Engineer", company: "Globex", workMode: "onsite", tags: ["GCP", "Terraform"] },
  { ...base, id: "c", slug: "c", title: "Platform Engineer", company: "Initech", workMode: "remote", tags: ["AWS", "Terraform"] },
];

describe("filterJobs", () => {
  it("returns everything for the empty filter", () => {
    expect(filterJobs(jobs, EMPTY_FILTER)).toHaveLength(3);
  });

  it("matches keyword against title, company, and tags, ignoring case", () => {
    expect(filterJobs(jobs, { ...EMPTY_FILTER, q: "sre" }).map((j) => j.id)).toEqual(["a"]);
    expect(filterJobs(jobs, { ...EMPTY_FILTER, q: "globex" }).map((j) => j.id)).toEqual(["b"]);
    expect(filterJobs(jobs, { ...EMPTY_FILTER, q: "terraform" }).map((j) => j.id)).toEqual(["b", "c"]);
  });

  it("filters by work mode", () => {
    expect(filterJobs(jobs, { ...EMPTY_FILTER, mode: "remote" }).map((j) => j.id)).toEqual(["a", "c"]);
  });

  it("requires every selected tag (AND)", () => {
    expect(filterJobs(jobs, { ...EMPTY_FILTER, tags: ["AWS"] }).map((j) => j.id)).toEqual(["a", "c"]);
    expect(filterJobs(jobs, { ...EMPTY_FILTER, tags: ["AWS", "Terraform"] }).map((j) => j.id)).toEqual(["c"]);
  });

  it("combines all conditions with AND", () => {
    const f = { ...EMPTY_FILTER, q: "engineer", mode: "remote" as const, tags: ["AWS"] };
    expect(filterJobs(jobs, f).map((j) => j.id)).toEqual(["c"]);
  });

  it("filters by derived region and level", () => {
    const localized: Job[] = [
      { ...jobs[0], id: "us", location: "Chicago, IL", title: "Senior SRE" },
      { ...jobs[0], id: "eu", slug: "eu", location: "Remote Netherlands", title: "Staff Engineer" },
    ];
    expect(filterJobs(localized, { ...EMPTY_FILTER, region: "US" }).map((j) => j.id)).toEqual(["us"]);
    expect(filterJobs(localized, { ...EMPTY_FILTER, level: "staff" }).map((j) => j.id)).toEqual(["eu"]);
  });
});

describe("regionOf", () => {
  it("recognizes the regions in the data", () => {
    expect(regionOf("Salt Lake City, Utah, United States")).toBe("US");
    expect(regionOf("Patrick SFB, FL or Arlington, VA")).toBe("US");
    expect(regionOf("Remote Netherlands")).toBe("Europe");
    expect(regionOf("São Paulo")).toBe("LATAM");
    expect(regionOf("Seoul, Korea")).toBe("Asia");
    expect(regionOf("Global Remote / San Francisco, CA")).toBe("US");
    expect(regionOf("Anywhere")).toBe("Global");
  });
});

describe("levelOf", () => {
  it("derives seniority from titles, most specific first", () => {
    expect(levelOf("Software Engineer, New Grad - Production Infrastructure")).toBe("junior");
    expect(levelOf("Cloud Engineer")).toBe("mid");
    expect(levelOf("Senior Site Reliability Engineer (SRE)")).toBe("senior");
    expect(levelOf("Staff DevOps Engineer")).toBe("staff");
    expect(levelOf("Principal Customer Solutions Architect")).toBe("principal");
    expect(levelOf("Senior Engineering Manager")).toBe("manager");
    expect(levelOf("DevOps Database Assistant Vice President")).toBe("manager");
  });
});

describe("URL round-trip", () => {
  it("serializes only active parts", () => {
    expect(toQueryString(EMPTY_FILTER)).toBe("");
    expect(
      toQueryString({ q: "sre", mode: "remote", region: "US", level: "senior", tags: ["AWS", "Go"] })
    ).toBe("?q=sre&mode=remote&region=US&level=senior&tags=AWS%2CGo");
  });

  it("parses back what it serialized", () => {
    const f = {
      q: "sre",
      mode: "remote" as const,
      region: "US" as const,
      level: "senior" as const,
      tags: ["AWS", "Go"],
    };
    const parsed = parseFilter(new URLSearchParams(toQueryString(f)));
    expect(parsed).toEqual(f);
  });

  it("ignores junk mode values", () => {
    expect(parseFilter(new URLSearchParams("?mode=pyramid")).mode).toBe("all");
  });

  it("knows when nothing is active", () => {
    expect(isEmptyFilter(EMPTY_FILTER)).toBe(true);
    expect(isEmptyFilter({ ...EMPTY_FILTER, q: "x" })).toBe(false);
  });
});
