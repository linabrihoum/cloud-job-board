import type { MetadataRoute } from "next";
import { loadJobs } from "@/lib/jobs";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const jobs = loadJobs();
  const newest = jobs[0]?.postedAt;
  return [
    {
      url: SITE.url,
      lastModified: newest,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE.url}/jobs`,
      lastModified: newest,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...jobs.map((job) => ({
      url: `${SITE.url}/jobs/${job.slug}`,
      lastModified: job.postedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
