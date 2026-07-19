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
