import React from "react";
import Navbar from "../Navbar";

interface CoverSectionProps {
  numberOfJobs: number;
  numberOfCompanies: number;
}

const CoverSection: React.FC<CoverSectionProps> = ({
  numberOfJobs,
  numberOfCompanies,
}) => {
  return (
    <section className="bg-gradient-to-b from-blue-500 to-indigo-600 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Discover Your Next Opportunity
        </h1>
        <p className="text-xl mb-8">
          {numberOfJobs} jobs available from {numberOfCompanies} companies
        </p>
        <a
          href="#jobs"
          className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition duration-300"
        >
          Browse Jobs
        </a>
      </div>
    </section>
  );
};

export default CoverSection;
