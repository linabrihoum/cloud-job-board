import type { ReactNode } from "react";

/**
 * Renders a job description stored as markdown-lite (## headings, - bullets,
 * **bold**). Everything is plain text rendered through React — no raw HTML
 * ever reaches the page, so scraped descriptions can't inject markup.
 */
export function Description({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key++} className="my-3 list-disc space-y-1.5 pl-5 marker:text-accent-soft">
        {list.map((item, i) => (
          <li key={i}>{bold(item)}</li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else {
      flushList();
      if (!line) continue;
      if (line.startsWith("## ")) {
        blocks.push(
          <h2 key={key++} className="font-display mt-8 mb-3 text-xl font-bold text-paper-ink">
            {line.slice(3)}
          </h2>
        );
      } else {
        blocks.push(
          <p key={key++} className="my-3 leading-relaxed">
            {bold(line)}
          </p>
        );
      }
    }
  }
  flushList();

  return <div className="text-paper-ink/85">{blocks}</div>;
}

/** Turns **bold** spans into <strong> elements. */
function bold(text: string): ReactNode[] {
  return text.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-paper-ink">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
