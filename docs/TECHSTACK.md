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
| Job sourcing | Hiring-system APIs (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Workday) + career portals (Amazon, Netflix) + USAJobs (key-gated) + discovery (HN, GitHub lists) + directory probing (YC, CNCF, HWW, remote-jobs) + hand-picking | — |
| Pipeline runtime | tsx (TypeScript scripts), jsdom (HTML→text) | — |
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

**Company hiring-system APIs, not scraping or aggregator feeds.** The
earliest plan used JobFunnel to scrape Indeed/Glassdoor — rejected because
those sites actively block scrapers. Aggregator feeds (RemoteOK, We Work
Remotely, Remotive) were considered next, but their terms require linking
back to their own listing pages, which conflicts with the rule that "Apply"
always lands on the company's posting. Instead, jobs come from public JSON
endpoints the companies publish themselves: six hiring systems (Greenhouse,
Lever, Ashby, Workable, SmartRecruiters, Workday — Workday unlocks large
enterprises), the Amazon and Netflix career portals, and USAJobs for
federal roles. The registry of boards grows itself — links mined from HN
"Who is hiring?" threads and GitHub company lists, plus probing public
company directories (YC, CNCF, Hiring Without Whiteboards, remote-jobs) with
a persistent cursor. Every listing is pulled from the company's own system,
so URLs are direct and inherently current. LinkedIn/Indeed scraping and any
anti-bot circumvention are explicitly rejected (see DECISIONS.md).

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
