import React from "react";
import CoverSection from "../components/CoverSection/CoverSection";
import JobCard from "@/components/job/JobCard";
import { jobs } from "@/data/jobs";

const HomePage: React.FC = () => {
  const numberOfJobs = jobs.length;
  const uniqueCompanies = Array.from(new Set(jobs.map((job) => job.company)));
  const numberOfCompanies = uniqueCompanies.length;

  return (
    <div>
      <CoverSection
        numberOfJobs={numberOfJobs}
        numberOfCompanies={numberOfCompanies}
      />
      <section id="jobs" className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
