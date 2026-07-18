/**
 * Company "logo" chip: a gradient disc with the company's initials.
 * The hue is derived from the company name, so each company gets a
 * stable, distinct color without hosting any logo assets.
 */
export function CompanyAvatar({
  company,
  size = "md",
}: {
  company: string;
  size?: "md" | "lg";
}) {
  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  const initials = company
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";
  return (
    <div
      aria-hidden
      className={`${dim} flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-white`}
      style={{
        background: `linear-gradient(135deg, hsl(${hash} 70% 45%), hsl(${(hash + 60) % 360} 70% 30%))`,
      }}
    >
      {initials}
    </div>
  );
}
