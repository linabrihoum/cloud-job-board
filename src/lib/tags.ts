/**
 * The canonical tag list — concrete technologies only, no vague role labels
 * (the role is what the title is for). Defined once and used everywhere:
 * job data is validated against it, filter chips are built from it, and the
 * sourcing scripts map descriptions onto it. Add new tags here, nowhere else.
 */
export const CANONICAL_TAGS = [
  "AWS",
  "Azure",
  "GCP",
  "Kubernetes",
  "Docker",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "Helm",
  "Argo",
  "Linux",
  "Python",
  "Go",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Kafka",
  "Prometheus",
  "Grafana",
  "Datadog",
  "Elasticsearch",
] as const;

export type CanonicalTag = (typeof CANONICAL_TAGS)[number];
