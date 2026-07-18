"use client";

import React, { useState, useMemo } from "react";
import { JobCard } from "@/components/JobCard";

// Mocked job data
const JOBS = [
  {
    id: 1,
    title: "Cloud Infrastructure Engineer",
    company: "Acme Corp",
    location: "Remote, USA",
    tags: ["Remote", "AWS", "Terraform", "Kubernetes"],
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "New York, NY",
    tags: ["React", "Remote", "TypeScript"],
  },
  {
    id: 3,
    title: "DevOps Specialist",
    company: "Cloudify",
    location: "London, UK",
    tags: ["AWS", "Terraform", "CI/CD"],
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "DataStream",
    location: "Berlin, Germany",
    tags: ["Node.js", "Remote", "PostgreSQL"],
  },
  {
    id: 5,
    title: "SRE",
    company: "OpsGen",
    location: "Remote, EU",
    tags: ["SRE", "Kubernetes", "Prometheus"],
  },
];

const ALL_TAGS = Array.from(
  new Set(JOBS.flatMap((job) => job.tags))
);

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase());
      const matchesTag = activeTag ? job.tags.includes(activeTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [search, activeTag]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Job Listings</h1>
        <input
          type="text"
          placeholder="Search jobs, companies, locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
        />
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeTag === null
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-200 border-gray-200 dark:border-dark-600"
            }`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeTag === tag
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-200 border-gray-200 dark:border-dark-600"
              }`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {filteredJobs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-dark-400">No jobs found.</div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              company={job.company}
              location={job.location}
              tags={job.tags}
              onApply={() => alert(`Apply for ${job.title} at ${job.company}`)}
            />
          ))
        )}
      </div>
    </div>
  );
} 