import { describe, expect, it } from "vitest";
import { nextBatch, parseLandscape, parseMarkdownCompanies } from "./directories";

describe("nextBatch", () => {
  const list = ["a", "b", "c", "d", "e"];

  it("takes a batch and advances the cursor", () => {
    expect(nextBatch(list, 0, 2)).toEqual({ batch: ["a", "b"], next: 2 });
    expect(nextBatch(list, 2, 2)).toEqual({ batch: ["c", "d"], next: 4 });
  });

  it("wraps around the end of the list", () => {
    expect(nextBatch(list, 4, 2)).toEqual({ batch: ["e", "a"], next: 1 });
  });

  it("handles empty lists and oversized batches", () => {
    expect(nextBatch([], 3, 10)).toEqual({ batch: [], next: 0 });
    expect(nextBatch(list, 1, 99).batch).toHaveLength(5);
  });
});

describe("parseMarkdownCompanies", () => {
  it("extracts company name + website from list and table entries", () => {
    const md = [
      "- [Acme Cloud](https://acmecloud.com) | NYC | Platform stuff",
      "| [Globex](https://www.globex.io/) | Remote | SRE |",
      "[Contributing](CONTRIBUTING.md) [Badge](https://shields.io/x.svg)",
      "- [Back to top](https://example.com#top)",
    ].join("\n");
    const companies = parseMarkdownCompanies(md);
    expect(companies).toContainEqual({ name: "Acme Cloud", website: "acmecloud.com" });
    expect(companies).toContainEqual({ name: "Globex", website: "globex.io" });
    expect(companies).toHaveLength(2);
  });

  it("handles remote-jobs style rows (relative profile link + bare URL cell)", () => {
    const md = "| [Initech](/company-profiles/initech.md) | https://initech.dev | Worldwide |";
    expect(parseMarkdownCompanies(md)).toContainEqual({ name: "Initech", website: "initech.dev" });
  });
});

describe("parseLandscape", () => {
  it("extracts item names and homepages from landscape yaml", () => {
    const yml = [
      "landscape:",
      "  - category:",
      "    name: Provisioning",
      "    subcategories:",
      "      - subcategory:",
      "        name: Automation",
      "        items:",
      "          - item:",
      "            name: CoolCloud Co",
      "            homepage_url: https://www.coolcloud.io/",
      "            crunchbase: https://www.crunchbase.com/organization/coolcloud",
      "          - item:",
      "            name: 'Quoted Corp'",
      "            homepage_url: https://quoted.dev",
    ].join("\n");
    expect(parseLandscape(yml)).toEqual([
      { name: "CoolCloud Co", website: "coolcloud.io" },
      { name: "Quoted Corp", website: "quoted.dev" },
    ]);
  });

  it("dedupes repeated names", () => {
    const yml = [
      "          - item:",
      "            name: Repeat Inc",
      "            homepage_url: https://repeat.com",
      "          - item:",
      "            name: Repeat Inc",
      "            homepage_url: https://repeat.org",
    ].join("\n");
    expect(parseLandscape(yml)).toHaveLength(1);
  });
});
