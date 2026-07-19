import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-faint sm:px-6">
        <p>
          Every listing links straight to the company&apos;s own posting and is
          verified against it. No accounts, no tracking, no paywall.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            Open source under{" "}
            <a
              href={`${SITE.githubUrl}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition hover:text-muted"
            >
              AGPL-3.0
            </a>{" "}
            ·{" "}
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition hover:text-muted"
            >
              Contribute on GitHub
            </a>
          </p>
          <p className="ml-auto">Made by Lina Brihoum</p>
        </div>
      </div>
    </footer>
  );
}
