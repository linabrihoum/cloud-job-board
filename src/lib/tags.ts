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

/** Detection patterns per canonical tag, run against title + description. */
const TAG_PATTERNS: Record<CanonicalTag, RegExp> = {
  AWS: /\baws\b|amazon web services/i,
  Azure: /\bazure\b/i,
  GCP: /\bgcp\b|google cloud/i,
  Kubernetes: /kubernetes|\bk8s\b|\beks\b|\bgke\b|\baks\b/i,
  Docker: /\bdocker\b|containeriz/i,
  Terraform: /terraform/i,
  Ansible: /ansible/i,
  Jenkins: /jenkins/i,
  "GitHub Actions": /github actions/i,
  Helm: /\bhelm\b/i,
  Argo: /\bargo(cd| cd|\b)/i,
  Linux: /\blinux\b/i,
  Python: /\bpython\b/i,
  Go: /\bgolang\b|\bgo\b(?=[,.\s]+(?:and|or|is|programming|experience|developer))/i,
  PostgreSQL: /postgres/i,
  MySQL: /mysql/i,
  Redis: /\bredis\b/i,
  Kafka: /\bkafka\b/i,
  Prometheus: /prometheus/i,
  Grafana: /grafana/i,
  Datadog: /datadog/i,
  Elasticsearch: /elastic ?search|\belk\b/i,
};

/** Derive canonical tech tags from free text (title + description). */
export function detectTags(text: string, max = 8): CanonicalTag[] {
  return CANONICAL_TAGS.filter((tag) => TAG_PATTERNS[tag].test(text)).slice(0, max);
}
