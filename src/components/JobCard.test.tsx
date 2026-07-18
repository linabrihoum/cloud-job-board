// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/types/job";

const job: Job = {
  id: "hand-picked-example-1",
  title: "Site Reliability Engineer",
  company: "Example Corp",
  location: "Remote - US",
  workMode: "remote",
  tags: ["SRE", "Kubernetes"],
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
    expect(screen.getByText("SRE")).toBeTruthy();
    expect(screen.getByText("Kubernetes")).toBeTruthy();
  });

  it("links the whole card to the company posting in a new tab", () => {
    render(<JobCard job={job} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("https://example.com/careers/sre");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("badges fresh listings as new", () => {
    render(<JobCard job={job} />);
    expect(screen.getByText("new")).toBeTruthy();
  });

  it("does not badge older listings", () => {
    render(<JobCard job={{ ...job, postedAt: "2026-01-01" }} />);
    expect(screen.queryByText("new")).toBeNull();
  });
});
