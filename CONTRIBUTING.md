# Contributing

Thanks for wanting to help! This is a small project with a clear plan, so
the best first stop is [docs/ROADMAP.md](./docs/ROADMAP.md) — it lists
what's being built and in what order. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
explains how the pieces fit, and [docs/DECISIONS.md](./docs/DECISIONS.md)
records what's already been settled (and why), so it doesn't need
re-arguing.

## Setup

You'll need Node 20+.

```bash
git clone https://github.com/linabrihoum/cloud-job-board.git
cd cloud-job-board
npm install
npm run dev     # http://localhost:3000
```

Before pushing: `npm run lint` and `npm run build` should both pass.
CI runs the same checks on every pull request.

## Workflow

Every change goes through a branch and a pull request — no direct commits
to `main`.

1. Find or open a GitHub issue describing the change.
2. Branch from `main`, named `{issue-number}-short-description`
   (e.g. `7-remote-filter`).
3. Open a pull request with `Closes #N` in the description.
4. Make sure CI is green. Branches get deleted after merge.

Commit messages follow `type(scope): what changed`, e.g.
`feat(filters): add remote-only toggle`. Types: `feat`, `fix`, `docs`,
`chore`, `test`.

## Code expectations

- TypeScript + Tailwind, matching the style of the surrounding code.
- Features come with tests; bug fixes come with a test that would have
  caught the bug.
- Define things once — if a value or rule already exists somewhere, use it
  from there.
- No secrets in the repo. If a change needs one, it goes in `.env`
  (gitignored) with the variable name added to `.env.example`.

## Adding or fixing job listings

Job data lives in `src/data/jobs.json`. Corrections and good hand-picked
listings are welcome as PRs. Listings must link to the company's original
posting, include a posting date, and respect the source's terms
(attribution and link-backs for feed-sourced jobs).

## License

This project is licensed under the [AGPL-3.0](./LICENSE). By contributing,
you agree that your contributions are licensed under the same terms.
