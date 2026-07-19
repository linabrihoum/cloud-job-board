"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { JobCard } from "@/components/JobCard";
import {
  EMPTY_FILTER,
  LEVELS,
  LEVEL_LABEL,
  REGIONS,
  filterJobs,
  isEmptyFilter,
  levelOf,
  parseFilter,
  regionOf,
  toQueryString,
  type JobFilter,
  type Level,
  type Region,
} from "@/lib/filter";
import type { Job, WorkMode } from "@/types/job";

const MODES: { value: WorkMode | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

function PillGroup<T extends string>({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  active: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-paper-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 rounded-xl border border-paper-line bg-paper p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active === o.value
                ? "bg-accent text-night"
                : "text-paper-muted hover:text-paper-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The interactive jobs list: filter bar + results. Filter state lives in
 * the URL (?q=&mode=&tags=), so every filtered view is a shareable link.
 */
export function JobBoard({ jobs, allTags }: { jobs: Job[]; allTags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(() => parseFilter(new URLSearchParams(searchParams)), [searchParams]);
  const results = useMemo(() => filterJobs(jobs, filter), [jobs, filter]);

  // Only offer level/region options that actually exist in the data.
  const levelOptions = useMemo(() => {
    const present = new Set(jobs.map((j) => levelOf(j.title)));
    return [
      { value: "all" as Level | "all", label: "All" },
      ...LEVELS.filter((l) => present.has(l)).map((l) => ({
        value: l as Level | "all",
        label: LEVEL_LABEL[l],
      })),
    ];
  }, [jobs]);
  const regionOptions = useMemo(() => {
    const present = new Set(jobs.map((j) => regionOf(j.location)));
    return [
      { value: "all" as Region | "all", label: "All" },
      ...REGIONS.filter((r) => present.has(r)).map((r) => ({
        value: r as Region | "all",
        label: r,
      })),
    ];
  }, [jobs]);

  const apply = (next: JobFilter) => {
    router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });
  };

  const toggleTag = (tag: string) => {
    const tags = filter.tags.includes(tag)
      ? filter.tags.filter((t) => t !== tag)
      : [...filter.tags, tag];
    apply({ ...filter, tags });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-paper-line bg-paper-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={filter.q}
            onChange={(e) => apply({ ...filter, q: e.target.value })}
            placeholder="Search title, company, or technology…"
            aria-label="Search jobs"
            className="w-full rounded-xl border border-paper-line bg-paper px-4 py-2.5 text-sm text-paper-ink outline-none transition placeholder:text-paper-muted/70 focus:border-accent"
          />
          <div className="flex shrink-0 gap-1 rounded-xl border border-paper-line bg-paper p-1">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => apply({ ...filter, mode: m.value })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter.mode === m.value
                    ? "bg-accent text-night"
                    : "text-paper-muted hover:text-paper-ink"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <PillGroup
            label="Level"
            options={levelOptions}
            active={filter.level}
            onSelect={(level) => apply({ ...filter, level })}
          />
          <PillGroup
            label="Region"
            options={regionOptions}
            active={filter.region}
            onSelect={(region) => apply({ ...filter, region })}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {allTags.map((tag) => {
            const active = filter.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-accent bg-accent/15 text-accent-soft"
                    : "border-paper-line bg-paper text-paper-muted hover:border-accent/50 hover:text-paper-ink"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {!isEmptyFilter(filter) && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => apply(EMPTY_FILTER)}
              className="text-xs font-semibold text-accent-soft hover:underline"
            >
              Clear filters ✕
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-paper-muted" role="status">
        {results.length} {results.length === 1 ? "role" : "roles"}
        {isEmptyFilter(filter) ? "" : " matching your filters"}
      </p>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-paper-line bg-paper-card p-10 text-center text-paper-muted">
          No matches — try removing a filter or broadening the search.
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {results.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
