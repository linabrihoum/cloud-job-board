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
 * One job listing as a full-width row on the light "paper" band. Links to
 * the role's page on this site, which holds the full description and the
 * direct company link.
 */
export function JobCard({ job }: { job: Job }) {
  const stale = isStale(job.postedAt);
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className={`group flex w-full items-center gap-4 rounded-2xl border border-paper-line bg-paper-card p-4 shadow-sm transition
        duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_8px_30px_rgba(56,189,248,0.25)]
        sm:p-5 ${stale ? "opacity-60" : ""}`}
    >
      <CompanyAvatar company={job.company} website={job.companyWebsite} />

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-paper-muted">{job.company}</div>
        <div className="flex items-center gap-2">
          <h3 className="font-display truncate text-lg font-semibold text-paper-ink group-hover:text-accent-soft">
            {job.title}
          </h3>
          {isNew(job.postedAt) && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-soft">
              ✦ new
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-paper-muted">
          <span className="truncate">{job.location}</span>
          {job.salary && (
            <>
              <span aria-hidden>·</span>
              <span className="font-medium text-accent-soft">💰 {job.salary}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{WORK_MODE_LABEL[job.workMode]}</span>
        </div>
      </div>

      <div className="hidden flex-wrap justify-end gap-1.5 md:flex md:max-w-[40%]">
        {job.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-paper-line bg-paper px-2 py-0.5 text-xs text-paper-muted"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 5 && (
          <span className="px-1 py-0.5 text-xs text-paper-muted">+{job.tags.length - 5}</span>
        )}
      </div>

      <div className="shrink-0 text-right">
        <time
          dateTime={job.postedAt}
          title={job.postedAt}
          className="block text-xs text-paper-muted"
        >
          {formatRelativeDate(job.postedAt)}
        </time>
        <span className="mt-1 hidden text-sm font-semibold text-accent-soft opacity-0 transition group-hover:opacity-100 sm:block">
          View →
        </span>
      </div>
    </Link>
  );
}
