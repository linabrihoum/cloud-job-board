import { describe, expect, it } from "vitest";
import { loadJobs, parseJobs, tagsInUse } from "@/lib/jobs";
import type { Job } from "@/types/job";

const validJob: Job = {
  id: "hand-picked-example-1",
  slug: "example-corp-site-reliability-engineer",
  title: "Site Reliability Engineer",
  company: "Example Corp",
  location: "Anywhere",
  workMode: "remote",
  tags: ["AWS", "Kubernetes"],
  url: "https://example.com/careers/sre",
  source: "hand-picked",
  postedAt: "2026-07-18",
};

function asFile(jobs: unknown[]): string {
  return JSON.stringify(jobs);
}

describe("loadJobs", () => {
  it("loads the real jobs.json without errors", () => {
    const jobs = loadJobs();
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("returns jobs sorted newest-first", () => {
    const jobs = loadJobs();
    const dates = jobs.map((j) => j.postedAt);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});

describe("parseJobs validation", () => {
  it("accepts a valid job", () => {
    expect(parseJobs(asFile([validJob]))).toHaveLength(1);
  });

  it("rejects a tag that is not in the canonical list", () => {
    const bad = { ...validJob, tags: ["Blockchain"] };
    expect(() => parseJobs(asFile([bad]))).toThrow(/entry 0/);
  });

  it("rejects an invalid URL", () => {
    const bad = { ...validJob, url: "not-a-url" };
    expect(() => parseJobs(asFile([bad]))).toThrow(/entry 0.*url/s);
  });

  it("rejects a malformed posting date", () => {
    const bad = { ...validJob, postedAt: "July 18, 2026" };
    expect(() => parseJobs(asFile([bad]))).toThrow(/postedAt/);
  });

  it("accepts an empty tag list (tags are best-effort)", () => {
    const untagged = { ...validJob, tags: [] };
    expect(parseJobs(asFile([untagged]))).toHaveLength(1);
  });

  it("rejects duplicate ids", () => {
    expect(() => parseJobs(asFile([validJob, validJob]))).toThrow(/Duplicate job id/);
  });

  it("rejects duplicate slugs", () => {
    const other = { ...validJob, id: "hand-picked-example-2" };
    expect(() => parseJobs(asFile([validJob, other]))).toThrow(/Duplicate job slug/);
  });

  it("rejects a malformed slug", () => {
    const bad = { ...validJob, slug: "Not A Slug!" };
    expect(() => parseJobs(asFile([bad]))).toThrow(/entry 0.*slug/s);
  });
});

describe("tagsInUse", () => {
  it("returns only tags present in the data, in canonical order", () => {
    const jobs = parseJobs(
      asFile([
        { ...validJob, id: "a", slug: "job-a", tags: ["Kubernetes"] },
        { ...validJob, id: "b", slug: "job-b", tags: ["AWS", "Kubernetes"] },
      ])
    );
    expect(tagsInUse(jobs)).toEqual(["AWS", "Kubernetes"]);
  });
});
