import React from "react";
import Link from "next/link";

interface NavbarProps {
  backgroundClass?: string;
}

const Navbar: React.FC<NavbarProps> = ({ backgroundClass = "" }) => {
  return (
    <nav
      className={`text-white ${backgroundClass} ${
        backgroundClass.includes("fixed") ? "" : "relative"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="text-2xl font-bold">
          DevOps & Cloud Jobs
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
