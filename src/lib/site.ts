/** Site-wide constants, defined once. */
export const SITE = {
  name: "Cloud Job Board",
  tagline: "Cloud, SRE & DevOps jobs. Verified, fresh, no middlemen.",
  description:
    "A curated job board for cloud infrastructure, SRE, platform, and DevOps roles. Every listing is verified live and links straight to the company's own posting.",
  githubUrl: "https://github.com/linabrihoum/cloud-job-board",
  /**
   * TODO(lina): replace with the dedicated posting address once created.
   * Deliberately a placeholder so a personal inbox never ships publicly.
   */
  postJobEmail: "post-a-job@example.com",
  /** Listings newer than this many days get a "new" badge. */
  newWithinDays: 7,
  /** Listings older than this many days render visually muted. */
  staleAfterDays: 45,
} as const;
