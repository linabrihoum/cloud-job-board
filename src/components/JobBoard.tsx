"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FilterDropdown, type DropdownOption } from "@/components/FilterDropdown";
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
  type WorkModeFilter,
} from "@/lib/filter";
import type { Job } from "@/types/job";

const MODE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All work modes" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

/**
 * The interactive jobs list: a search bar, four centered filter dropdowns
 * (Level, Region, Work mode, Technology — each searchable while open), and
 * the results. Filter state lives in the URL, so every filtered view is a
 * shareable link.
 */
export function JobBoard({ jobs, allTags }: { jobs: Job[]; allTags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(() => parseFilter(new URLSearchParams(searchParams)), [searchParams]);
  const results = useMemo(() => filterJobs(jobs, filter), [jobs, filter]);

  // Only offer level/region options that actually exist in the data.
  const levelOptions = useMemo<DropdownOption[]>(() => {
    const present = new Set(jobs.map((j) => levelOf(j.title)));
    return [
      { value: "all", label: "All levels" },
      ...LEVELS.filter((l) => present.has(l)).map((l) => ({ value: l, label: LEVEL_LABEL[l] })),
    ];
  }, [jobs]);
  const regionOptions = useMemo<DropdownOption[]>(() => {
    const present = new Set(jobs.map((j) => regionOf(j.location)));
    return [
      { value: "all", label: "All regions" },
      ...REGIONS.filter((r) => present.has(r)).map((r) => ({ value: r, label: r })),
    ];
  }, [jobs]);
  const tagOptions = useMemo<DropdownOption[]>(
    () => allTags.map((t) => ({ value: t, label: t })),
    [allTags]
  );

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
        <input
          type="search"
          value={filter.q}
          onChange={(e) => apply({ ...filter, q: e.target.value })}
          placeholder="Search title, company, or technology…"
          aria-label="Search jobs"
          className="w-full rounded-xl border border-paper-line bg-paper px-4 py-2.5 text-sm text-paper-ink outline-none transition placeholder:text-paper-muted/70 focus:border-accent"
        />

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <FilterDropdown
            label="Level"
            options={levelOptions}
            selected={filter.level}
            onChange={(level) => apply({ ...filter, level: level as Level | "all" })}
          />
          <FilterDropdown
            label="Region"
            options={regionOptions}
            selected={filter.region}
            onChange={(region) => apply({ ...filter, region: region as Region | "all" })}
          />
          <FilterDropdown
            label="Work mode"
            options={MODE_OPTIONS}
            selected={filter.mode}
            onChange={(mode) => apply({ ...filter, mode: mode as WorkModeFilter })}
          />
          <FilterDropdown
            label="Technology"
            options={tagOptions}
            selected={filter.tags}
            multi
            onChange={toggleTag}
          />
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
