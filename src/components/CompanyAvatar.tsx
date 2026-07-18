import Image from "next/image";

/**
 * Company logo chip. When the company's website domain is known, shows its
 * real logo via Google's favicon service (no logo assets to host or
 * license); otherwise falls back to a gradient disc with the company's
 * initials. The service always returns an image, so nothing renders broken.
 */
export function CompanyAvatar({
  company,
  website,
  size = "md",
}: {
  company: string;
  website?: string;
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? 64 : 44;
  const rounded = "rounded-xl";

  if (website) {
    return (
      <div
        className={`${rounded} flex shrink-0 items-center justify-center border border-line bg-white/95 p-1.5`}
        style={{ width: px, height: px }}
      >
        <Image
          src={`https://www.google.com/s2/favicons?domain=${website}&sz=128`}
          alt={`${company} logo`}
          width={px - 12}
          height={px - 12}
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }

  let hash = 0;
  for (const ch of company) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  const initials = company
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      aria-hidden
      className={`${rounded} font-display flex shrink-0 items-center justify-center font-bold text-white`}
      style={{
        width: px,
        height: px,
        fontSize: size === "lg" ? 20 : 14,
        background: `linear-gradient(135deg, hsl(${hash} 70% 45%), hsl(${(hash + 60) % 360} 70% 30%))`,
      }}
    >
      {initials}
    </div>
  );
}
