import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { Description } from "@/components/Description";
import { JobCard } from "@/components/JobCard";
import { WaveDivider } from "@/components/WaveDivider";
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
  const description = `${job.title} at ${job.company} — ${job.location}${
    job.salary ? `, ${job.salary}` : ""
  }. Verified listing; apply on the company's own site.`;
  return {
    title: `${job.title} at ${job.company}`,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      type: "article",
      title: `${job.title} at ${job.company}`,
      description,
      url: `/jobs/${job.slug}`,
    },
  };
}

/** Parse "$140k–$180k" back into numbers for structured data. */
function salaryRange(salary: string): { min: number; max: number } | null {
  const m = salary.match(/\$(\d+)k–\$(\d+)k/);
  return m ? { min: Number(m[1]) * 1000, max: Number(m[2]) * 1000 } : null;
}

const WORK_MODE_LABEL = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" } as const;

export default async function JobPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const jobs = loadJobs();
  const job = getJobBySlug(jobs, slug);
  if (!job) notFound();
  const related = relatedJobs(jobs, job);

  // Google Jobs eligibility: description is required; salary, employment
  // type, and remote signals are strongly recommended.
  const pay = job.salary ? salaryRange(job.salary) : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description
      ? job.description.replace(/^##\s+/gm, "").replace(/\*\*/g, "")
      : `${job.title} at ${job.company} — ${job.location}.`,
    datePosted: job.postedAt,
    employmentType: /full/i.test(job.employmentType ?? "") ? "FULL_TIME" : undefined,
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: { "@type": "Place", address: job.location },
    ...(job.workMode === "remote" ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(pay
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: {
              "@type": "QuantitativeValue",
              minValue: pay.min,
              maxValue: pay.max,
              unitText: "YEAR",
            },
          },
        }
      : {}),
    directApply: true,
    url: job.url,
  };

  // The one-line role facts, Space Crew style: plain details, spaced out.
  const facts = [
    `📍 ${job.location}`,
    job.salary && `💰 ${job.salary}`,
    WORK_MODE_LABEL[job.workMode],
    job.employmentType,
    `Posted ${formatRelativeDate(job.postedAt)}`,
  ].filter(Boolean) as string[];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-12 sm:px-6">
        <Link href="/jobs" className="text-sm font-medium text-muted transition hover:text-accent">
          ← All roles
        </Link>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
          <CompanyAvatar company={job.company} website={job.companyWebsite} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium text-muted">{job.company}</p>
            <h1 className="font-display mt-1 text-3xl font-bold leading-tight text-white">
              {job.title}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {facts.map((fact, i) => (
                <span key={fact} className="flex items-center gap-x-3">
                  {i > 0 && (
                    <span aria-hidden className="text-faint">
                      ·
                    </span>
                  )}
                  {fact}
                </span>
              ))}
            </p>
          </div>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glow-accent font-display shrink-0 rounded-xl bg-accent px-5 py-2.5 text-center font-semibold text-night transition hover:bg-accent-soft"
          >
            Apply now →
          </a>
        </header>
      </div>

      <WaveDivider />
      <div className="paper-stars">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <article>
            {job.description ? (
              <Description text={job.description} />
            ) : (
              <p className="text-paper-muted">
                Full details are on the company&apos;s posting — hit apply to
                read everything straight from the source.
              </p>
            )}
          </article>

          <div className="mt-10 rounded-2xl border border-paper-line bg-paper-card p-6 text-center shadow-sm">
            <p className="text-sm text-paper-muted">
              Applying takes you straight to {job.company}&apos;s own posting —
              no middlemen, no reposts.
            </p>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-accent font-display mt-4 inline-block rounded-xl bg-accent px-8 py-3 font-semibold text-night transition hover:bg-accent-soft"
            >
              Apply at {job.company} →
            </a>
          </div>

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display mb-4 text-xl font-bold text-paper-ink">
                Similar roles
              </h2>
              <div className="flex flex-col gap-3">
                {related.map((r) => (
                  <JobCard key={r.id} job={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
