// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JobBoard } from "@/components/JobBoard";
import type { Job } from "@/types/job";

const base = {
  location: "Anywhere",
  url: "https://example.com/x",
  source: "hand-picked" as const,
  postedAt: "2026-07-18",
};

const jobs: Job[] = [
  { ...base, id: "a", slug: "a", title: "Senior SRE", company: "Acme", workMode: "remote", tags: ["AWS"] },
  { ...base, id: "b", slug: "b", title: "Cloud Engineer", company: "Globex", workMode: "onsite", tags: ["GCP"] },
];

const allTags = ["AWS", "GCP"];

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/jobs");
});

describe("JobBoard", () => {
  it("shows all jobs with no filters", () => {
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.getByText("Cloud Engineer")).toBeTruthy();
  });

  it("typing a keyword narrows the list", () => {
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    fireEvent.change(screen.getByLabelText("Search jobs"), { target: { value: "sre" } });
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.queryByText("Cloud Engineer")).toBeNull();
  });

  it("work-mode dropdown narrows the list and updates the URL", () => {
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    fireEvent.click(screen.getByRole("button", { name: /Work mode/ }));
    fireEvent.click(screen.getByRole("option", { name: "On-site" }));
    expect(screen.queryByText("Senior SRE")).toBeNull();
    expect(screen.getByText("Cloud Engineer")).toBeTruthy();
    expect(window.location.search).toContain("mode=onsite");
  });

  it("typing inside the technology dropdown filters its options", () => {
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    fireEvent.click(screen.getByRole("button", { name: /Technology/ }));
    fireEvent.change(screen.getByLabelText("Search technology"), { target: { value: "aw" } });
    expect(screen.getByRole("option", { name: /AWS/ })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /GCP/ })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /AWS/ }));
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.queryByText("Cloud Engineer")).toBeNull();
  });

  it("applies a filter already present in the URL on mount", () => {
    window.history.replaceState(null, "", "/jobs?mode=onsite");
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    expect(screen.queryByText("Senior SRE")).toBeNull();
    expect(screen.getByText("Cloud Engineer")).toBeTruthy();
  });

  it("shows the no-matches state and clears filters", () => {
    render(<JobBoard jobs={jobs} allTags={allTags} />);
    fireEvent.change(screen.getByLabelText("Search jobs"), { target: { value: "zzz" } });
    expect(screen.getByText(/No matches/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Clear filters/ }));
    expect(screen.getByText("Senior SRE")).toBeTruthy();
  });
});
