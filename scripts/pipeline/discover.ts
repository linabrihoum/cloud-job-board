/** Company-board discovery. Instead of a hand-curated company list, mine
 * public sources for links to Greenhouse/Lever/Ashby boards — startups get
 * found the moment anyone posts their hiring link. Current source: Hacker
 * News "Who is hiring?" threads via the public Algolia API. */

import type { Ats } from "./ats";

export interface DiscoveredBoard {
  ats: Ats;
  slug: string;
}

const BOARD_PATTERNS: { ats: Ats; re: RegExp; build?: (m: RegExpMatchArray) => string }[] = [
  { ats: "greenhouse", re: /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/([A-Za-z0-9_-]+)/g },
  { ats: "greenhouse", re: /greenhouse\.io\/embed\/job_board\?[^"'\s]*for=([A-Za-z0-9_-]+)/g },
  { ats: "lever", re: /jobs(?:\.eu)?\.lever\.co\/([A-Za-z0-9_-]+)/g },
  { ats: "ashby", re: /jobs\.ashbyhq\.com\/([A-Za-z0-9_.-]+)/g },
  { ats: "workable", re: /apply\.workable\.com\/(?:api\/[^\s"']+\/)?([A-Za-z0-9_-]+)/g },
  { ats: "smartrecruiters", re: /(?:jobs|careers)\.smartrecruiters\.com\/([A-Za-z0-9_-]+)/g },
  {
    // Workday: tenant.host.myworkdayjobs.com/[locale/]Site — composite slug
    ats: "workday",
    re: /([a-z0-9-]+)\.(wd\d+)\.myworkdayjobs\.com\/(?:[a-z]{2}-[A-Z]{2}\/)?([A-Za-z0-9_-]+)/g,
    build: (m) => `${m[1].toLowerCase()}:${m[2].toLowerCase()}:${m[3]}`,
  },
];

/** Pull board references out of arbitrary text/HTML. Pure — testable.
 * HN encodes slashes in comment HTML as &#x2F;, so entities are decoded
 * before matching. */
export function extractBoards(text: string): DiscoveredBoard[] {
  const decoded = text.replace(/&#x2F;/gi, "/").replace(/&amp;/g, "&");
  const found = new Map<string, DiscoveredBoard>();
  for (const { ats, re, build } of BOARD_PATTERNS) {
    for (const match of decoded.matchAll(re)) {
      const slug = build ? build(match) : decodeURIComponent(match[1]).toLowerCase();
      // Path segments that aren't board slugs
      if (["jobs", "embed", "job", "careers", "api", "j", "widget"].includes(slug)) continue;
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
export async function discoverFromHackerNews(threadCount = 4): Promise<DiscoveredBoard[]> {
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

/** Community GitHub lists whose READMEs contain direct hiring-board
 * links (the company-name entries are handled by directory probing). */
export async function discoverFromGithubLists(): Promise<DiscoveredBoard[]> {
  const urls = [
    "https://raw.githubusercontent.com/poteto/hiring-without-whiteboards/main/README.md",
    "https://raw.githubusercontent.com/remoteintech/remote-jobs/main/README.md",
  ];
  const boards: DiscoveredBoard[] = [];
  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    boards.push(...extractBoards(await res.text()));
  }
  return boards;
}

/** HN also carries individual "X is hiring" job posts (YC companies).
 * Their URLs and text often point straight at hiring-system boards. */
export async function discoverFromHackerNewsJobPosts(pages = 2): Promise<DiscoveredBoard[]> {
  const boards: DiscoveredBoard[] = [];
  for (let page = 0; page < pages; page++) {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search_by_date?tags=job&hitsPerPage=100&page=${page}`
    );
    if (!res.ok) break;
    boards.push(...extractBoards(JSON.stringify(await res.json())));
  }
  return boards;
}
