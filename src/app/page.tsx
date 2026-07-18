import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { loadJobs, tagsInUse } from "@/lib/jobs";
import { SITE } from "@/lib/site";

export default function Home() {
  const jobs = loadJobs();
  const latest = jobs.slice(0, 6);
  const remoteCount = jobs.filter((j) => j.workMode === "remote").length;
  const tags = tagsInUse(jobs).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="relative py-16 text-center sm:py-24">
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute left-[8%] top-10 text-4xl opacity-60 sm:text-5xl"
        >
          ☁️
        </div>
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute right-[10%] top-24 text-3xl opacity-50 sm:text-4xl"
          style={{ animationDelay: "1.5s" }}
        >
          🛰️
        </div>
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute bottom-4 right-[22%] text-2xl opacity-40 sm:text-3xl"
          style={{ animationDelay: "3s" }}
        >
          ⚡
        </div>

        <h1 className="font-display animate-fade-up mx-auto max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">
          Your next job in the{" "}
          <span className="bg-linear-to-r from-accent to-violet bg-clip-text text-transparent">
            cloud.
          </span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted"
          style={{ animationDelay: "0.15s" }}
        >
          Hand-checked cloud, SRE &amp; DevOps roles — verified against each
          company&apos;s own hiring system, linking straight to their posting.
          No stale jobs. No middlemen. No paywall.
        </p>
        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/jobs"
            className="glow-accent font-display inline-block rounded-xl bg-accent px-7 py-3 font-semibold text-night transition hover:bg-accent-soft"
          >
            Browse {jobs.length} open {jobs.length === 1 ? "role" : "roles"} 🚀
          </Link>
          <a
            href={`mailto:${SITE.postJobEmail}`}
            className="font-display inline-block rounded-xl border border-line px-7 py-3 font-semibold text-ink transition hover:border-accent/60 hover:text-accent"
          >
            Post a job
          </a>
        </div>
        <div
          className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-faint"
          style={{ animationDelay: "0.45s" }}
        >
          <span>
            <span className="font-display font-bold text-white">{jobs.length}</span> verified
            roles
          </span>
          <span>
            <span className="font-display font-bold text-white">{remoteCount}</span> remote
          </span>
          <span>
            <span className="font-display font-bold text-white">100%</span> direct to company
          </span>
          <span>
            <span className="font-display font-bold text-white">$0</span> for job seekers
          </span>
        </div>
      </section>

      <section className="pb-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Latest roles</h2>
          <Link href="/jobs" className="text-sm font-medium text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="stagger mx-auto flex max-w-4xl flex-col gap-3">
          {latest.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
