/** Site-wide constants, defined once. */
export const SITE = {
  name: "Cloud Job Board",
  /** Canonical origin. Swap once the real domain is purchased + connected. */
  url: "https://cloud-job-board.vercel.app",
  tagline: "Cloud, DevOps & SRE Jobs — Verified Daily",
  description:
    "Verified cloud engineering, DevOps, SRE, and platform engineering jobs, updated daily. Every listing is checked against the company's own hiring system and links straight to their posting. Free for job seekers.",
  githubUrl: "https://github.com/linabrihoum/cloud-job-board",
  /** Listings newer than this many days get a "new" badge. */
  newWithinDays: 7,
  /** Listings older than this many days render visually muted. */
  staleAfterDays: 45,
} as const;
