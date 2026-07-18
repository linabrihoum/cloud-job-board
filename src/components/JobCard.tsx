import React from "react";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  tags: string[];
  logoUrl?: string;
  onApply?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  tags,
  logoUrl,
  onApply,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start bg-white dark:bg-dark-800 rounded-xl shadow-md p-6 gap-6 w-full max-w-xl mx-auto border border-gray-100 dark:border-dark-700 transition-colors">
      {/* Logo */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
        {logoUrl ? (
          <img src={logoUrl} alt="Company Logo" className="w-12 h-12 object-contain" />
        ) : (
          <span className="text-gray-400 dark:text-dark-400 text-3xl font-bold">🏢</span>
        )}
      </div>
      {/* Info */}
      <div className="flex-1 flex flex-col gap-2 w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <div className="text-gray-600 dark:text-dark-300 text-sm font-medium">{company}</div>
        <div className="text-gray-500 dark:text-dark-400 text-xs">{location}</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 px-2 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      {/* Button */}
      <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 w-full sm:w-auto">
        <button
          onClick={onApply}
          className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export { JobCard };

// Example usage with dummy data
export default function ExampleJobCard() {
  return (
    <JobCard
      title="Cloud Infrastructure Engineer"
      company="Acme Corp"
      location="Remote, USA"
      tags={["Remote", "AWS", "Terraform", "Kubernetes"]}
      // logoUrl="/path/to/logo.png"
      onApply={() => alert("Apply Now clicked!")}
    />
  );
} 