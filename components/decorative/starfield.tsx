import type { CSSProperties } from 'react'

type Star = {
  cx: number
  cy: number
  r: number
  fill: string
  opacity: number
}

type StarLayer = {
  id: string
  // Drift translates by exactly one tile, so the loop is seamless.
  tile: { width: number; height: number }
  duration: string
  // The pulse runs on the whole layer. Animating circles inside the SVG pattern
  // would force the tile to re-rasterize every frame.
  twinkle?: { duration: string; delay: string }
  stars: Star[]
}

const accent = 'var(--color-accent)'
const muted = 'var(--color-ink-muted)'

const starLayers: StarLayer[] = [
  {
    id: 'starfield-far',
    tile: { width: 220, height: 170 },
    duration: '600s',
    stars: [
      { cx: 17, cy: 31, r: 0.6, fill: muted, opacity: 0.32 },
      { cx: 63, cy: 118, r: 0.5, fill: accent, opacity: 0.28 },
      { cx: 104, cy: 44, r: 0.7, fill: muted, opacity: 0.38 },
      { cx: 138, cy: 151, r: 0.55, fill: muted, opacity: 0.3 },
      { cx: 172, cy: 86, r: 0.6, fill: accent, opacity: 0.34 },
      { cx: 196, cy: 23, r: 0.5, fill: muted, opacity: 0.26 },
      { cx: 41, cy: 142, r: 0.65, fill: muted, opacity: 0.36 },
      { cx: 89, cy: 74, r: 0.5, fill: accent, opacity: 0.3 },
    ],
  },
  {
    id: 'starfield-mid',
    tile: { width: 300, height: 240 },
    duration: '380s',
    stars: [
      { cx: 29, cy: 52, r: 0.9, fill: accent, opacity: 0.5 },
      { cx: 112, cy: 181, r: 0.8, fill: muted, opacity: 0.44 },
      { cx: 167, cy: 37, r: 1, fill: muted, opacity: 0.52 },
      { cx: 241, cy: 129, r: 0.85, fill: accent, opacity: 0.46 },
      { cx: 73, cy: 213, r: 0.75, fill: muted, opacity: 0.42 },
      { cx: 277, cy: 96, r: 0.9, fill: muted, opacity: 0.48 },
    ],
  },
  {
    id: 'starfield-near',
    tile: { width: 420, height: 340 },
    duration: '240s',
    stars: [
      { cx: 58, cy: 91, r: 1.3, fill: accent, opacity: 0.62 },
      { cx: 203, cy: 247, r: 1.15, fill: muted, opacity: 0.55 },
      { cx: 331, cy: 63, r: 1.4, fill: accent, opacity: 0.58 },
      { cx: 389, cy: 198, r: 1.2, fill: muted, opacity: 0.6 },
    ],
  },
  {
    id: 'starfield-twinkle-slow',
    tile: { width: 340, height: 270 },
    duration: '460s',
    twinkle: { duration: '11s', delay: '-3.5s' },
    stars: [
      { cx: 47, cy: 208, r: 0.85, fill: accent, opacity: 0.5 },
      { cx: 154, cy: 71, r: 0.7, fill: muted, opacity: 0.44 },
      { cx: 268, cy: 163, r: 0.95, fill: accent, opacity: 0.52 },
      { cx: 311, cy: 29, r: 0.7, fill: muted, opacity: 0.4 },
      { cx: 96, cy: 129, r: 0.8, fill: muted, opacity: 0.46 },
    ],
  },
  {
    id: 'starfield-twinkle-fast',
    tile: { width: 480, height: 390 },
    duration: '300s',
    twinkle: { duration: '7s', delay: '-1.2s' },
    stars: [
      { cx: 121, cy: 57, r: 1.2, fill: accent, opacity: 0.6 },
      { cx: 366, cy: 214, r: 1.05, fill: muted, opacity: 0.54 },
      { cx: 244, cy: 341, r: 1.3, fill: accent, opacity: 0.58 },
      { cx: 431, cy: 118, r: 0.95, fill: muted, opacity: 0.5 },
    ],
  },
]

export function Starfield() {
  return (
    <div aria-hidden="true" className="starfield">
      <div className="starfield-nebula" />

      {starLayers.map((layer) => (
        <div
          key={layer.id}
          className={layer.twinkle ? 'starfield-layer starfield-layer--twinkle' : 'starfield-layer'}
          style={
            {
              '--starfield-tile-x': `${layer.tile.width}px`,
              '--starfield-tile-y': `${layer.tile.height}px`,
              '--starfield-duration': layer.duration,
              '--starfield-twinkle-duration': layer.twinkle?.duration,
              '--starfield-twinkle-delay': layer.twinkle?.delay,
            } as CSSProperties
          }
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id={layer.id}
                width={layer.tile.width}
                height={layer.tile.height}
                patternUnits="userSpaceOnUse"
              >
                {layer.stars.map((star) => (
                  <circle
                    key={`${star.cx}-${star.cy}`}
                    cx={star.cx}
                    cy={star.cy}
                    r={star.r}
                    fill={star.fill}
                    opacity={star.opacity}
                  />
                ))}
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${layer.id})`} />
          </svg>
        </div>
      ))}

      <svg
        className="starfield-instrument"
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
        </defs>
        <rect width="100%" height="100%" fill="url(#coordinate-grid)" />
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
    </div>
  )
}
