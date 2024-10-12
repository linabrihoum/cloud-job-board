import React from "react";
import { Job } from "../../types/Job"; 

interface JobDetailsProps {
  job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => (
  <div>
    <h1 className="text-3xl font-bold">{job.title}</h1>
    <p className="text-xl">{job.company}</p>
    <p>{job.location}</p>
    <p className="mt-4">{job.description}</p>
    <a href={job.applyLink} className="text-blue-600 underline">
      Apply Now
    </a>
  </div>
);

export default JobDetails;
