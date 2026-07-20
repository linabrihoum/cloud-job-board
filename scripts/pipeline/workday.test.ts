import { describe, expect, it } from "vitest";
import { parseWorkdayPostedOn, parseWorkdaySlug } from "./ats";
import { extractBoards } from "./discover";

describe("parseWorkdaySlug", () => {
  it("splits tenant:host:site", () => {
    expect(parseWorkdaySlug("cvshealth:wd1:CVS_Health_Careers")).toEqual({
      tenant: "cvshealth",
      host: "wd1",
      site: "CVS_Health_Careers",
    });
  });

  it("rejects malformed slugs", () => {
    expect(parseWorkdaySlug("cvshealth:wd1")).toBeNull();
    expect(parseWorkdaySlug("nope")).toBeNull();
  });
});

describe("parseWorkdayPostedOn", () => {
  const now = new Date("2026-07-19T12:00:00Z");
  it("reads relative posting text into ISO dates", () => {
    expect(parseWorkdayPostedOn("Posted Today", now)).toBe("2026-07-19");
    expect(parseWorkdayPostedOn("Posted Yesterday", now)).toBe("2026-07-18");
    expect(parseWorkdayPostedOn("Posted 7 Days Ago", now)).toBe("2026-07-12");
    expect(parseWorkdayPostedOn("Posted 30+ Days Ago", now)).toBe("2026-06-19");
  });
});

describe("Workday discovery", () => {
  it("extracts tenant/host/site as a composite slug from a myworkdayjobs URL", () => {
    const text = "Apply: https://cvshealth.wd1.myworkdayjobs.com/CVS_Health_Careers/job/RI/Foo_R1";
    expect(extractBoards(text)).toContainEqual({
      ats: "workday",
      slug: "cvshealth:wd1:CVS_Health_Careers",
    });
  });

  it("handles a locale segment in the path", () => {
    const text = "https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite";
    expect(extractBoards(text)).toContainEqual({
      ats: "workday",
      slug: "nvidia:wd5:NVIDIAExternalCareerSite",
    });
  });
});
