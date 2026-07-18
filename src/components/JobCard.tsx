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
 * One job listing as a full-width row. Links to the role's page on this
 * site, which holds the full description and the direct company link.
 */
export function JobCard({ job }: { job: Job }) {
  const stale = isStale(job.postedAt);
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={`group flex w-full items-center gap-4 rounded-2xl border border-line bg-surface/90 p-4 transition
        duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-raised
        hover:shadow-[0_8px_30px_rgba(56,189,248,0.15)] sm:p-5 ${stale ? "opacity-60" : ""}`}
    >
      <CompanyAvatar company={job.company} website={job.companyWebsite} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display truncate font-semibold text-white group-hover:text-accent">
            {job.title}
          </h3>
          {isNew(job.postedAt) && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
              ✦ new
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          <span className="font-medium">{job.company}</span>
          <span aria-hidden className="text-faint">·</span>
          <span className="truncate">{job.location}</span>
          <span aria-hidden className="text-faint">·</span>
          <span>{WORK_MODE_LABEL[job.workMode]}</span>
        </div>
      </div>

      <div className="hidden flex-wrap justify-end gap-1.5 md:flex md:max-w-[40%]">
        {job.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-line px-2 py-0.5 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 5 && (
          <span className="px-1 py-0.5 text-xs text-faint">+{job.tags.length - 5}</span>
        )}
      </div>

      <div className="shrink-0 text-right">
        <time
          dateTime={job.postedAt}
          title={job.postedAt}
          className="block text-xs text-faint"
        >
          {formatRelativeDate(job.postedAt)}
        </time>
        <span className="mt-1 hidden text-sm font-semibold text-accent opacity-0 transition group-hover:opacity-100 sm:block">
          View →
        </span>
      </div>
    </Link>
  );
}
