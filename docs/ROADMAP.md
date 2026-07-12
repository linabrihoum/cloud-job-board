# Roadmap

Work phases in order; don't jump ahead. Each phase ends with something you
can click. Target for Phases 0–5: live site by ~July 25, 2026.

## Phase 0 — Setup & first deploy

Deploying a trivial page first means deployment problems surface on day
one, not launch day.

- [x] GitHub repo exists (`linabrihoum/cloud-job-board`)
- [x] CI workflow: GitHub Actions runs lint + build on every PR
- [ ] Kickoff docs merged via first PR
- [ ] Remove the unused `shadcn-ui` package from package.json
- [ ] Commit or clean up the pre-kickoff work-in-progress (JobCard edits,
      `src/app/jobs/`) so the working tree is clean
- [ ] Connect repo to Vercel; current site (any page) deploys on push
- [ ] Confirm the deployed URL loads on phone and desktop

## Phase 1 — Job data foundation

- [ ] Define the `Job` TypeScript type in `src/types/job.ts` (title,
      company, location, remote?, tags, url, source, postedAt)
- [ ] Create `src/data/jobs.json` with 20–50 hand-picked cloud/SRE/DevOps
      jobs from company career pages
- [ ] Data loader in `src/lib/jobs.ts` that reads and validates jobs.json
      at build time (fail the build on malformed data)
- [ ] Set up Vitest + React Testing Library; first test covers the loader
- [ ] Add tests to the CI workflow

## Phase 2 — Job list you'd actually use

- [ ] Rebuild the jobs page from real jobs.json data (cards show title,
      company, location, tags, posting date, link out)
- [ ] Header/footer + homepage that leads to the board
- [ ] Space Crew-inspired visual pass: dark, bold cards, strong typography
- [ ] Responsive check: works well on phone and desktop
- [ ] "Post a job" mailto link in the footer/header

## Phase 3 — Search & filters

- [ ] Keyword search over title/company/tags
- [ ] Remote/location filter
- [ ] Technology/category tag filter
- [ ] Filters combine, and state lives in the URL (shareable links)
- [ ] Component tests for search + filters

## Phase 4 — Automated freshness

- [ ] Script: pull RemoteOK JSON API, filter for cloud/SRE keywords,
      link back to original listing per their terms
- [ ] Script: parse We Work Remotely + Remotive RSS, same filtering,
      attribution links per their terms
- [ ] Dedupe (same job from two sources appears once) + merge into jobs.json
- [ ] Drop listings older than a cutoff so the board stays visibly fresh
- [ ] Run manually via `npm run update-jobs`; then schedule it with GitHub
      Actions (opens an automated PR with the refreshed data)

## Phase 5 — Launch

- [ ] SEO basics: page metadata, sitemap, robots.txt
- [ ] Basic anonymous analytics (pick a cookie-free option)
- [ ] Buy a real domain (~$12/year) and connect it to Vercel
- [ ] Lighthouse pass — fix anything glaring
- [ ] Tell people: share in CNCF Slack #jobs, DevOps communities, socials

## Later (post-MVP, in rough priority order)

1. **Email job alerts** — first post-MVP feature; competitor research says
   alerts are the retention engine for niche boards. Needs an email
   provider; may come before full accounts (plain signup form).
2. User accounts + saved jobs (this is what triggers adding a database —
   user data only; jobs stay in JSON)
3. Job detail pages (`/jobs/[slug]`) with JSON-LD structured data for
   Google Jobs
4. Company submission form with review/approval (replaces the mailto link)
5. Featured/paid listings (Stripe) — also triggers Vercel Pro plan
6. Company profile pages
7. Category landing pages (Cloud, SRE, DevOps, Platform)
8. Blog/industry content for credibility, like Space Crew's
