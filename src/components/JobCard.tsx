import { formatRelativeDate, isNew, isStale } from "@/lib/dates";
import type { Job } from "@/types/job";

const WORK_MODE_LABEL: Record<Job["workMode"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

/**
 * One job listing. The whole card is a link to the company's own posting —
 * never an aggregator page.
 */
export function JobCard({ job }: { job: Job }) {
  const stale = isStale(job.postedAt);
  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 transition
        hover:border-accent/60 hover:bg-raised ${stale ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-white group-hover:text-accent">
          {job.title}
        </h3>
        {isNew(job.postedAt) && (
          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
            new
          </span>
        )}
      </div>

      <div className="text-sm font-medium text-ink">{job.company}</div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{job.location}</span>
        <span aria-hidden>·</span>
        <span>{WORK_MODE_LABEL[job.workMode]}</span>
        <span aria-hidden>·</span>
        <time dateTime={job.postedAt} title={job.postedAt}>
          {formatRelativeDate(job.postedAt)}
        </time>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="pt-1 text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100">
        Apply on company site →
      </div>
    </a>
  );
}
