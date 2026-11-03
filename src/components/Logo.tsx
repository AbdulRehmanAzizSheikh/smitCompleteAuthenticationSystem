/** Aegis Auth brand mark — a shield with a keyhole, rendered in the signature gradient. */
export default function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Aegis Auth logo"
    >
      <defs>
        <linearGradient id="aegis-g" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7cc4ff" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="aegis-g2" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dbeafe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 40.5 10.2v12.6c0 10.4-6.8 18.6-16.5 22.4C14.3 41.4 7.5 33.2 7.5 22.8V10.2L24 3Z"
        fill="url(#aegis-g)"
        fillOpacity="0.22"
        stroke="url(#aegis-g)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="20.5" r="5.2" stroke="url(#aegis-g2)" strokeWidth="2.4" />
      <path d="M24 24.5v9.5" stroke="url(#aegis-g2)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="37.5" r="1.6" fill="url(#aegis-g2)" />
    </svg>
  );
}
