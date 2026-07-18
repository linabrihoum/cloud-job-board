/**
 * The canonical tag list. Defined once and used everywhere: job data is
 * validated against it, filter chips are built from it, and the Phase 4
 * feed scripts will map source tags onto it. Add new tags here, nowhere else.
 */
export const CANONICAL_TAGS = [
  "AWS",
  "Azure",
  "GCP",
  "Kubernetes",
  "Docker",
  "Terraform",
  "Ansible",
  "Linux",
  "CI/CD",
  "SRE",
  "DevOps",
  "Platform Engineering",
  "Cloud Architecture",
  "Infrastructure",
  "Observability",
  "Security",
  "Databases",
  "Networking",
  "Go",
  "Python",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];
