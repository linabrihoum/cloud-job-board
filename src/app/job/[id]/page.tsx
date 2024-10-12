import React from "react";
import Navbar from "../../../components/Navbar";
import JobDetails from "@/components/job/JobDetails";
import { jobs } from "@/data/jobs";

interface JobDetailsPageProps {
  params: { id: string };
}

const JobDetailsPage: React.FC<JobDetailsPageProps> = ({ params }) => {
  const job = jobs.find((job) => job.id === params.id);

  if (!job) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <JobDetails job={job} />
      </div>
    </div>
  );
};

export default JobDetailsPage;
