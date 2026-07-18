# Tech Stack

Chosen July 2026. The bias throughout: boring, well-documented tools with
big communities. See [DECISIONS.md](./DECISIONS.md) for alternatives we
rejected and why.

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) + React | 15.x / 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Job data | JSON file in the repo (`src/data/jobs.json`) | — |
| Job sourcing | Feed scripts: RemoteOK JSON API, We Work Remotely RSS, Remotive RSS + hand-picking | — |
| Hosting | Vercel (free Hobby tier) | — |
| CI | GitHub Actions (lint + build, tests when they exist) | — |
| Tests | Vitest + React Testing Library | added Phase 1 |
| Analytics (later) | Something anonymous/cookie-free (decide at Launch phase) | — |

## Why each choice

**Next.js + React + TypeScript.** Already installed and started in this
repo. Biggest community in web development — every problem hit has a Stack
Overflow answer. TypeScript catches typos and shape mistakes at edit time,
which pays off fast on a data-driven site. Next.js's optional server
features (form handling, API routes) are exactly what the post-MVP roadmap
needs (submission forms, email alerts), so they're additions later, not
migrations.

**Tailwind CSS.** Already installed. Styling by composing utility classes
in the markup — fast to learn by copying examples, and most modern
tutorials/components use it. The Space Crew look (dark, bold cards, strong
typography) is bread-and-butter Tailwind. If pre-built components are
wanted later, shadcn/ui sits on top of Tailwind and is the standard pairing.

**JSON file instead of a database.** The job list changes only when a
maintainer (or the feed script) changes it, and visitors only read it — so a database would be a
running service with nothing to do. A JSON file means $0/month, nothing to
secure, instant page loads (pages are baked to HTML at build time), and it
scales to a few thousand jobs. The trigger for adding a database is **user
accounts** (post-MVP); even then the database holds only user data — jobs
can stay in JSON. Nothing built now gets thrown away.

**Feeds, not scraping.** The earlier plan used JobFunnel to scrape Indeed/
Glassdoor. Rejected: those sites actively block scrapers, so scrapers break
constantly. Instead: legitimate sources only — RemoteOK's free JSON API
(terms: link directly back to the original listing), We Work Remotely's
public RSS feeds (terms: attribute with links back), Remotive's RSS feed —
plus hand-picked listings from company career pages.

**Vercel.** Made by the Next.js team, so deploys are near-zero-config: push
to GitHub and the site updates; every PR gets its own preview URL. Free
Hobby tier easily covers this project. Known constraint: the free tier is
non-commercial, so when featured listings start selling, move to the $20/mo
Pro plan — a Launch-phase decision. Lock-in is low; moving to Netlify later
is an afternoon, not a rewrite.

**GitHub Actions.** Free CI for this repo size; runs the linter and build
on every PR (tests join the workflow once they exist in Phase 1).

**Vitest + React Testing Library.** The standard, well-documented pair for
testing React components; Vitest also understands the same config as the
app's tooling.

## Secrets

The MVP needs none — no `.env` file yet. When a secret first appears
(analytics key, email provider), add `.env` (gitignored) and a committed
`.env.example` with the variable names and blank values.
