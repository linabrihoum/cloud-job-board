/**
 * Probe a public company directory for hiring boards on the supported
 * systems, and register the boards that have relevant open roles. This
 * complements HN discovery: instead of waiting for a company to post a
 * link somewhere, we go looking.
 *
 * Source: the community-maintained public JSON export of the Y Combinator
 * directory (github.com/yc-oss/api) — thousands of startups with names,
 * slugs, and websites.
 *
 * Run manually or occasionally: `npx tsx scripts/pipeline/probe-companies.ts [maxProbes]`
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchBoard, type Ats } from "./ats";
import { isRelevantTitle } from "./transform";

const ROOT = path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const COMPANIES_FILE = path.join(ROOT, "src", "data", "companies.json");

const YC_DIRECTORY = "https://yc-oss.github.io/api/companies/all.json";
const ATSES: Ats[] = ["greenhouse", "lever", "ashby", "workable", "smartrecruiters"];

interface YcCompany {
  name: string;
  slug: string;
  website?: string;
  status?: string;
  industry?: string;
}

function slugCandidates(company: YcCompany): string[] {
  const fromName = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const dashed = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return [...new Set([company.slug, fromName, dashed])].filter(Boolean);
}

function domainOf(website?: string): string | undefined {
  if (!website) return undefined;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

async function main() {
  const maxProbes = Number(process.argv[2] ?? 200);
  const companies = JSON.parse(fs.readFileSync(COMPANIES_FILE, "utf8")) as {
    name: string;
    website?: string;
    ats: Ats;
    slug: string;
    discoveredVia: string;
    addedAt: string;
  }[];
  const known = new Set(companies.map((c) => `${c.ats}:${c.slug}`));
  const knownNames = new Set(companies.map((c) => c.name.toLowerCase()));

  const directory = (await (await fetch(YC_DIRECTORY)).json()) as YcCompany[];
  const active = directory.filter((c) => c.status !== "Inactive" && c.name);
  console.log(`directory: ${directory.length} companies (${active.length} active)`);

  const today = new Date().toISOString().slice(0, 10);
  let probed = 0;
  let added = 0;

  for (const yc of active) {
    if (probed >= maxProbes) break;
    if (knownNames.has(yc.name.toLowerCase())) continue;
    probed++;
    await new Promise((r) => setTimeout(r, 250)); // stay polite to the APIs

    for (const slug of slugCandidates(yc)) {
      let hit = false;
      for (const ats of ATSES) {
        if (known.has(`${ats}:${slug}`)) continue;
        try {
          const board = await fetchBoard(ats, slug);
          const relevant = board.postings.filter((p) => isRelevantTitle(p.title));
          if (relevant.length === 0) continue; // board exists but nothing for us
          companies.push({
            name: yc.name,
            website: domainOf(yc.website),
            ats,
            slug,
            discoveredVia: "yc-probe",
            addedAt: today,
          });
          known.add(`${ats}:${slug}`);
          added++;
          hit = true;
          console.log(`+ ${yc.name} → ${ats}/${slug} (${relevant.length} relevant roles)`);
          break; // one board per company is enough
        } catch {
          // no board under this slug on this ATS — expected most of the time
        }
      }
      if (hit) break;
    }
  }

  fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2) + "\n", "utf8");
  console.log(`probed ${probed} companies, added ${added} boards`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
