/** Company-board discovery. Instead of a hand-curated company list, mine
 * public sources for links to Greenhouse/Lever/Ashby boards — startups get
 * found the moment anyone posts their hiring link. Current source: Hacker
 * News "Who is hiring?" threads via the public Algolia API. */

import type { Ats } from "./ats";

export interface DiscoveredBoard {
  ats: Ats;
  slug: string;
}

const BOARD_PATTERNS: { ats: Ats; re: RegExp }[] = [
  { ats: "greenhouse", re: /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/([A-Za-z0-9_-]+)/g },
  { ats: "greenhouse", re: /greenhouse\.io\/embed\/job_board\?[^"'\s]*for=([A-Za-z0-9_-]+)/g },
  { ats: "lever", re: /jobs(?:\.eu)?\.lever\.co\/([A-Za-z0-9_-]+)/g },
  { ats: "ashby", re: /jobs\.ashbyhq\.com\/([A-Za-z0-9_.-]+)/g },
];

/** Pull board references out of arbitrary text/HTML. Pure — testable.
 * HN encodes slashes in comment HTML as &#x2F;, so entities are decoded
 * before matching. */
export function extractBoards(text: string): DiscoveredBoard[] {
  const decoded = text.replace(/&#x2F;/gi, "/").replace(/&amp;/g, "&");
  const found = new Map<string, DiscoveredBoard>();
  for (const { ats, re } of BOARD_PATTERNS) {
    for (const match of decoded.matchAll(re)) {
      const slug = decodeURIComponent(match[1]).toLowerCase();
      // Path segments that aren't board slugs
      if (["jobs", "embed", "job", "careers"].includes(slug)) continue;
      found.set(`${ats}:${slug}`, { ats, slug });
    }
  }
  return [...found.values()];
}

interface AlgoliaHit {
  objectID: string;
  title?: string;
}

/** Find the most recent HN "Who is hiring?" threads and mine their
 * comments for hiring-system links. */
export async function discoverFromHackerNews(threadCount = 2): Promise<DiscoveredBoard[]> {
  const search = (await (
    await fetch(
      "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=10"
    )
  ).json()) as { hits: AlgoliaHit[] };

  const threads = search.hits
    .filter((h) => /who is hiring/i.test(h.title ?? ""))
    .slice(0, threadCount);

  const boards: DiscoveredBoard[] = [];
  for (const thread of threads) {
    const item = (await (
      await fetch(`https://hn.algolia.com/api/v1/items/${thread.objectID}`)
    ).json()) as unknown;
    boards.push(...extractBoards(JSON.stringify(item)));
  }
  return boards;
}
