/** HTML → markdown-lite conversion for job descriptions. Output is plain
 * text (## headings, - bullets, **bold**) — no HTML ever reaches the site. */

import { JSDOM } from "jsdom";

export function htmlToMd(html: string): string {
  const dom = new JSDOM(`<body>${html}</body>`);
  const lines: string[] = [];

  function inline(node: Element | ChildNode): string {
    let out = "";
    for (const child of node.childNodes) {
      if (child.nodeType === 3) out += child.textContent ?? "";
      else if (/^(B|STRONG)$/.test(child.nodeName)) {
        const t = inline(child).trim();
        if (t) out += `**${t}**`;
      } else if (child.nodeName === "BR") out += "\n";
      else out += inline(child);
    }
    return out;
  }

  const clean = (s: string) => s.replace(/ /g, " ").replace(/[ \t]+/g, " ").trim();

  function walk(node: Element) {
    for (const el of node.children) {
      const tag = el.nodeName;
      if (/^H[1-6]$/.test(tag)) {
        const t = clean(inline(el)).replace(/\*\*/g, "");
        if (t) lines.push(`## ${t}`);
      } else if (tag === "P" || tag === "DIV") {
        const hasBlockChildren = [...el.children].some((c) =>
          /^(UL|OL|P|DIV|H[1-6])$/.test(c.nodeName)
        );
        if (hasBlockChildren) {
          walk(el);
        } else {
          for (const part of inline(el).split("\n")) {
            const t = clean(part);
            if (t) lines.push(t);
          }
        }
      } else if (tag === "UL" || tag === "OL") {
        for (const li of el.children) {
          if (li.nodeName !== "LI") continue;
          const t = clean(inline(li));
          if (t) lines.push(`- ${t}`);
          for (const sub of li.children) {
            if (sub.nodeName === "UL" || sub.nodeName === "OL") {
              for (const li2 of sub.children) {
                const t2 = clean(inline(li2));
                if (t2) lines.push(`  - ${t2}`);
              }
            }
          }
        }
      } else {
        walk(el);
      }
    }
  }

  walk(dom.window.document.body);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
