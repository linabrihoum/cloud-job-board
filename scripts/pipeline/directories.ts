/** Company-directory sources for board probing, plus the cursor helper
 * that lets repeated runs sweep onward instead of rechecking the same
 * names. Parsers are pure and fixture-tested; fetchers hit the network. */

export interface DirectoryCompany {
  name: string;
  website?: string;
}

/** Take `count` entries starting at `cursor`, wrapping at the end.
 * Returns the batch and the next cursor position. */
export function nextBatch<T>(list: T[], cursor: number, count: number): { batch: T[]; next: number } {
  if (list.length === 0) return { batch: [], next: 0 };
  const start = ((cursor % list.length) + list.length) % list.length;
  const batch: T[] = [];
  for (let i = 0; i < Math.min(count, list.length); i++) {
    batch.push(list[(start + i) % list.length]);
  }
  return { batch, next: (start + batch.length) % list.length };
}

/** Y Combinator directory via the public community JSON export. */
export async function fetchYcDirectory(): Promise<DirectoryCompany[]> {
  const data = (await (
    await fetch("https://yc-oss.github.io/api/companies/all.json")
  ).json()) as { name?: string; website?: string; status?: string }[];
  return data
    .filter((c) => c.name && c.status !== "Inactive")
    .map((c) => ({ name: c.name as string, website: domainOf(c.website) }));
}

/** CNCF landscape — the catalog of cloud-native companies. Parsed from the
 * raw landscape.yml with a line scanner (structure is stable and shallow;
 * a YAML dependency isn't warranted for two fields). */
export async function fetchCncfDirectory(): Promise<DirectoryCompany[]> {
  const yml = await (
    await fetch("https://raw.githubusercontent.com/cncf/landscape/master/landscape.yml")
  ).text();
  return parseLandscape(yml);
}

/** Pure parser for landscape.yml item blocks. */
export function parseLandscape(yml: string): DirectoryCompany[] {
  const out = new Map<string, DirectoryCompany>();
  let currentName: string | undefined;
  for (const line of yml.split("\n")) {
    const item = /^\s*-\s+item:\s*$/.test(line);
    if (item) {
      currentName = undefined;
      continue;
    }
    const name = line.match(/^\s+name:\s*(.+?)\s*$/);
    if (name && currentName === undefined) {
      currentName = name[1].replace(/^['"]|['"]$/g, "");
      continue;
    }
    const homepage = line.match(/^\s+homepage_url:\s*(\S+)\s*$/);
    if (homepage && currentName) {
      const key = currentName.toLowerCase();
      if (!out.has(key)) {
        out.set(key, { name: currentName, website: domainOf(homepage[1]) });
      }
      currentName = undefined;
    }
  }
  return [...out.values()];
}

function domainOf(website?: string): string | undefined {
  if (!website) return undefined;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** Pull company entries out of a list-style GitHub README: every
 * `[Name](https://...)` bullet or table cell that plausibly names a
 * company. Pure — fixture-tested. */
export function parseMarkdownCompanies(md: string): DirectoryCompany[] {
  const out = new Map<string, DirectoryCompany>();
  const add = (rawName: string, url: string) => {
    const name = rawName.trim();
    if (/contribut|license|readme|badge|\.md$|\.png|\.svg|shields\.io|github\.com/i.test(url)) return;
    if (/^(back to top|table of contents|see more|website|careers?|jobs?|blog|here)$/i.test(name)) return;
    const website = domainOf(url);
    if (!website) return;
    const key = name.toLowerCase();
    if (!out.has(key)) out.set(key, { name, website });
  };
  // `[Name](https://company.com)` bullets and cells
  for (const m of md.matchAll(/\[([^\]\n]{2,60})\]\((https?:\/\/[^)\s]+)\)/g)) {
    add(m[1], m[2]);
  }
  // remote-jobs style rows: `| [Name](/profiles/x.md) | https://company.com |`
  for (const m of md.matchAll(/\|\s*\[([^\]\n]{2,60})\]\([^)]*\)\s*\|\s*<?(https?:\/\/[^\s|>]+)/g)) {
    add(m[1], m[2]);
  }
  return [...out.values()];
}

/** Hiring Without Whiteboards — ~1,000 tech companies with sane interview
 * processes; heavily overlapping with cloud-native employers. */
export async function fetchHwwDirectory(): Promise<DirectoryCompany[]> {
  const md = await (
    await fetch("https://raw.githubusercontent.com/poteto/hiring-without-whiteboards/main/README.md")
  ).text();
  return parseMarkdownCompanies(md);
}

/** remoteintech/remote-jobs — hundreds of remote-friendly tech companies. */
export async function fetchRemoteJobsDirectory(): Promise<DirectoryCompany[]> {
  const md = await (
    await fetch("https://raw.githubusercontent.com/remoteintech/remote-jobs/main/README.md")
  ).text();
  return parseMarkdownCompanies(md);
}
