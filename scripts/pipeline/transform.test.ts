import { describe, expect, it } from "vitest";
import type { Job } from "@/types/job";
import {
  dedupeJobs,
  dropStale,
  isRelevantTitle,
  mapPostingToJob,
  slugify,
  uniqueSlugs,
  workModeOf,
} from "./transform";

describe("isRelevantTitle", () => {
  it("accepts cloud/SRE/platform/DevOps roles", () => {
    expect(isRelevantTitle("Senior Site Reliability Engineer")).toBe(true);
    expect(isRelevantTitle("DevOps Engineer II")).toBe(true);
    expect(isRelevantTitle("Platform Engineer")).toBe(true);
    expect(isRelevantTitle("Cloud Infrastructure Engineer")).toBe(true);
  });

  it("rejects unrelated roles even from tech companies", () => {
    expect(isRelevantTitle("Product Designer")).toBe(false);
    expect(isRelevantTitle("Account Executive")).toBe(false);
    expect(isRelevantTitle("Pool Technician I")).toBe(false);
    expect(isRelevantTitle("Frontend Engineer")).toBe(false);
  });
});

describe("mapPostingToJob", () => {
  it("maps a raw posting onto the Job shape", () => {
    const job = mapPostingToJob(
      {
        url: "https://job-boards.greenhouse.io/acme/jobs/12345",
        title: "  Senior   SRE ",
        location: "Remote - US",
        postedAt: "2026-07-10",
        html: "<p>We use <b>Kubernetes</b> and Terraform.</p>",
      },
      {
        ats: "greenhouse",
        boardSlug: "acme",
        companyName: "Acme",
        companyWebsite: "acme.com",
        htmlToMd: () => "We use **Kubernetes** and Terraform.",
      }
    );
    expect(job).toMatchObject({
      id: "greenhouse-acme-12345",
      slug: "acme-senior-sre",
      title: "Senior SRE",
      company: "Acme",
      companyWebsite: "acme.com",
      workMode: "remote",
      source: "greenhouse",
      tags: ["Kubernetes", "Terraform"],
    });
  });
});

describe("dedupe, staleness, slug uniqueness", () => {
  const job = (overrides: Partial<Job>): Job => ({
    id: "x",
    slug: "x",
    title: "SRE",
    company: "Acme",
    location: "Anywhere",
    workMode: "remote",
    tags: [],
    url: "https://example.com/x",
    source: "greenhouse",
    postedAt: "2026-07-10",
    ...overrides,
  });

  it("keeps the newest of duplicate company+title", () => {
    const out = dedupeJobs([
      job({ id: "old", postedAt: "2026-06-01" }),
      job({ id: "new", postedAt: "2026-07-01" }),
    ]);
    expect(out.map((j) => j.id)).toEqual(["new"]);
  });

  it("drops listings older than the cutoff", () => {
    const now = new Date("2026-07-18");
    const out = dropStale(
      [job({ id: "fresh", postedAt: "2026-07-01" }), job({ id: "stale", postedAt: "2026-01-01" })],
      45,
      now
    );
    expect(out.map((j) => j.id)).toEqual(["fresh"]);
  });

  it("suffixes colliding slugs", () => {
    const out = uniqueSlugs([job({ id: "a", slug: "acme-sre" }), job({ id: "b", slug: "acme-sre" })]);
    expect(out.map((j) => j.slug)).toEqual(["acme-sre", "acme-sre-2"]);
  });
});

describe("small helpers", () => {
  it("slugifies", () => {
    expect(slugify("Senior SRE & Platform (K8s)")).toBe("senior-sre-and-platform-k8s");
  });
  it("derives work mode", () => {
    expect(workModeOf("Remote - Europe")).toBe("remote");
    expect(workModeOf("Chicago, IL")).toBe("onsite");
  });
});
