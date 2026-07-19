import { describe, expect, it } from "vitest";
import { extractBoards } from "./discover";

describe("extractBoards", () => {
  it("finds greenhouse, lever, and ashby board links in text", () => {
    const text = `
      We're hiring! https://boards.greenhouse.io/coolstartup/jobs/123
      Apply at https://jobs.lever.co/rocketco/abc-def
      Also https://jobs.ashbyhq.com/tinycloud and
      https://job-boards.eu.greenhouse.io/eucompany/jobs/9
      embed style: https://greenhouse.io/embed/job_board?for=embedco&b=x
    `;
    const boards = extractBoards(text);
    expect(boards).toContainEqual({ ats: "greenhouse", slug: "coolstartup" });
    expect(boards).toContainEqual({ ats: "greenhouse", slug: "eucompany" });
    expect(boards).toContainEqual({ ats: "greenhouse", slug: "embedco" });
    expect(boards).toContainEqual({ ats: "lever", slug: "rocketco" });
    expect(boards).toContainEqual({ ats: "ashby", slug: "tinycloud" });
  });

  it("dedupes and skips non-slug path segments", () => {
    const text = `
      https://boards.greenhouse.io/acme https://boards.greenhouse.io/acme
      https://jobs.lever.co/jobs
    `;
    const boards = extractBoards(text);
    expect(boards).toEqual([{ ats: "greenhouse", slug: "acme" }]);
  });

  it("returns nothing from plain text", () => {
    expect(extractBoards("no links here, just vibes")).toEqual([]);
  });

  it("decodes HN-style entity-encoded URLs", () => {
    const text = "Apply: https:&#x2F;&#x2F;boards.greenhouse.io&#x2F;novacredit and mention HN";
    expect(extractBoards(text)).toEqual([{ ats: "greenhouse", slug: "novacredit" }]);
  });
});
