"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/types/job";

const PAGE_SIZE = 20;

/**
 * The homepage job feed, Space Crew style: the list just keeps going as
 * you scroll (batches render as the sentinel enters the viewport), with a
 * "see all" banner after the fifth posting.
 */
export function HomeJobFeed({ jobs }: { jobs: Job[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visible >= jobs.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, jobs.length));
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visible, jobs.length]);

  const shown = jobs.slice(0, visible);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3">
      {shown.map((job, i) => (
        <div key={job.id} className="contents">
          <JobCard job={job} />
          {i === 4 && (
            <Link
              href="/jobs"
              className="glow-accent font-display block rounded-2xl bg-accent px-6 py-4 text-center font-semibold text-night transition hover:bg-accent-soft"
            >
              Want to see all {jobs.length} open roles? Click here →
            </Link>
          )}
        </div>
      ))}
      {visible < jobs.length && <div ref={sentinelRef} aria-hidden className="h-2" />}
      {visible >= jobs.length && (
        <p className="py-6 text-center text-sm text-paper-muted">
          That&apos;s every open role — filter the full board on the{" "}
          <Link href="/jobs" className="font-semibold text-accent-soft hover:underline">
            jobs page
          </Link>
          .
        </p>
      )}
    </div>
  );
}
