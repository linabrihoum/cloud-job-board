# Roadmap

Phases in order. Each one ends with something you can click. The condensed
version lives in the README's TODO section.

## 0. Setup

- [x] GitHub repo and CI (lint + build on every PR)
- [x] Project docs
- [ ] Remove the unused `shadcn-ui` package from package.json
- [ ] Connect the repo to Vercel; site deploys on push
- [ ] Confirm the deployed URL works on phone and desktop

## 1. Job data

- [ ] `Job` type in `src/types/job.ts` (title, company, location, remote,
      tags, url, source, postedAt)
- [ ] `src/data/jobs.json` with 20–50 hand-picked cloud/SRE/platform/DevOps
      jobs from company career pages
- [ ] Loader in `src/lib/jobs.ts` that reads and validates jobs.json at
      build time; malformed data fails the build
- [ ] Vitest + React Testing Library set up; first test covers the loader
- [ ] Tests added to CI

## 2. Job list

- [ ] Jobs page renders real data from jobs.json: title, company, location,
      tags, posting date, link out
- [ ] Header, footer, and a homepage that leads to the board
- [ ] Visual pass: dark, bold cards, strong typography (Space Crew is the
      reference)
- [ ] Works well on phone and desktop
- [ ] "Post a job" mailto link

## 3. Search and filters

- [ ] Keyword search over title/company/tags
- [ ] Remote/location filter
- [ ] Technology/category tag filter
- [ ] Filters combine; state lives in the URL so results are shareable
- [ ] Component tests for search and filters

## 4. Automated freshness

- [ ] Script: pull RemoteOK's JSON API, filter for cloud/SRE keywords,
      link back to the original listing per their terms
- [ ] Script: parse We Work Remotely and Remotive RSS, same filtering,
      attribution links per their terms
- [ ] Dedupe (same job from two sources appears once), merge into jobs.json
- [ ] Drop listings older than a cutoff so the board stays fresh
- [ ] `npm run update-jobs` to run it manually, then a scheduled GitHub
      Action that opens a PR with refreshed data

## 5. Launch

- [ ] SEO basics: metadata, sitemap, robots.txt
- [ ] Anonymous, cookie-free analytics
- [ ] Real domain connected to Vercel
- [ ] Lighthouse pass; fix anything glaring
- [ ] Announce: CNCF Slack #jobs, DevOps communities, socials

## Later

Roughly in priority order:

1. Email job alerts — the retention feature every serious niche board has.
   May come before full accounts (a plain signup form is enough to start).
2. User accounts and saved jobs. This is what finally justifies a database
   (for user data only — jobs stay in JSON).
3. Job detail pages (`/jobs/[slug]`) with JSON-LD structured data so
   listings can appear in Google Jobs.
4. Company submission form with review/approval, replacing the mailto link.
5. Featured/paid listings (Stripe). Also the point where hosting moves off
   Vercel's free tier.
6. Company profile pages.
7. Category landing pages (Cloud, SRE, DevOps, Platform).
8. Blog/industry content for credibility.
