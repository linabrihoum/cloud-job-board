# Roadmap

Phases in order. Each one ends with something you can click. The condensed
version lives in the README's TODO section; this file breaks each item into
subtasks. "Session" here means one focused working sitting.

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
- [ ] Create a dedicated post-a-job email address and replace the
      placeholder in `src/lib/site.ts`
- [ ] Responsive check on real phone + laptop, not just the dev tools

## 3. Search and filters (~2 sessions)

- [ ] Decide the URL shape first (e.g. `/jobs?q=sre&mode=remote&tags=aws`)
      so every filter state is a shareable link
- [ ] Keyword search over title, company, and tags (case-insensitive)
- [ ] Work-mode filter (remote / hybrid / onsite)
- [ ] Tag filter: chips built from the tags actually present in the data,
      multi-select
- [ ] All filters combine (AND), with a clear-all button
- [ ] "No matches" state that suggests removing a filter
- [ ] Tests: filter logic as pure functions, plus a component test that
      typing a keyword narrows the list

## 4. Automated freshness & verification (~3–4 sessions)

- [ ] Script scaffolding: `scripts/update-jobs.ts`, run via `npm run
      update-jobs`
- [ ] Company registry: `src/data/companies.json` — each target company's
      name, website, hiring system (greenhouse/lever/ashby), and board slug
- [ ] ATS fetchers — pull each company's live jobs from its own hiring
      system, so every URL is the company's real posting
  - [ ] Greenhouse public board API (`boards-api.greenhouse.io`)
  - [ ] Lever public postings API (`api.lever.co/v0/postings/...`)
  - [ ] Ashby public job board API
  - [ ] Map each onto the `Job` type
- [ ] Relevance filter: reuse the canonical tag/keyword list from Phase 1 —
      one list, not three copies
- [ ] Dedupe: normalize company + title; when two sources (or a source and
      a hand-picked entry) have the same job, keep exactly one — the one
      closest to the original posting. No duplicate ever appears on the site
- [ ] Freshness cutoff: drop listings older than ~45 days
- [ ] Verification pass (`npm run verify-jobs`) — no dead or fake listings
  - [ ] Every listing links to the company's own posting, so re-visiting
        the URL validates the job against the company site directly; drop
        listings whose page is gone (404/410 or redirected away)
  - [ ] ATS-sourced jobs re-verify for free: if the job leaves the
        company's board API, it leaves ours
  - [ ] Catch "zombie" postings: pages that still load but say the role is
        closed ("no longer accepting applications" and similar phrases)
  - [ ] Filter by job title, not source tags (the seed run proved tags
        can't be trusted)
- [ ] Merge ATS-sourced with hand-picked entries and write `jobs.json`
      (hand-picked ones are never auto-deleted by the refresh, but they are
      subject to the verification pass like everything else)
- [ ] Tests: mapping, filtering, dedupe, and verification against saved
      sample ATS responses and mocked link responses
- [ ] Scheduled GitHub Action (weekly to start) that runs refresh +
      verification and opens a PR with the changes — a human still reviews
      what got added and removed before it goes live

## 5. Launch (~1–2 sessions)

- [ ] SEO basics
  - [ ] Per-page titles and descriptions, Open Graph tags
  - [ ] `sitemap.xml` and `robots.txt` (Next.js has built-in support)
- [ ] Anonymous, cookie-free analytics (evaluate Vercel Analytics,
      Plausible, Umami — record the choice in DECISIONS.md)
- [ ] Domain
  - [ ] Pick and buy the domain (~$12/year)
  - [ ] Connect it to Vercel, confirm HTTPS
- [ ] Lighthouse audit; fix anything glaring
- [ ] Announce: CNCF Slack #jobs, DevOps communities, socials

## Later

Roughly in priority order:

1. Email job alerts — the retention feature every serious niche board has.
   May come before full accounts (a plain signup form is enough to start).
2. User accounts and saved jobs. This is what finally justifies a database
   (for user data only — jobs stay in JSON).
3. ~~Job detail pages~~ — done in Phase 2 (pulled forward by request).
4. Company submission form with review/approval, replacing the mailto link.
5. Featured/paid listings (Stripe). Also the point where hosting moves off
   Vercel's free tier.
6. Company profile pages.
7. Category landing pages (Cloud, SRE, DevOps, Platform).
8. Blog/industry content for credibility.
