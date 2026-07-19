/** Fetchers for the three supported hiring systems. Each returns the
 * company's live postings in one normalized raw shape. */

export type Ats = "greenhouse" | "lever" | "ashby" | "workable" | "smartrecruiters";

export interface RawPosting {
  /** Direct URL of the posting on the company's own board. */
  url: string;
  title: string;
  location: string;
  /** ISO date (YYYY-MM-DD) the posting was published/updated. */
  postedAt: string;
  /** Raw HTML description (entity-decoded). */
  html: string;
  employmentType?: string;
  salary?: string;
  /** Workable: shortcode for the per-job detail fetch. */
  _shortcode?: string;
  /** SmartRecruiters: posting id for the per-job detail fetch. */
  _detailId?: string;
}

export interface Board {
  /** Company display name, best-effort. */
  name: string;
  postings: RawPosting[];
}

async function get(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { "user-agent": "cloud-job-board (github.com/linabrihoum/cloud-job-board)" } });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.json();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function prettifySlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function fetchBoard(ats: Ats, slug: string): Promise<Board> {
  if (ats === "greenhouse") {
    const data = (await get(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`)) as any;
    let name = prettifySlug(slug);
    try {
      const meta = (await get(`https://boards-api.greenhouse.io/v1/boards/${slug}`)) as any;
      if (meta?.name) name = String(meta.name).trim();
    } catch {
      // board meta is optional
    }
    return {
      name,
      postings: (data.jobs ?? []).map((j: any) => ({
        url: j.absolute_url,
        title: j.title ?? "",
        location: j.location?.name ?? "",
        postedAt: (j.updated_at ?? j.first_published ?? "").slice(0, 10),
        html: decodeEntities(j.content ?? ""),
      })),
    };
  }

  if (ats === "lever") {
    const data = (await get(`https://api.lever.co/v0/postings/${slug}?mode=json`)) as any[];
    return {
      name: prettifySlug(slug),
      postings: data.map((j: any) => ({
        url: j.hostedUrl,
        title: j.text ?? "",
        location: j.categories?.location ?? "",
        postedAt: j.createdAt ? new Date(j.createdAt).toISOString().slice(0, 10) : "",
        html:
          (j.description ?? "") +
          (j.lists ?? []).map((l: any) => `<h3>${l.text}</h3><ul>${l.content}</ul>`).join("") +
          (j.additional ?? ""),
        employmentType: j.categories?.commitment
          ?.replace(/full[ -]?time.*/i, "Full-time")
          .replace(/part[ -]?time.*/i, "Part-time"),
        salary:
          j.salaryRange?.min && j.salaryRange?.max
            ? formatSalary(j.salaryRange.min, j.salaryRange.max, j.salaryRange.currency)
            : undefined,
      })),
    };
  }

  if (ats === "ashby") {
    const data = (await get(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`)) as any;
    return {
      name: prettifySlug(slug),
      postings: (data.jobs ?? []).map((j: any) => ({
        url: j.jobUrl,
        title: j.title ?? "",
        location: j.location ?? "",
        postedAt: (j.publishedAt ?? "").slice(0, 10),
        html: j.descriptionHtml ?? "",
        employmentType: j.employmentType
          ?.replace(/fulltime/i, "Full-time")
          .replace(/parttime/i, "Part-time"),
        salary: j.compensation?.compensationTierSummary?.replace(/ per year.*$/i, "") || undefined,
      })),
    };
  }

  if (ats === "workable") {
    // v3 list; per-job detail (fetched later, only for relevant titles)
    const post = () =>
      fetch(`https://apply.workable.com/api/v3/accounts/${slug}/jobs`, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "cloud-job-board" },
        body: JSON.stringify({ query: "", location: [], department: [], worktype: [], remote: [] }),
      });
    let res = await post();
    if (res.status === 429) {
      // rate-limited: back off once, politely
      await new Promise((r) => setTimeout(r, 8000));
      res = await post();
    }
    if (!res.ok) throw new Error(`${res.status} for workable/${slug}`);
    const data = (await res.json()) as any;
    return {
      name: prettifySlug(slug),
      postings: (data.results ?? []).map((j: any) => ({
        url: `https://apply.workable.com/${slug}/j/${j.shortcode}/`,
        title: j.title ?? "",
        location: [j.location?.city, j.location?.country, j.remote ? "Remote" : ""]
          .filter(Boolean)
          .join(", "),
        postedAt: (j.published ?? "").slice(0, 10),
        html: "", // filled by fetchWorkableDescription for kept jobs
        employmentType: j.type === "full" ? "Full-time" : j.type === "part" ? "Part-time" : undefined,
        _shortcode: j.shortcode,
      })),
    };
  }

  // smartrecruiters: list + per-posting detail (only for relevant titles)
  const data = (await get(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`)) as any;
  const name = String(data.content?.[0]?.company?.name ?? prettifySlug(slug)).trim();
  return {
    name,
    postings: (data.content ?? []).map((j: any) => ({
      url: `https://jobs.smartrecruiters.com/${slug}/${j.id}`,
      title: j.name ?? "",
      location: [
        j.location?.fullLocation ?? [j.location?.city, j.location?.country?.toUpperCase()].filter(Boolean).join(", "),
        j.location?.remote ? "Remote" : "",
      ]
        .filter(Boolean)
        .join(" · "),
      postedAt: (j.releasedDate ?? "").slice(0, 10),
      html: "", // filled by fetchSmartRecruitersDetail for kept jobs
      _detailId: j.id,
    })),
  };
}

/** Detail fetch for a kept Workable job: description HTML + canonical URL. */
export async function fetchWorkableDetail(slug: string, shortcode: string): Promise<string> {
  try {
    const j = (await get(`https://apply.workable.com/api/v2/accounts/${slug}/jobs/${shortcode}`)) as any;
    return [j.description, j.requirements, j.benefits].filter(Boolean).join("");
  } catch {
    return "";
  }
}

/** Detail fetch for a kept SmartRecruiters job: description HTML, real
 * posting URL, and employment type. */
export async function fetchSmartRecruitersDetail(
  slug: string,
  id: string
): Promise<{ html: string; url?: string; employmentType?: string }> {
  try {
    const j = (await get(`https://api.smartrecruiters.com/v1/companies/${slug}/postings/${id}`)) as any;
    const sections = j.jobAd?.sections ?? {};
    const html = ["jobDescription", "qualifications", "additionalInformation"]
      .map((k) => {
        const s = sections[k];
        return s?.text ? `<h3>${s.title ?? ""}</h3>${s.text}` : "";
      })
      .join("");
    return { html, url: j.postingUrl, employmentType: j.typeOfEmployment?.label };
  } catch {
    return { html: "" };
  }
}

function formatSalary(min: number, max: number, currency?: string): string {
  const sym = !currency || currency === "USD" ? "$" : `${currency} `;
  const fmt = (n: number) => (n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`);
  return `${fmt(min)}–${fmt(max)}`;
}
