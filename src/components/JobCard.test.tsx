// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/types/job";

const job: Job = {
  id: "hand-picked-example-1",
  slug: "example-corp-site-reliability-engineer",
  title: "Site Reliability Engineer",
  company: "Example Corp",
  location: "Remote - US",
  workMode: "remote",
  tags: ["AWS", "Kubernetes"],
  url: "https://example.com/careers/sre",
  source: "hand-picked",
  postedAt: new Date().toISOString().slice(0, 10),
};

afterEach(cleanup);

describe("JobCard", () => {
  it("shows the core job facts", () => {
    render(<JobCard job={job} />);
    expect(screen.getByText("Site Reliability Engineer")).toBeTruthy();
    expect(screen.getByText("Example Corp")).toBeTruthy();
    expect(screen.getByText("Remote - US")).toBeTruthy();
    expect(screen.getByText("AWS")).toBeTruthy();
    expect(screen.getByText("Kubernetes")).toBeTruthy();
  });

  it("links the whole card to the role's page on this site", () => {
    render(<JobCard job={job} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/jobs/example-corp-site-reliability-engineer");
  });

  it("badges fresh listings as new", () => {
    render(<JobCard job={job} />);
    expect(screen.getByText(/new/)).toBeTruthy();
  });

  it("does not badge older listings", () => {
    render(<JobCard job={{ ...job, postedAt: "2026-01-01" }} />);
    expect(screen.queryByText(/new/)).toBeNull();
  });

  it("shows the salary when present", () => {
    render(<JobCard job={{ ...job, salary: "$140k–$180k" }} />);
    expect(screen.getByText(/\$140k–\$180k/)).toBeTruthy();
  });
});
