# Cloud Job Board

An open source job board for cloud infrastructure, SRE, platform, and DevOps roles.

Infra jobs are hard to find on the big boards as they are mixed in with everything
else, duplicated, and often months dead. 
This project keeps a curated board where every listing is relevant to cloud/SRE/platform/DevOps work, shows its
posting date, and links straight to the company's original posting, completely for free.

## How it works

It's a static site where listings live in a JSON file in the repo, Next.js bakes
them into plain HTML at build time, and Vercel serves the result. No database is being used currently for simplicity.


A daily pipeline discovers company hiring boards from public sources and
pulls live roles straight from each company's own hiring system
(Greenhouse, Lever, Ashby, Workable, SmartRecruiters, USAJobs), so "Apply"
always lands on the company's own posting.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full picture and [docs/ROADMAP.md](./docs/ROADMAP.md) for what's planned.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

Requires Node 20+.

## Contributing

Contributions are always welcome! 
Please see [CONTRIBUTING.md](./CONTRIBUTING.md). The
[docs/](./docs/) folder holds the roadmap, architecture notes, and a log of
past decisions so you don't have to re-argue them.

## License

[AGPL-3.0](./LICENSE). In short, use and modify freely. However, if you run a
modified version — including as a website — you must make your source
available under the same license.
