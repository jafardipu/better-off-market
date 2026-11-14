const MESSAGE =
  "We're Launching Black Friday! · BetterOffMarket officially launches November 27, 2026. · We're putting the finishing touches on the platform. Stay tuned!";

export default function LaunchMarquee() {
  return (
    <div
      className="relative z-40 w-full overflow-hidden bg-primary-color text-white"
      role="status"
      aria-label={MESSAGE}
    >
      <div className="flex whitespace-nowrap py-2.5 text-sm font-medium tracking-wide sm:text-base">
        <div className="launch-marquee flex shrink-0 items-center gap-12 px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={`a-${i}`} className="inline-flex items-center gap-12">
              <span>{MESSAGE}</span>
              <span aria-hidden className="text-white/40">
                ★
              </span>
            </span>
          ))}
        </div>
        <div
          className="launch-marquee flex shrink-0 items-center gap-12 px-6"
          aria-hidden
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={`b-${i}`} className="inline-flex items-center gap-12">
              <span>{MESSAGE}</span>
              <span className="text-white/40">★</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
