import Link from "next/link";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { formatRelativeDate, isNew, isStale } from "@/lib/dates";
import type { Job } from "@/types/job";

const WORK_MODE_LABEL: Record<Job["workMode"], string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

/**
 * One job listing. Links to the role's own page on this site, which holds
 * the full description and the direct link to the company's posting.
 */
export function JobCard({ job }: { job: Job }) {
  const stale = isStale(job.postedAt);
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={`group flex flex-col gap-3 rounded-2xl border border-line bg-surface/90 p-5 transition
        duration-200 hover:-translate-y-1 hover:border-accent/60 hover:bg-raised
        hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] ${stale ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar company={job.company} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold leading-snug text-white group-hover:text-accent">
            {job.title}
          </h3>
          <div className="mt-0.5 text-sm text-muted">{job.company}</div>
        </div>
        {isNew(job.postedAt) && (
          <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
            ✦ new
          </span>
        )}
      </div>

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
        {job.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 4 && (
          <span className="px-1 py-0.5 text-xs text-faint">+{job.tags.length - 4}</span>
        )}
      </div>

      <div className="pt-1 text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100">
        View role →
      </div>
    </Link>
  );
}
