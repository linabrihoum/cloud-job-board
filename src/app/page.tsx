import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { loadJobs } from "@/lib/jobs";

export default function Home() {
  const jobs = loadJobs();
  const latest = jobs.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-16 text-center sm:py-24">
        <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">
          Cloud, SRE &amp; DevOps jobs.
          <br />
          <span className="text-accent">Verified. Fresh. Direct.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Every listing is checked against the company&apos;s own hiring system
          and links straight to their posting. No stale jobs, no duplicates,
          no middlemen — and always free for job seekers.
        </p>
        <div className="mt-8">
          <Link
            href="/jobs"
            className="inline-block rounded-xl bg-accent px-6 py-3 font-display font-semibold text-night transition hover:bg-accent-soft"
          >
            Browse {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
          </Link>
        </div>
      </section>

      <section className="pb-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Latest roles</h2>
          <Link href="/jobs" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
