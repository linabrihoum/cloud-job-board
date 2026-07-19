import Link from "next/link";
import { HomeJobFeed } from "@/components/HomeJobFeed";
import { loadJobs } from "@/lib/jobs";

export default function Home() {
  const jobs = loadJobs();
  const remoteCount = jobs.filter((j) => j.workMode === "remote").length;

  return (
    <div>
      <section className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
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
          Cloud, Site Reliability, DevOps, and Platform Engineering roles that
          are verified against each company&apos;s own hiring system and link
          straight to their posting. No stale jobs. No middlemen. No paywall.
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

      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mx-auto mb-6 flex max-w-4xl items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold text-paper-ink">Latest roles</h2>
            <Link
              href="/jobs"
              className="text-sm font-medium text-accent-soft hover:underline"
            >
              View all →
            </Link>
          </div>
          <HomeJobFeed jobs={jobs} />

          <section className="mx-auto mt-14 max-w-4xl border-t border-paper-line pt-10">
            <h2 className="font-display text-xl font-bold text-paper-ink">
              Find your specialty
            </h2>
            <p className="mt-2 text-sm text-paper-muted">
              Every listing here is a cloud infrastructure role — browse by
              what you do: DevOps engineer jobs, site reliability engineer
              (SRE) jobs, platform engineering roles, cloud security, and
              remote-first cloud engineer positions across AWS, Azure, and
              Google Cloud.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Remote cloud jobs", href: "/jobs?mode=remote" },
                { label: "AWS jobs", href: "/jobs?tags=AWS" },
                { label: "Azure jobs", href: "/jobs?tags=Azure" },
                { label: "GCP jobs", href: "/jobs?tags=GCP" },
                { label: "Kubernetes jobs", href: "/jobs?tags=Kubernetes" },
                { label: "Terraform jobs", href: "/jobs?tags=Terraform" },
                { label: "Senior roles", href: "/jobs?level=senior" },
                { label: "US-based roles", href: "/jobs?region=US" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-paper-line bg-paper-card px-3 py-1.5 text-sm text-paper-muted transition hover:border-accent hover:text-accent-soft"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
