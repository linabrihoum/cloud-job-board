/** Curved transition from the dark cosmos into the light paper band —
 * replaces the hard horizontal edge between sections. */
export function WaveDivider() {
  return (
    <div aria-hidden className="-mb-px">
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className="block h-10 w-full sm:h-16"
      >
        <path
          d="M0,40 C240,72 480,8 720,24 C960,40 1200,72 1440,32 L1440,72 L0,72 Z"
          fill="var(--color-paper)"
        />
      </svg>
    </div>
  );
}
