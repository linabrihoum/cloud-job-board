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

  it("accepts the adjacent infra roles added by request", () => {
    expect(isRelevantTitle("Cloud Security Engineer")).toBe(true);
    expect(isRelevantTitle("DevSecOps Engineer")).toBe(true);
    expect(isRelevantTitle("Observability Engineer")).toBe(true);
    expect(isRelevantTitle("Senior Network Engineer")).toBe(true);
    expect(isRelevantTitle("Release Engineer")).toBe(true);
  });

  it("rejects unrelated roles even from tech companies", () => {
    expect(isRelevantTitle("Product Designer")).toBe(false);
    expect(isRelevantTitle("Account Executive")).toBe(false);
    expect(isRelevantTitle("Pool Technician I")).toBe(false);
    expect(isRelevantTitle("Frontend Engineer")).toBe(false);
  });

  it("rejects hardware/aerospace roles that reuse infra words", () => {
    expect(isRelevantTitle("Lead Hardware Reliability Engineer, Electrical")).toBe(false);
    expect(isRelevantTitle("Data & Control Systems Engineer")).toBe(false);
    expect(isRelevantTitle("Avionics Systems Engineer")).toBe(false);
    expect(isRelevantTitle("Specialist Solutions Architect, Radar (Fraud/Risk)")).toBe(false);
    expect(isRelevantTitle("Equipment Reliability Engineer (Starlink)")).toBe(false);
    expect(isRelevantTitle("Sr. Fluids Systems Engineer, Solar Cell Factory")).toBe(false);
    expect(isRelevantTitle("Launch Reliability Engineer (Launch Pads & Recovery)")).toBe(false);
    expect(isRelevantTitle("IT Windows Systems Engineer")).toBe(false);
    expect(isRelevantTitle("Reliability Engineer, Facilities")).toBe(false);
  });

  it("still accepts real SRE roles at hardware companies", () => {
    expect(isRelevantTitle("Sr. Site Reliability Engineer (Application Software)")).toBe(true);
    expect(isRelevantTitle("Sr. Kubernetes Engineer")).toBe(true);
    expect(isRelevantTitle("Software Engineer, DevOps (Starlink)")).toBe(true);
    expect(isRelevantTitle("Field Reliability Engineer- LATAM")).toBe(true);
    expect(isRelevantTitle("Sr. Database Reliability Engineer")).toBe(true);
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
