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
import { SITE } from "@/lib/site";
import type { Job } from "@/types/job";
import { fetchBoard, type Ats } from "./ats";
import { discoverFromHackerNews, type DiscoveredBoard } from "./discover";
import { htmlToMd } from "./html";
import {
  dedupeJobs,
  dropStale,
  isRelevantTitle,
  mapPostingToJob,
  uniqueSlugs,
} from "./transform";

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
const MAX_NEW_BOARDS_PER_RUN = 25;

async function main() {
  const companies: CompanyEntry[] = JSON.parse(fs.readFileSync(COMPANIES_FILE, "utf8"));
  const existingJobs: Job[] = JSON.parse(fs.readFileSync(JOBS_FILE, "utf8"));
  const today = new Date().toISOString().slice(0, 10);

  // 1. Discovery
  let discovered: DiscoveredBoard[] = [];
  try {
    discovered = await discoverFromHackerNews();
  } catch (err) {
    console.error("discovery failed (continuing with known boards):", err);
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
  for (const company of companies) {
    if (company.blocked) continue;
    try {
      const board = await fetchBoard(company.ats, company.slug);
      if (company.discoveredVia !== "seed" && board.name && company.name === company.slug) {
        company.name = board.name;
      }
      const relevant = board.postings.filter((p) => isRelevantTitle(p.title));
      for (const posting of relevant) {
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
      // Board gone or unreachable — its previously sourced jobs simply
      // don't come back this run, which is the verification working.
      console.error(`fetch failed: ${company.ats}/${company.slug}`);
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
    dropStale(dedupeJobs([...handPicked, ...sourcedJobs]), SITE.staleAfterDays)
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
