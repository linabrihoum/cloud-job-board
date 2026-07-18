import Link from "next/link";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
          cloud<span className="text-accent">job</span>board
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted sm:gap-6">
          <Link href="/jobs" className="transition hover:text-white">
            Jobs
          </Link>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            GitHub
          </a>
          <a
            href={`mailto:${SITE.postJobEmail}`}
            className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-night transition hover:bg-accent-soft"
          >
            Post a job
          </a>
        </nav>
      </div>
    </header>
  );
}
