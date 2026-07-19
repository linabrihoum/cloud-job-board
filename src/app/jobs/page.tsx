import type { Metadata } from "next";
import { JobBoard } from "@/components/JobBoard";
import { WaveDivider } from "@/components/WaveDivider";
import { loadJobs, tagsInUse } from "@/lib/jobs";

export function generateMetadata(): Metadata {
  const count = loadJobs().length;
  return {
    title: `Cloud, DevOps & SRE Jobs — ${count} Verified Listings`,
    description: `Browse ${count} verified cloud engineering, DevOps, SRE, and platform engineering jobs. Updated daily, every listing links straight to the company's own posting. Free, no sign-up.`,
  };
}

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

      <WaveDivider />
      <div className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <JobBoard jobs={jobs} allTags={tagsInUse(jobs)} />
        </div>
      </div>
    </div>
  );
}
