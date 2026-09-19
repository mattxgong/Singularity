export function StarfieldStatic() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-35 dark:opacity-45"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="coordinate-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path
            d="M 120 0 L 0 0 0 120"
            fill="none"
            stroke="var(--color-boundary)"
            strokeWidth="0.5"
            opacity="0.18"
          />
        </pattern>
        <pattern id="star-field" width="240" height="180" patternUnits="userSpaceOnUse">
          <circle cx="19" cy="37" r="1" fill="var(--color-accent)" opacity="0.55" />
          <circle cx="81" cy="126" r="0.7" fill="var(--color-ink-muted)" opacity="0.42" />
          <circle cx="142" cy="65" r="1.25" fill="var(--color-accent)" opacity="0.35" />
          <circle cx="211" cy="153" r="0.8" fill="var(--color-ink-muted)" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#coordinate-grid)" />
      <rect width="100%" height="100%" fill="url(#star-field)" />
      <circle
        cx="1180"
        cy="180"
        r="96"
        fill="none"
        stroke="var(--color-boundary)"
        strokeWidth="0.75"
        opacity="0.28"
      />
      <path
        d="M 1060 180 H 1300 M 1180 60 V 300"
        fill="none"
        stroke="var(--color-boundary)"
        strokeWidth="0.75"
        opacity="0.28"
      />
    </svg>
  )
}
