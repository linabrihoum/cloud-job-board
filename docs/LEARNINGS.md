# Learnings

Mistakes, gotchas, and surprises from building this project — written down
so we don't repeat them. Add an entry whenever something cost real time or
changed our approach.

## 2026-07-20 — A manual test can hide a bug the code path has

Workday listings came back with no descriptions (1 of 86). I'd verified the
detail endpoint by hand and it worked, so I first blamed rate-limiting and
added retry/backoff — wasted effort. The real bug: Workday's `externalPath`
already begins with `/job/...`, and the fetcher prepended another `/job`,
producing `/job/job/...` which Workday 406s. My hand-typed probe had used a
single `/job/`, so it never exercised the buggy construction. Lesson: when a
manual test passes but the pipeline fails, test through the *actual code
path* (call the real function) before theorizing about the network — and be
suspicious of a "throttling" theory that produces a suspiciously round
failure count like 85/86.

## 2026-07-19 — GitHub Actions can't open PRs until a repo setting allows it

The pipeline's first unattended run did everything right — discovered
boards, fetched jobs, validated, pushed the data branch — then failed with
"GitHub Actions is not permitted to create or approve pull requests." That
permission is a repo-level toggle (Settings → Actions → General → Workflow
permissions) and it defaults to OFF; nothing warns you when you write a
workflow that needs it. Fixed via
`gh api -X PUT repos/{repo}/actions/permissions/workflow` with
`can_approve_pull_request_reviews=true`. Lesson: a workflow that creates
PRs isn't done until it has run once *from the scheduler* — permissions
differ between local testing, manual dispatch, and scheduled runs.

## 2026-07-19 — Generic infra words match hardware jobs; keep a negative filter

Widening the title relevance gate immediately let SpaceX's board flood us
with ~70 "Reliability Engineers" and "Systems Engineers" that turned out
to be rocket-valve, PCB, and solar-cell manufacturing roles. Positive
keywords alone can't tell a Kubernetes SRE from an Equipment Reliability
Engineer — the gate needs an explicit negative filter for hardware/
aerospace/manufacturing vocabulary, plus a per-company cap (12) so no
single employer dominates the board. Lesson: whenever the relevance gate
widens, spot-check the top contributing companies before shipping.

## 2026-07-19 — Public ATS APIs rate-limit; probing needs manners

Probing hundreds of companies against Workable's API earned a 429 that
outlived an 8-second backoff. Mitigations now in place: a delay between
probes, one retry with backoff on 429, and — most importantly — the
pipeline treats an unreachable board as "keep yesterday's listings," never
"the jobs are gone." Only a posting missing from a *successful* board
fetch counts as removed.

## 2026-07-18 — Never install Node with winget on an nvm-managed machine

This machine manages Node with nvm-windows, which makes `C:\Program
Files\nodejs` a symlink into `%APPDATA%\nvm\v<version>`. A winget Node
install wrote its files *through* that symlink into nvm's version folder,
producing a corrupted 22/24 hybrid where `npm install` and `npx` die with
"Class extends value undefined" (while `node` and `npm run` still work,
hiding the damage). Repair: elevated PowerShell → `winget uninstall
OpenJS.NodeJS.LTS`, then `nvm install <version>` + `nvm use <version>`.
Rule: on this machine, Node versions change through nvm only.

## 2026-07-18 — Tailwind v3 directives silently do nothing under the v4 pipeline

The starter's `globals.css` used Tailwind v3's `@tailwind base/components/
utilities` directives while the build ran Tailwind v4's PostCSS plugin. The
build passed, but no utility classes were ever generated — pages quietly
rendered unstyled. v4 wants a single `@import "tailwindcss";` (and theme
tokens via `@theme` in CSS instead of `tailwind.config.ts`). Lesson: "build
passes" doesn't mean "styles exist"; when Tailwind classes have no effect,
check that the CSS entry file matches the Tailwind major version.

## 2026-07-18 — Vercel silently blocks deploys of vulnerable Next.js versions

The first production deploy kept failing even though the build log showed
`Compiled successfully` and no error anywhere. Cause: Next.js 15.4.2 had
known React Server Components CVEs, and Vercel refuses to deploy affected
versions — without saying so in the build log. The tell: Vercel's bot had
opened a PR ("Fix React Server Components CVE vulnerabilities") bumping
Next to the patched release; merging it fixed the deploy immediately.
Lesson: when a Vercel deploy fails with a clean-looking build log, check
the repo for a `vercel[bot]` security PR before debugging the build.

## 2026-07-11 — `.gitignore` was silently hiding the docs folder

The starter `.gitignore` contained a `/docs/` line, so everything written
to `docs/` was invisible to git — it would never have reached GitHub, and a
lost laptop would have meant lost docs. Lesson: when a folder never shows
up in `git status`, check `.gitignore` before assuming it's fine (`git
check-ignore -v <path>` tells you exactly which rule is hiding it).
