# Architecture

The MVP is a **static site**: all pages are baked to plain HTML at build
time. There is no database, no server code, and no user data.

## The picture

```
  Job sources                        GitHub repo                     Visitors
  ───────────                        ───────────                     ────────
  Discovery (HN threads +   ┐
  job posts, GitHub lists)  │
  Directory probing (YC,    │
  CNCF, HWW, remote-jobs;   ├─► daily pipeline ─► src/data/jobs.json
  persistent cursor)        │   (8am ET: fetch      │
        │                   │    concurrently,      │
        ▼                   │    verify, dedupe,    │
  Hiring systems: Greenhouse,│   validate, auto-    │
  Lever, Ashby, Workable,   │    merge)             │
  SmartRecruiters, Workday  │                       │
  Career portals: Amazon,   │                       │
  Netflix                   │                       │
  USAJobs (federal,         │                       │
  key-gated)                ┘                       │
  Hand-picked jobs ──────── edited directly ────────┤
                                               ▼
                                     Next.js build (SSG on push)
                                               │
                                               ▼
                                  static HTML/CSS/JS + sitemap,
                                  robots, JobPosting structured data
                                               │
                                               ▼
                                     Vercel CDN ────────────────► phone/desktop
                                                                  browsers
```

## How a change reaches the site

1. `src/data/jobs.json` changes — either by hand-editing or by running the
   feed update script (Phase 4 automates this on a schedule).
2. The change goes through a branch + PR; CI (GitHub Actions) runs lint,
   tests, and build.
3. On merge to `main`, Vercel rebuilds the site (~a minute) and deploys the
   fresh static pages globally.

## Pieces

| Piece | Where | Job |
|---|---|---|
| Pages | `src/app/` | Next.js App Router pages: home, jobs list; job detail later |
| Components | `src/components/` | Reusable UI (JobCard, filters, header...) |
| Job data | `src/data/jobs.json` | The single source of truth for listings |
| Types | `src/types/` | The `Job` TypeScript shape — defined once, used everywhere |
| Data loading | `src/lib/` | Reads + validates jobs.json at build time; filter logic; date/site helpers |
| Pipeline | `scripts/pipeline/` | Discovery, directory probing, six hiring systems + Amazon/Netflix/USAJobs fetchers, title relevance gate (with a hardware/aerospace negative filter), concurrent fetch, dedupe, per-company cap, freshness cutoff, company-website resolution for logos, auto-block, validate, merge — daily at ~8am ET |
| Company registry | `src/data/companies.json` | Self-growing list of known boards + a `probe-state.json` cursor; discovery/probing add entries, `blocked`/`failCount` prune dead ones |
| SEO | `src/app/sitemap.ts`, `robots.ts`, per-page metadata, JobPosting JSON-LD | Server-rendered listings, sitemap of every job page, structured data for Google Jobs |
| Motion | `src/components/Effects.tsx`, `globals.css` | Parallax starfield, scroll reveals, counters, shooting stars — CSS-driven, ~0.1 kB JS, off under `prefers-reduced-motion` |
| CI | `.github/workflows/` | `ci.yml` (lint + tests + build on every PR); `update-jobs.yml` (the daily refresh, self-validating auto-merge) |

## Search and filters without a server

The full job list is server-rendered into the page HTML (so crawlers and
Google Jobs see every listing), then search and filtering (keyword,
work-mode, region, level, technology) run client-side in React over that
same data — instant results, no API, filter state kept in the URL so views
are shareable. If the list ever grows past a few thousand jobs, revisit
this.

## What changes post-MVP

User accounts and email alerts introduce the first real backend: a database
(user data only — jobs stay in JSON), authentication, and an email service.
That's deliberately out of scope now; see the "Later" section of
[ROADMAP.md](./ROADMAP.md).
