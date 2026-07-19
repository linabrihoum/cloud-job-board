/** Company-website resolution, so cards can show real logos. Two
 * strategies, precision-ordered: mine the company's own links out of its
 * job-description HTML, then validated domain guessing from the name. */

const EXCLUDED_DOMAINS =
  /greenhouse|lever\.co|ashbyhq|workable|smartrecruiters|usajobs|linkedin|twitter|x\.com|facebook|instagram|youtube|github|glassdoor|google|apple\.com|notion|calendly|bit\.ly|docs\.|mailto|wellfound|builtin|indeed|medium\.com|vimeo|loom\.com|slack|discord/i;

/** Normalize a company name into comparable tokens (≥4 chars). */
function nameTokens(company: string): string[] {
  return company
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|corp|technologies|technology|labs|group|health|systems)\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4);
}

function apexDomain(hostname: string): string {
  const parts = hostname.replace(/^www\./, "").split(".");
  return parts.slice(-2).join(".");
}

/** Find the company's own website inside its job-description HTML: an
 * external link whose domain contains a company-name token. */
export function mineWebsiteFromHtml(html: string, company: string): string | undefined {
  const tokens = nameTokens(company);
  const joined = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (tokens.length === 0 && joined.length < 4) return undefined;

  for (const match of html.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
    const hostname = match[1].toLowerCase();
    if (EXCLUDED_DOMAINS.test(hostname)) continue;
    const apex = apexDomain(hostname);
    const apexName = apex.split(".")[0];
    if (apexName.length < 3) continue;
    if (tokens.some((t) => apexName.includes(t) || t.includes(apexName)) || apexName === joined) {
      return apex;
    }
  }
  return undefined;
}

/** Candidate domains worth trying for a company name. */
export function candidateDomains(company: string): string[] {
  const joined = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (joined.length < 3) return [];
  return [`${joined}.com`, `${joined}.io`, `${joined}.ai`, `${joined}.dev`];
}

/** Guess-and-verify: a candidate counts only if its homepage title/text
 * actually mentions the company. */
export async function guessWebsite(company: string): Promise<string | undefined> {
  const token = nameTokens(company)[0] ?? company.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!token || token.length < 3) return undefined;
  for (const domain of candidateDomains(company)) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://${domain}`, {
        signal: controller.signal,
        headers: { "user-agent": "Mozilla/5.0 (compatible; cloud-job-board)" },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const head = (await res.text()).slice(0, 4000).toLowerCase();
      if (head.includes(token)) return domain;
    } catch {
      // unreachable candidate — try the next
    }
  }
  return undefined;
}
