# Decisions

Big decisions, why we made them, and what we said no to. Newest at the top.

---

## 2026-07-18 — Every listing gets verified; no dead, duplicate, or fake jobs

**Decision:** The board re-checks every listing's URL on a schedule and
removes listings that are dead (page gone), expired (page says the role is
closed), or duplicated across sources. Hand-picked jobs link directly to
the company's own posting, so verifying the link verifies the job against
the company site. Feed jobs are verified at the page their source terms
require us to link to, plus a freshness cutoff, plus human review of every
automated refresh PR.

**Why:** "Fresh and real" is the board's core promise — one click-through
to a filled job costs more trust than ten good listings earn.

**Rejected:** Trusting feeds blindly (the seed run surfaced hospitality
jobs tagged "sys admin"); fully automated cross-matching of feed jobs
against each company's careers site (every careers site is different —
revisit if a practical approach appears, e.g. Greenhouse/Lever APIs);
exempting hand-picked listings from verification.

---

## 2026-07-12 — Open source under AGPL-3.0; docs stay public

**Decision:** The project is open source under the GNU AGPL-3.0, with a
CONTRIBUTING.md and the full `docs/` folder published in the repo, written
in neutral project voice.

**Why AGPL over MIT/GPL:** For a hosted web app, MIT/Apache would let
anyone clone the board and run it as a closed, competing site. Regular GPL
only triggers on *distributing* copies — running a website doesn't count.
AGPL closes that gap: anyone running a modified version as a service must
share their changes under the same license.

**Why docs stay public:** Contributors need the roadmap (what to work on),
the architecture (how it fits), and this file (what's already settled).
Hiding them was considered and rejected — a gitignore can't be
branch-specific anyway, and docs-in-repo is how the project keeps its
memory between sessions.

**Rejected:** MIT and Apache-2.0 (permit closed-source hosted clones);
keeping docs local-only or on a never-merged branch; the `docs/archive/`
folder of pre-restart drafts was dropped from the repo (still recoverable
from git history).

---

## 2026-07-11 — Full kickoff restart; earlier planning docs archived

**Decision:** Treat all pre-kickoff planning (the 14-phase README plan, the
JobFunnel docs) as drafts. The kickoff interview's answers are the source of
truth; old docs moved to `docs/archive/`.

**Why:** The old plan called 13 phases the "MVP" — months of work before
anything shipped. The new plan ships a usable board in ~2 weeks and grows
from there.

**Rejected:** Adapting the old docs in place — too much stale detail to
untangle vs. rewriting from clear interview answers.

---

## 2026-07-11 — Keep Next.js; Astro rejected

**Decision:** Stay on Next.js 15 + React 19 + TypeScript + Tailwind 4.

**Why:** Already installed with working pages; largest community (Stack
Overflow answers exist for everything); its optional server features are
exactly what post-MVP needs (forms, alerts), so they're additions later,
not migrations.

**Rejected:** Astro. Honest pitch: leaner static output. But it would
replace exactly one layer (the framework) — the layer all existing code
lives in — for a speed gain visitors won't notice on a site this size, at
the cost of a rewrite and a smaller community. Conflicts with "ship in ~2
weeks."

---

## 2026-07-11 — Jobs in a JSON file; no database in the MVP

**Decision:** All listings live in `src/data/jobs.json`, committed to the
repo. Pages are statically generated from it at build time.

**Why:** Visitors only read; only the owner writes. $0/month, nothing to
secure, instant loads. Scales to a few thousand jobs.

**Rejected:** PostgreSQL + Prisma now — a running service with nothing to
do until user accounts exist. Revisit when accounts/email alerts start
(post-MVP); even then the database holds user data only.

---

## 2026-07-11 — Feeds and hand-picking, not scraping

**Decision:** Source jobs from legitimate feeds — RemoteOK JSON API, We
Work Remotely RSS, Remotive RSS — plus hand-picked listings. Always
attribute and link back per each source's terms.

**Why:** Scrapers for Indeed/Glassdoor break constantly because those sites
actively block them. Feeds are stable, permitted, and simple to parse.

**Rejected:** JobFunnel (the old plan's centerpiece) — a scraping tool
pointed at sites that fight scraping. Also rejected: automation before
launch at all; the first version launches with 20–50 hand-picked jobs and
automation lands in Phase 4, after the site is live.

---

## 2026-07-11 — Slim MVP; companies post via email link

**Decision:** First shippable version = deployed site with a searchable,
filterable list of curated jobs linking out to company postings. Company
participation = a "Post a job" mailto link. Email alerts are the *first*
post-MVP feature (competitor research showed alerts are the retention
engine for niche boards).

**Rejected:** The 13-phase "MVP"; a submission form (build once volume
exists); paid listings from day one (needs an audience first); charging job
seekers ever (that's DevOps Projects HQ's weakness and our wedge).

---

## 2026-07-11 — Vercel free tier for hosting

**Decision:** Host on Vercel Hobby (free). Deploy on push, PR preview URLs.

**Why:** Zero-config for Next.js; free tier comfortably covers this site.

**Rejected:** GitHub Pages (can't run any Next.js server features — closes
post-MVP doors for zero benefit); Netlify (fine, but more config for
Next.js; low lock-in means we can switch later if needed). Known
constraint: free tier is non-commercial — move to Pro ($20/mo) when
featured listings start selling.
