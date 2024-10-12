import React from "react";
import Link from "next/link";
import { Job } from "../../types/Job"; 

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => (
  <div className="p-4 border rounded-md shadow-md">
    <h2 className="text-xl font-bold">{job.title}</h2>
    <p className="text-gray-600">{job.company}</p>
    <p className="text-gray-500">{job.location}</p>
    <Link href={`/job/${job.id}`} className="text-blue-600 underline">
      View Details
    </Link>
  </div>
);

export default JobCard;
