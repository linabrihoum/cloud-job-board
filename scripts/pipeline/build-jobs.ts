/**
 * The daily job pipeline. Run with `npm run update-jobs`.
 *
 * 1. Discover new company boards from public sources (HN "Who is hiring")
 * 2. Fetch live postings from every registered company's own hiring system
 * 3. Keep cloud/SRE/platform/DevOps roles (title-based relevance)
 * 4. Merge with hand-picked listings (verified, never auto-deleted here
 *    unless their URL is dead), dedupe, drop stale, validate, write.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { jobsFileSchema } from "@/lib/jobs";
import { detectTags } from "@/lib/tags";
import { SITE } from "@/lib/site";
import type { Job } from "@/types/job";
import { fetchBoard, fetchSmartRecruitersDetail, fetchWorkableDetail, type Ats } from "./ats";
import { fetchUsaJobs } from "./usajobs";
import {
  discoverFromHackerNews,
  discoverFromHackerNewsJobPosts,
  type DiscoveredBoard,
} from "./discover";
import { htmlToMd } from "./html";
import {
  capPerCompany,
  dedupeJobs,
  dropStale,
  isRelevantTitle,
  mapPostingToJob,
  uniqueSlugs,
} from "./transform";

/** No single company may hold more than this many listings. */
const MAX_PER_COMPANY = 12;

interface CompanyEntry {
  name: string;
  website?: string;
  ats: Ats;
  slug: string;
  discoveredVia: string;
  addedAt: string;
  /** Set true to permanently exclude a board (spam, irrelevant, etc.). */
  blocked?: boolean;
}

const ROOT = path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const COMPANIES_FILE = path.join(ROOT, "src", "data", "companies.json");
const JOBS_FILE = path.join(ROOT, "src", "data", "jobs.json");

/** Guardrail: at most this many newly discovered boards join per run. */
const MAX_NEW_BOARDS_PER_RUN = 50;

async function main() {
  const companies: CompanyEntry[] = JSON.parse(fs.readFileSync(COMPANIES_FILE, "utf8"));
  const existingJobs: Job[] = JSON.parse(fs.readFileSync(JOBS_FILE, "utf8"));
  const today = new Date().toISOString().slice(0, 10);

  // 1. Discovery
  const discovered: DiscoveredBoard[] = [];
  try {
    discovered.push(...(await discoverFromHackerNews()));
  } catch (err) {
    console.error("HN thread discovery failed (continuing):", err);
  }
  try {
    discovered.push(...(await discoverFromHackerNewsJobPosts()));
  } catch (err) {
    console.error("HN job-post discovery failed (continuing):", err);
  }
  const known = new Set(companies.map((c) => `${c.ats}:${c.slug}`));
  let added = 0;
  for (const board of discovered) {
    if (added >= MAX_NEW_BOARDS_PER_RUN) break;
    if (known.has(`${board.ats}:${board.slug}`)) continue;
    companies.push({
      name: board.slug, // replaced with the board's real name after first fetch
      ats: board.ats,
      slug: board.slug,
      discoveredVia: "hn-who-is-hiring",
      addedAt: today,
    });
    known.add(`${board.ats}:${board.slug}`);
    added++;
  }
  console.log(`discovery: ${discovered.length} boards seen, ${added} new`);

  // 2. Fetch every non-blocked board
  const sourcedJobs: Job[] = [];
  const failedBoards = new Set<string>();
  for (const company of companies) {
    if (company.blocked) continue;
    try {
      const board = await fetchBoard(company.ats, company.slug);
      if (company.discoveredVia !== "seed" && board.name && company.name === company.slug) {
        company.name = board.name;
      }
      const relevant = board.postings.filter((p) => isRelevantTitle(p.title));
      for (const posting of relevant) {
        // Workable/SmartRecruiters need a per-job detail call — done only
        // for postings that survived the relevance gate.
        if (company.ats === "workable" && posting._shortcode) {
          posting.html = await fetchWorkableDetail(company.slug, posting._shortcode);
        } else if (company.ats === "smartrecruiters" && posting._detailId) {
          const detail = await fetchSmartRecruitersDetail(company.slug, posting._detailId);
          posting.html = detail.html;
          if (detail.url) posting.url = detail.url;
          if (detail.employmentType) posting.employmentType = detail.employmentType;
        }
        sourcedJobs.push(
          mapPostingToJob(posting, {
            ats: company.ats,
            boardSlug: company.slug,
            companyName: company.name,
            companyWebsite: company.website,
            htmlToMd,
          })
        );
      }
      if (relevant.length) console.log(`${company.name}: ${relevant.length} relevant roles`);
    } catch {
      // Unreachable ≠ removed: remember the failure so this board's
      // existing listings survive the run (they still age out via the
      // freshness cutoff if the board stays broken).
      failedBoards.add(`${company.ats}-${company.slug}-`);
      console.error(`fetch failed (keeping existing listings): ${company.ats}/${company.slug}`);
    }
  }

  // Carry over listings from boards that merely failed to respond today.
  for (const job of existingJobs) {
    if (job.source === "hand-picked") continue;
    for (const prefix of failedBoards) {
      if (job.id.startsWith(prefix)) {
        sourcedJobs.push(job);
        break;
      }
    }
  }

  // 2b. USAJobs (federal roles) — only when API credentials are present
  const usaEmail = process.env.USAJOBS_EMAIL;
  const usaKey = process.env.USAJOBS_API_KEY;
  if (usaEmail && usaKey) {
    try {
      const jobs = (await fetchUsaJobs(usaEmail, usaKey)).filter((j) => isRelevantTitle(j.title));
      for (const job of jobs) {
        job.tags = detectTags(`${job.title}\n${job.description ?? ""}`);
        sourcedJobs.push(job);
      }
      console.log(`USAJobs: ${jobs.length} relevant federal roles`);
    } catch (err) {
      console.error("USAJobs fetch failed (continuing):", err);
      for (const job of existingJobs) {
        if (job.source === "usajobs") sourcedJobs.push(job);
      }
    }
  } else {
    console.log("USAJobs: skipped (set USAJOBS_EMAIL and USAJOBS_API_KEY to enable)");
    // keep any existing federal listings while the source is unconfigured
    for (const job of existingJobs) {
      if (job.source === "usajobs") sourcedJobs.push(job);
    }
  }

  // 3. Hand-picked listings survive unless their URL is dead
  const handPicked: Job[] = [];
  for (const job of existingJobs.filter((j) => j.source === "hand-picked")) {
    try {
      const res = await fetch(job.url, { method: "GET", redirect: "follow" });
      if (res.status === 404 || res.status === 410) {
        console.log(`dropping dead hand-picked listing: ${job.title} @ ${job.company}`);
        continue;
      }
      handPicked.push(job);
    } catch {
      handPicked.push(job); // network hiccup ≠ dead job
    }
  }

  // 4. Merge, dedupe, freshness, unique slugs, sort, validate, write
  const merged = uniqueSlugs(
    capPerCompany(
      dropStale(dedupeJobs([...handPicked, ...sourcedJobs]), SITE.staleAfterDays),
      MAX_PER_COMPANY
    )
  ).sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const validated = jobsFileSchema.safeParse(merged);
  if (!validated.success) {
    console.error(validated.error.issues.slice(0, 5));
    throw new Error("pipeline produced invalid job data — aborting without writing");
  }

  fs.writeFileSync(JOBS_FILE, JSON.stringify(merged, null, 2) + "\n", "utf8");
  fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2) + "\n", "utf8");
  console.log(
    `done: ${merged.length} listings (${handPicked.length} hand-picked) from ${companies.length} known boards`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
