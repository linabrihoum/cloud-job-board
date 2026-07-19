import { describe, expect, it } from "vitest";
import { candidateDomains, mineWebsiteFromHtml } from "./logos";

describe("mineWebsiteFromHtml", () => {
  it("finds the company's own domain among description links", () => {
    const html = `
      <p>Read more at <a href="https://www.supabase.com/careers">our careers page</a>
      or on <a href="https://linkedin.com/company/supabase">LinkedIn</a>.</p>
    `;
    expect(mineWebsiteFromHtml(html, "Supabase")).toBe("supabase.com");
  });

  it("skips ATS, social, and unrelated domains", () => {
    const html = `
      <a href="https://boards.greenhouse.io/acme">apply</a>
      <a href="https://github.com/acme">code</a>
      <a href="https://totallyunrelated.com">benefits provider</a>
    `;
    expect(mineWebsiteFromHtml(html, "Acme Corp")).toBeUndefined();
  });

  it("matches loose name variants", () => {
    const html = `<a href="https://obsidiansecurity.com/about">about us</a>`;
    expect(mineWebsiteFromHtml(html, "Obsidian Security")).toBe("obsidiansecurity.com");
  });
});

describe("candidateDomains", () => {
  it("builds candidates from the normalized name", () => {
    expect(candidateDomains("Pave Bank")).toEqual([
      "pavebank.com",
      "pavebank.io",
      "pavebank.ai",
      "pavebank.dev",
    ]);
  });

  it("refuses names too short to guess safely", () => {
    expect(candidateDomains("Ro")).toEqual([]);
  });
});
