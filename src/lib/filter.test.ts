import { describe, expect, it } from "vitest";
import { EMPTY_FILTER, filterJobs, isEmptyFilter, parseFilter, toQueryString } from "@/lib/filter";
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
    const f = { q: "engineer", mode: "remote" as const, tags: ["AWS"] };
    expect(filterJobs(jobs, f).map((j) => j.id)).toEqual(["c"]);
  });
});

describe("URL round-trip", () => {
  it("serializes only active parts", () => {
    expect(toQueryString(EMPTY_FILTER)).toBe("");
    expect(toQueryString({ q: "sre", mode: "remote", tags: ["AWS", "Go"] })).toBe(
      "?q=sre&mode=remote&tags=AWS%2CGo"
    );
  });

  it("parses back what it serialized", () => {
    const f = { q: "sre", mode: "remote" as const, tags: ["AWS", "Go"] };
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
