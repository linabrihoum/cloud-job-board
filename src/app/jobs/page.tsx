import type { Metadata } from "next";
import { JobCard } from "@/components/JobCard";
import { loadJobs } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  const jobs = loadJobs();

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-white">Open roles</h1>
        <p className="mt-2 text-sm text-muted">
          {jobs.length} verified {jobs.length === 1 ? "listing" : "listings"},
          newest first. Every role links to the company&apos;s own posting.
        </p>
      </div>

      <div className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {jobs.length === 0 ? (
            <div className="mx-auto max-w-4xl rounded-2xl border border-paper-line bg-paper-card p-10 text-center text-paper-muted">
              No listings right now — check back soon.
            </div>
          ) : (
            <div className="stagger mx-auto flex max-w-4xl flex-col gap-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
