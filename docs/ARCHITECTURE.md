# Architecture

The MVP is a **static site**: all pages are baked to plain HTML at build
time. There is no database, no server code, and no user data.

## The picture

```
  Job sources                        GitHub repo                     Visitors
  ───────────                        ───────────                     ────────
  RemoteOK API      ┐
  We Work Remotely  ├─► update script ─► src/data/jobs.json
  Remotive RSS      ┘   (Phase 4)              │
  Hand-picked jobs ──── edited directly ───────┤
                                               ▼
                                     Next.js build (on push)
                                               │
                                               ▼
                                     static HTML/CSS/JS
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
| Data loading | `src/lib/` | Reads + validates jobs.json at build time |
| Feed scripts | `scripts/` | Pull from RemoteOK/WWR/Remotive, filter for cloud/SRE keywords, dedupe, merge into jobs.json (Phase 4) |
| CI | `.github/workflows/` | Lint + build (+ tests) on every PR |

## Search and filters without a server

The full job list is small enough to ship to the browser. Search and
filtering (keyword, remote/location, tags) happen client-side in React —
instant results, no API needed. If the list ever grows past a few thousand
jobs, revisit this.

## What changes post-MVP

User accounts and email alerts introduce the first real backend: a database
(user data only — jobs stay in JSON), authentication, and an email service.
That's deliberately out of scope now; see the "Later" section of
[ROADMAP.md](./ROADMAP.md).
