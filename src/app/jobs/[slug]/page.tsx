import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { Description } from "@/components/Description";
import { JobCard } from "@/components/JobCard";
import { formatRelativeDate } from "@/lib/dates";
import { getJobBySlug, loadJobs, relatedJobs } from "@/lib/jobs";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return loadJobs().map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(loadJobs(), slug);
  if (!job) return {};
  return {
    title: `${job.title} at ${job.company}`,
    description: `${job.title} at ${job.company} — ${job.location}. Verified listing, apply on the company's own site.`,
  };
}

const WORK_MODE_LABEL = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" } as const;

export default async function JobPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const jobs = loadJobs();
  const job = getJobBySlug(jobs, slug);
  if (!job) notFound();
  const related = relatedJobs(jobs, job);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.postedAt,
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: { "@type": "Place", address: job.location },
    directApply: true,
    url: job.url,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/jobs" className="text-sm font-medium text-muted transition hover:text-accent">
        ← All roles
      </Link>

      <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <CompanyAvatar company={job.company} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold leading-tight text-white">
            {job.title}
          </h1>
          <p className="mt-1 text-lg text-muted">{job.company}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-muted">
              {job.location}
            </span>
            <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-muted">
              {WORK_MODE_LABEL[job.workMode]}
            </span>
            <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-muted">
              Posted {formatRelativeDate(job.postedAt)}
            </span>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-semibold text-accent">
              ✓ Verified listing
            </span>
          </div>
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="glow-accent shrink-0 rounded-xl bg-accent px-5 py-2.5 text-center font-display font-semibold text-night transition hover:bg-accent-soft"
        >
          Apply now →
        </a>
      </header>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
            {tag}
          </span>
        ))}
      </div>

      <article className="mt-8 border-t border-line pt-8">
        {job.description ? (
          <Description text={job.description} />
        ) : (
          <p className="text-muted">
            Full details are on the company&apos;s posting — hit apply to read
            everything straight from the source.
          </p>
        )}
      </article>

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-sm text-muted">
          Applying takes you straight to {job.company}&apos;s own posting — no
          middlemen, no reposts. This listing was verified against their hiring
          system.
        </p>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="glow-accent mt-4 inline-block rounded-xl bg-accent px-8 py-3 font-display font-semibold text-night transition hover:bg-accent-soft"
        >
          Apply at {job.company} →
        </a>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display mb-4 text-xl font-bold text-white">Similar roles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <JobCard key={r.id} job={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
