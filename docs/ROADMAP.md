# Roadmap

Phases in order. Each one ends with something you can click. The condensed
version lives in the README's TODO section; this file breaks each item into
subtasks. "Session" here means one focused working sitting.

## Next session

**Where we left off (2026-07-19):** Phases 0–4 done and the board is well
past 250 verified listings. Sources: Greenhouse, Lever, Ashby, Workable,
SmartRecruiters, Workday, Amazon, Netflix, USAJobs (key-gated), plus
discovery (HN threads + job posts, GitHub lists) and directory probing
(YC, CNCF, HWW, remote-jobs) with a persistent cursor. The daily pipeline
fetches concurrently, auto-blocks dead boards, and auto-merges at ~8am ET.

**Start next time with:**
1. Phase 5 — Launch: cookie-free analytics, real domain (swap `SITE.url`
   then submit the sitemap in Search Console), Lighthouse, announce.
2. Standing personal TODOs: buy the domain, add the USAJobs API key as repo
   secrets when it arrives, load the live site on a phone, and re-enable
   required PR reviews before making the repo public.
3. Optional further growth: see the source-expansion recommendation in the
   "Later" list.

## 0. Setup (~1 session)

- [x] GitHub repo and CI (lint + build on every PR)
- [x] Project docs
- [x] Remove the unused `shadcn-ui` package
  - [x] `npm uninstall shadcn-ui`
  - [x] Confirm `npm run build` still passes
- [ ] First deploy to Vercel — done early on purpose, so hosting surprises
      show up now instead of at launch (and they did: see the Vercel
      CVE-block entry in LEARNINGS.md)
  - [x] Log in to vercel.com with the GitHub account
  - [x] Import the `cloud-job-board` repo (defaults are fine for Next.js)
  - [x] Confirm the site builds and gets a `.vercel.app` URL
  - [x] Confirm PR preview deploys work (open any PR, look for the preview link)
  - [ ] Load the URL on a phone and a laptop

## 1. Job data (~2 sessions)

- [x] Define the `Job` type in `src/types/job.ts`
  - [x] Fields: `id`, `title`, `company`, `location`, `workMode`
        (`remote` / `hybrid` / `onsite`), `tags`, `url`, `source`, `postedAt`
  - [x] Decide the canonical tag list (`src/lib/tags.ts`) — defined once,
        reused by filters and feed scripts later
- [x] Create `src/data/jobs.json` with the first real listings
  - [x] Seeded with 24 curated infra listings from RemoteOK's API
        (attributed and linking back per their terms)
  - [ ] Pick 15–20 target companies with public career pages
  - [ ] Hand-collect fresh postings from company career pages to grow the
        set toward 50 (title, company, location, tags, direct URL, date)
- [x] Build the loader in `src/lib/jobs.ts`
  - [x] Add `zod` and write a schema matching the `Job` type
  - [x] Read + validate `jobs.json`; malformed data fails with a clear
        message pointing at the bad entry (enforced by CI now; enforced at
        build time once pages consume the loader in Phase 2)
  - [x] Helpers: sort newest-first, look up distinct tags in use
- [x] Set up testing
  - [x] Install Vitest + React Testing Library, add `npm test`
  - [x] Tests: loader accepts good data, rejects bad data, sorts correctly
  - [x] Add `npm test` to the CI workflow

## 2. Job list (~2–3 sessions)

- [x] Rebuild `JobCard` around the real `Job` type
  - [x] Show title, company, location, work mode, tags, posting date
  - [x] Relative dates ("3 days ago"), with stale listings visually muted
  - [x] Link out with `target="_blank"` and `rel="noopener"`
- [x] Page structure
  - [x] Header: site name, link to the board, "Post a job" mailto link
        (placeholder address — see the TODO below)
  - [x] Footer: GitHub link, license note, direct-link promise
  - [x] Homepage: short pitch + newest listings + link to the full board
  - [x] Jobs page renders everything from `jobs.json` via the loader
        (malformed data now fails the build, as designed)
- [x] Visual pass (Space Crew is the reference)
  - [x] Palette (deep-navy night sky + sky-blue accent) and heading font
        (Space Grotesk); dark-only by decision
  - [x] Card grid with hover states
  - [x] Empty state that doesn't look broken (no loading states — the
        site is fully static)
- [x] Job detail pages (`/jobs/[slug]`) — pulled forward from "Later" by
      request: each card opens a page with the full role description
      (fetched from the company's own hiring system, stored as plain text,
      rendered without raw HTML), verified badge, similar roles, JSON-LD
      structured data, and the direct apply link to the company
- [x] Personality pass — animated CSS starfield, floating hero elements,
      staggered card entrances, glow buttons, gradient headline (all
      disabled under `prefers-reduced-motion`)
- [ ] Responsive check on real phone + laptop, not just the dev tools

## 3. Search and filters on the jobs page (~2 sessions)

- [x] URL shape decided: `/jobs?q=sre&mode=remote&tags=AWS,Go` — every
      filter state is a shareable link
- [x] Filter bar at the top of the jobs page
- [x] Keyword search over title, company, and tags (case-insensitive)
- [x] Work-mode filter (remote / hybrid / onsite)
- [x] Technology filter: chips built from the tags actually present in the
      data (tags are concrete technologies only — AWS, Kubernetes,
      Jenkins... — never vague role words), multi-select
- [x] All filters combine (AND), with a clear-all button
- [x] "No matches" state that suggests removing a filter
- [x] Tests: filter logic as pure functions, plus component tests covering
      keyword narrowing, work-mode filtering, and clear-all

## 4. Automated freshness & verification (~3–4 sessions)

- [x] Script scaffolding: `scripts/pipeline/`, run via `npm run
      update-jobs`
- [x] Self-growing company registry: `src/data/companies.json` — boards
      are *discovered* from public sources (HN "Who is hiring?" threads),
      not hand-curated, so startups get found organically; capped
      additions per run and a `blocked` flag for bad boards
- [x] ATS fetchers — pull each company's live jobs from its own hiring
      system, so every URL is the company's real posting
  - [x] Greenhouse public board API (`boards-api.greenhouse.io`)
  - [x] Lever public postings API (`api.lever.co/v0/postings/...`)
  - [x] Ashby public job board API (with compensation where published)
  - [x] Map each onto the `Job` type (description → markdown-lite, tech
        tags detected from text, employment type + salary when provided)
- [ ] Relevance filter: reuse the canonical tag/keyword list from Phase 1 —
      one list, not three copies
- [x] Dedupe: normalized company + title; the newest wins. No duplicate
      ever appears on the site
- [x] Freshness cutoff: listings older than 45 days drop off
- [x] Verification — no dead or fake listings
  - [x] ATS-sourced jobs re-verify every run: if the job leaves the
        company's own board API, it leaves ours
  - [x] Hand-picked jobs get their URL re-checked; gone pages (404/410)
        are dropped
  - [x] Filter by job title, not source tags (the seed run proved tags
        can't be trusted)
- [x] Merge ATS-sourced with hand-picked entries, validate against the
      schema, and write `jobs.json` (validation failure aborts the write)
- [x] Tests: relevance gate, mapping, dedupe, staleness, slug collisions,
      and board-link extraction (including HN's entity-encoded URLs)
- [x] Scheduled GitHub Action, daily at 12:00 UTC (~8am ET): refresh,
      validate (lint + tests + build inside the workflow), and auto-merge —
      the documented bot exception in DECISIONS.md
- [x] Source expansion (post-launch of the pipeline)
  - [x] Workable and SmartRecruiters fetchers — two more hiring systems
        with public APIs and direct company-board URLs
  - [x] Discovery recognizes Workable/SmartRecruiters links too
  - [x] YC-directory probe script (`scripts/pipeline/probe-companies.ts`)
        — checks public company lists for boards on all five systems;
        only registers boards with relevant open roles
  - [x] Relevance gate v2: adjacent roles added (cloud security,
        DevSecOps, observability, network, release) plus a negative
        filter for hardware/aerospace/manufacturing titles that reuse
        infra words (tuned against SpaceX's board)
  - [x] Per-company cap (12) so no employer floods the board
  - [x] Transient fetch failures keep yesterday's listings (unreachable ≠
        removed); genuinely removed postings still vanish next morning

## 5. Launch (~1–2 sessions)

- [x] SEO foundation
  - [x] Keyword-targeted titles and descriptions per page ("Cloud, DevOps
        & SRE Jobs — N Verified Listings"), Open Graph + Twitter cards,
        canonical URLs
  - [x] `sitemap.xml` (every job page, dated) and `robots.txt`
  - [x] Server-rendered job list — crawlers see all listings in the HTML
        (was empty before; filters now apply client-side after load)
  - [x] JobPosting structured data enriched for Google Jobs: description,
        salary range, employment type, remote signal
  - [x] WebSite structured data + crawlable "find your specialty" internal
        links (remote / AWS / Azure / GCP / Kubernetes / Terraform / senior
        / US)
  - [ ] After the domain purchase: swap `SITE.url`, then submit the
        sitemap in Google Search Console (creates the indexing request)
- [ ] Anonymous, cookie-free analytics (evaluate Vercel Analytics,
      Plausible, Umami — record the choice in DECISIONS.md)
- [ ] Domain
  - [ ] Pick and buy the domain (~$12/year)
  - [ ] Connect it to Vercel, confirm HTTPS
- [ ] Lighthouse audit; fix anything glaring
- [ ] Announce: CNCF Slack #jobs, DevOps communities, socials

## Later

Roughly in priority order:

1. Email newsletter / job alerts — subscribers get new jobs by email (a
   digest of what's fresh, eventually filtered to their interests). The
   retention feature every serious niche board has. May come before full
   accounts (a plain signup form is enough to start).
2. User accounts and saved jobs. This is what finally justifies a database
   (for user data only — jobs stay in JSON).
3. ~~Job detail pages~~ — done in Phase 2 (pulled forward by request).
4. "Post a job" for companies (removed from the UI for now): a dedicated
   email address first, then a submission form with review/approval.
5. Featured/paid listings (Stripe). Also the point where hosting moves off
   Vercel's free tier.
6. Company profile pages.
7. Category landing pages (Cloud, SRE, DevOps, Platform).
8. Blog section: articles explaining cloud terminology and technologies
   (what is SRE, Kubernetes vs. serverless, IaC compared...) — credibility
   for the board and strong SEO surface.
9. More job sources: ~~USAJobs API~~ (done — key-gated; register at
   developer.usajobs.gov and add USAJOBS_EMAIL/USAJOBS_API_KEY as repo
   secrets to switch it on), ~~CNCF-landscape probing~~ (done),
   ~~Amazon/Netflix career portals~~ (done), ~~Workday~~ (done — unlocks
   enterprise employers via their public candidate JSON endpoints), and
   community submissions via a GitHub issue template.

   **Source-expansion recommendation (2026-07-19), remaining order:**
   1. ~~Workday fetcher~~ — done. Biggest legitimate unlock (enterprises on
      Workday: banks, insurers, telecom, Fortune 500 IT). Seeded with
      verified cloud-heavy tenants; discovery recognizes myworkdayjobs links.
   2. Aggregator feeds as *discovery only* — use RemoteOK/Remotive purely
      as a source of company names for the board-prober, never republishing
      their listings or linking to them. Honors their terms and the
      direct-apply rule; adds startup coverage cheaply.
   3. Careers-page JSON-LD reader (candidate for its own repo) — a small,
      general "careers page → JSON" service that reads the JobPosting
      structured data companies publish for Google Jobs, respecting
      robots.txt and rate limits. This is the *legitimate* version of a
      "scraper API": indexing published machine-readable data, not
      defeating anti-bot walls. Unlocks companies on custom/unsupported
      portals.
   4. European ATSes (Recruitee/Teamtailor/Personio) — each ~50-line
      fetcher on the existing pattern.

   **Explicitly rejected:** scraping LinkedIn / Indeed / Glassdoor or
   building anything to circumvent anti-bot measures. Their terms prohibit
   it, it invites the JobFunnel breakage treadmill, and their listings are
   reposts without the company's original apply URL anyway — low payoff,
   high risk. A human browsing those sites and hand-adding a verified
   listing is always fine. Also blocked: Microsoft (careers API host no
   longer resolves) and Google (public careers API retired) — both would
   need web-app scraping; revisit only if either re-exposes JSON.
10. Probe-progress persistence so repeated `probe-companies` runs continue
    through the directory instead of rechecking the same names.
