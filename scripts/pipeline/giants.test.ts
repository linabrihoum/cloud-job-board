import { describe, expect, it } from "vitest";
import { mapAmazonJob, mapNetflixPosition } from "./giants";

describe("mapAmazonJob", () => {
  const raw = {
    id: "10390514",
    title: "  DevOps Engineer,  EKS ",
    job_path: "/en/jobs/10390514/devops-engineer-eks",
    business_category: "aws",
    normalized_location: "Seattle, Washington, USA",
    location: "us, wa, seattle",
    posted_date: "April 13, 2026",
    job_schedule_type: "full-time",
    description: "<p>Run Kubernetes clusters at scale on AWS. Range: $120,000 - $180,000</p>",
    basic_qualifications: "<p>Linux, Terraform</p>",
  };

  it("maps an AWS role with salary extracted from the description", () => {
    const job = mapAmazonJob(raw);
    expect(job).toMatchObject({
      id: "amazon-10390514",
      title: "DevOps Engineer, EKS",
      company: "Amazon Web Services (AWS)",
      companyWebsite: "aws.amazon.com",
      url: "https://www.amazon.jobs/en/jobs/10390514/devops-engineer-eks",
      source: "amazon",
      postedAt: "2026-04-13",
      employmentType: "Full-time",
      salary: "$120k–$180k",
    });
    expect(job?.tags).toContain("Kubernetes");
    expect(job?.tags).toContain("AWS");
  });

  it("labels non-AWS categories as Amazon and rejects incomplete items", () => {
    expect(mapAmazonJob({ ...raw, business_category: "operations" })?.company).toBe("Amazon");
    expect(mapAmazonJob({ title: "X" })).toBeNull();
  });
});

describe("mapNetflixPosition", () => {
  const raw = {
    id: 790316857527,
    name: "Site Reliability Engineer 5",
    canonicalPositionUrl: "https://explore.jobs.netflix.net/careers/job/790316857527",
    location: "Los Gatos,California,United States of America",
    t_create: 1781481600,
    display_job_id: "JR-1234",
    work_location_option: "remote",
    job_description: "<p>Keep Netflix streaming. We use Kafka and Python heavily.</p>",
  };

  it("maps a Netflix position", () => {
    const job = mapNetflixPosition(raw);
    expect(job).toMatchObject({
      id: "netflix-790316857527",
      title: "Site Reliability Engineer 5",
      company: "Netflix",
      companyWebsite: "netflix.com",
      location: "Los Gatos, California, United States of America",
      workMode: "remote",
      url: "https://explore.jobs.netflix.net/careers/job/790316857527",
      source: "netflix",
      postedAt: "2026-06-15",
    });
    expect(job?.tags).toEqual(expect.arrayContaining(["Kafka", "Python"]));
  });

  it("rejects incomplete positions", () => {
    expect(mapNetflixPosition({ name: "X" })).toBeNull();
  });
});
