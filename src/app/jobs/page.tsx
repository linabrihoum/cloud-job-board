import type { Metadata } from "next";
import { Suspense } from "react";
import { JobBoard } from "@/components/JobBoard";
import { loadJobs, tagsInUse } from "@/lib/jobs";

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
          <Suspense>
            <JobBoard jobs={jobs} allTags={tagsInUse(jobs)} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
