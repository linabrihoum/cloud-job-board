// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JobBoard } from "@/components/JobBoard";
import type { Job } from "@/types/job";

// The board reads filter state from the URL via next/navigation; simulate
// that with a tiny in-memory router.
let currentQuery = "";
vi.mock("next/navigation", () => ({
  usePathname: () => "/jobs",
  useSearchParams: () => new URLSearchParams(currentQuery),
  useRouter: () => ({
    replace: (url: string) => {
      currentQuery = url.includes("?") ? url.slice(url.indexOf("?")) : "";
      rerender();
    },
  }),
}));

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

let doRender: () => void = () => {};
function rerender() {
  doRender();
}

const allTags = ["AWS", "GCP"];

function renderBoard() {
  const view = render(<JobBoard jobs={jobs} allTags={allTags} />);
  doRender = () => view.rerender(<JobBoard jobs={jobs} allTags={allTags} />);
  return view;
}

afterEach(() => {
  cleanup();
  currentQuery = "";
});

describe("JobBoard", () => {
  it("shows all jobs with no filters", () => {
    renderBoard();
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.getByText("Cloud Engineer")).toBeTruthy();
  });

  it("typing a keyword narrows the list", () => {
    renderBoard();
    fireEvent.change(screen.getByLabelText("Search jobs"), { target: { value: "sre" } });
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.queryByText("Cloud Engineer")).toBeNull();
  });

  it("work-mode dropdown narrows the list", () => {
    renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /Work mode/ }));
    fireEvent.click(screen.getByRole("option", { name: "On-site" }));
    expect(screen.queryByText("Senior SRE")).toBeNull();
    expect(screen.getByText("Cloud Engineer")).toBeTruthy();
  });

  it("typing inside the technology dropdown filters its options", () => {
    renderBoard();
    fireEvent.click(screen.getByRole("button", { name: /Technology/ }));
    fireEvent.change(screen.getByLabelText("Search technology"), { target: { value: "aw" } });
    expect(screen.getByRole("option", { name: /AWS/ })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /GCP/ })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /AWS/ }));
    expect(screen.getByText("Senior SRE")).toBeTruthy();
    expect(screen.queryByText("Cloud Engineer")).toBeNull();
  });

  it("shows the no-matches state and clears filters", () => {
    renderBoard();
    fireEvent.change(screen.getByLabelText("Search jobs"), { target: { value: "zzz" } });
    expect(screen.getByText(/No matches/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Clear filters/ }));
    expect(screen.getByText("Senior SRE")).toBeTruthy();
  });
});
