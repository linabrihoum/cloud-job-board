import type { Metadata } from "next";
import { JobCard } from "@/components/JobCard";
import { loadJobs } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  const jobs = loadJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Open roles</h1>
      <p className="mt-2 text-sm text-muted">
        {jobs.length} verified {jobs.length === 1 ? "listing" : "listings"},
        newest first. Every card links to the company&apos;s own posting.
      </p>

      {jobs.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-line bg-surface p-10 text-center text-muted">
          No listings right now — check back soon.
        </div>
      ) : (
        <div className="stagger mx-auto mt-8 flex max-w-4xl flex-col gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
