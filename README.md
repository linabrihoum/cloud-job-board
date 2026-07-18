# Cloud Job Board

An open source job board for cloud infrastructure, SRE, platform, and DevOps roles.

Infra jobs are hard to find on the big boards: they're mixed in with everything
else, duplicated, and often months dead. This project keeps a curated board
where every listing is relevant to cloud/SRE/platform/DevOps work, shows its
posting date, and links straight to the company's original posting. Free for
job seekers. No accounts, no paywall.

## How it works

It's a static site. Listings live in a JSON file in the repo, Next.js bakes
them into plain HTML at build time, and Vercel serves the result. No database.
Jobs are hand-picked or pulled straight from target companies' own hiring
systems (Greenhouse/Lever/Ashby public APIs), so "Apply" always lands on the
company's own posting — never an aggregator page. See
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Requires Node 20+.

## TODO

- [x] Project docs, CI (lint + build on every PR)
- [ ] Job data: `Job` type, `jobs.json` with the first hand-picked listings, validated loader, tests
- [x] Job list UI: cards with title/company/location/tags/date, responsive, dark theme
- [ ] Create a dedicated post-a-job email address (placeholder ships in `src/lib/site.ts` until then)
- [ ] Search and a filter bar on the jobs page: keyword, remote/location, technology tags, shareable URLs
- [ ] Sourcing scripts: pull target companies' live jobs from Greenhouse/Lever/Ashby APIs, keyword filtering, dedupe, scheduled refresh
- [ ] Listing verification: re-check every posting's link on a schedule; drop dead, expired, or duplicate listings
- [ ] Launch: SEO basics, anonymous analytics, real domain
- [ ] Deploy to Vercel

The detailed plan (including post-MVP ideas like email alerts and featured
listings) is in [docs/ROADMAP.md](./docs/ROADMAP.md).

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). The
[docs/](./docs/) folder holds the roadmap, architecture notes, and a log of
past decisions so you don't have to re-argue them.

## License

[AGPL-3.0](./LICENSE). In short: use and modify freely, but if you run a
modified version — including as a website — you must make your source
available under the same license.
