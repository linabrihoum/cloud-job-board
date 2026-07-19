/**
 * Probe public company directories for hiring boards on the supported
 * systems, and register boards that have relevant open roles. Progress is
 * persisted per directory (src/data/probe-state.json), so each run — the
 * daily workflow probes a batch every morning — continues the sweep
 * instead of rechecking the same names.
 *
 * `npx tsx scripts/pipeline/probe-companies.ts [maxProbes]` (default 150)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchBoard, type Ats } from "./ats";
import {
  fetchCncfDirectory,
  fetchYcDirectory,
  nextBatch,
  type DirectoryCompany,
} from "./directories";
import { isRelevantTitle } from "./transform";

const ROOT = path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const COMPANIES_FILE = path.join(ROOT, "src", "data", "companies.json");
const STATE_FILE = path.join(ROOT, "src", "data", "probe-state.json");

const ATSES: Ats[] = ["greenhouse", "lever", "ashby", "workable", "smartrecruiters"];

const DIRECTORIES: { key: string; load: () => Promise<DirectoryCompany[]> }[] = [
  { key: "yc", load: fetchYcDirectory },
  { key: "cncf", load: fetchCncfDirectory },
];

function slugCandidates(company: DirectoryCompany): string[] {
  const joined = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const dashed = company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const site = company.website?.split(".")[0];
  return [...new Set([joined, dashed, site])].filter((s): s is string => !!s && s.length > 1);
}

async function main() {
  const maxProbes = Number(process.argv[2] ?? 150);
  const companies = JSON.parse(fs.readFileSync(COMPANIES_FILE, "utf8")) as {
    name: string;
    website?: string;
    ats: Ats;
    slug: string;
    discoveredVia: string;
    addedAt: string;
    blocked?: boolean;
  }[];
  const state: Record<string, number> = fs.existsSync(STATE_FILE)
    ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8"))
    : {};
  const known = new Set(companies.map((c) => `${c.ats}:${c.slug}`));
  const knownNames = new Set(companies.map((c) => c.name.toLowerCase()));
  const today = new Date().toISOString().slice(0, 10);

  const perDirectory = Math.ceil(maxProbes / DIRECTORIES.length);
  let added = 0;

  for (const dir of DIRECTORIES) {
    let list: DirectoryCompany[];
    try {
      list = await dir.load();
    } catch (err) {
      console.error(`${dir.key}: directory fetch failed, skipping —`, err);
      continue;
    }
    const { batch, next } = nextBatch(list, state[dir.key] ?? 0, perDirectory);
    console.log(`${dir.key}: ${list.length} companies, probing ${batch.length} from cursor ${state[dir.key] ?? 0}`);

    for (const company of batch) {
      await new Promise((r) => setTimeout(r, 250)); // stay polite to the APIs
      if (knownNames.has(company.name.toLowerCase())) continue;

      outer: for (const slug of slugCandidates(company)) {
        for (const ats of ATSES) {
          if (known.has(`${ats}:${slug}`)) continue;
          try {
            const board = await fetchBoard(ats, slug);
            const relevant = board.postings.filter((p) => isRelevantTitle(p.title));
            if (relevant.length === 0) continue;
            // Directories can list a product (CNCF's "Goose") whose homepage
            // belongs to the parent company (Block) — the board's own name
            // is the truth about who is hiring.
            const boardName = board.name && !/^[a-z0-9-]+$/.test(board.name) ? board.name : company.name;
            companies.push({
              name: boardName,
              website: company.website,
              ats,
              slug,
              discoveredVia: `${dir.key}-probe`,
              addedAt: today,
            });
            known.add(`${ats}:${slug}`);
            knownNames.add(company.name.toLowerCase());
            added++;
            console.log(`+ ${company.name} → ${ats}/${slug} (${relevant.length} relevant roles)`);
            break outer;
          } catch {
            // no board under this slug on this ATS — expected most of the time
          }
        }
      }
    }
    state[dir.key] = next;
  }

  fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2) + "\n", "utf8");
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n", "utf8");
  console.log(`added ${added} boards; cursors: ${JSON.stringify(state)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
