import { describe, expect, it } from "vitest";
import { mapUsaJobsItem } from "./usajobs";

// Shaped like a real USAJobs Search API item (documented fields only).
const fixture = {
  MatchedObjectDescriptor: {
    PositionID: "AF-25-12345",
    PositionTitle: "IT Specialist (DevOps)",
    PositionURI: "https://www.usajobs.gov/job/812345600",
    PositionLocationDisplay: "Anywhere in the U.S. (remote job)",
    OrganizationName: "Department of the Air Force",
    PublicationStartDate: "2026-07-15T00:00:00.0000000",
    ApplicationCloseDate: "2026-08-01T23:59:59.0000000",
    PositionRemuneration: [
      { MinimumRange: "105000", MaximumRange: "135000", RateIntervalCode: "PA" },
    ],
    PositionSchedule: [{ Name: "Full-time" }],
    UserArea: {
      Details: {
        JobSummary: "Build and maintain Kubernetes-based CI/CD pipelines on AWS GovCloud.",
      },
    },
  },
};

describe("mapUsaJobsItem", () => {
  it("maps a federal posting onto the Job shape", () => {
    const job = mapUsaJobsItem(fixture);
    expect(job).toMatchObject({
      id: "usajobs-AF-25-12345",
      title: "IT Specialist (DevOps)",
      company: "Department of the Air Force",
      workMode: "remote",
      url: "https://www.usajobs.gov/job/812345600",
      source: "usajobs",
      postedAt: "2026-07-15",
      employmentType: "Full-time",
      salary: "$105k–$135k",
    });
    expect(job?.description).toContain("Kubernetes-based CI/CD");
    expect(job?.description).toContain("Applications close 2026-08-01");
  });

  it("returns null for items missing essentials", () => {
    expect(mapUsaJobsItem({ MatchedObjectDescriptor: { PositionTitle: "X" } })).toBeNull();
    expect(mapUsaJobsItem(undefined)).toBeNull();
  });

  it("treats located roles as onsite without inventing salary", () => {
    const onsite = structuredClone(fixture);
    onsite.MatchedObjectDescriptor.PositionLocationDisplay = "Colorado Springs, Colorado";
    (onsite.MatchedObjectDescriptor.PositionRemuneration as unknown[]) = [];
    const job = mapUsaJobsItem(onsite);
    expect(job?.workMode).toBe("onsite");
    expect(job?.salary).toBeUndefined();
  });
});
