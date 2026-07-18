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
Jobs come from hand-picked listings plus feeds that permit reuse (RemoteOK's
API, We Work Remotely and Remotive RSS) with attribution and links back to the
source. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture.

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
- [ ] Deploy to Vercel
- [ ] Job data: `Job` type, `jobs.json` with the first hand-picked listings, validated loader, tests
- [ ] Job list UI: cards with title/company/location/tags/date, responsive, dark theme
- [ ] Search and filters: keyword, remote/location, technology tags, shareable URLs
- [ ] Feed scripts: RemoteOK + WWR + Remotive, keyword filtering, dedupe, scheduled refresh
- [ ] Launch: SEO basics, anonymous analytics, real domain

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
