/**
 * The OKLCH tokens in css/tailwind.css resolved to sRGB hex.
 *
 * Browser chrome, the web manifest, and next/og all run outside the CSS
 * cascade and cannot read a custom property, so they need literal values.
 * scripts/generate-identity-assets.mjs carries the same table for the icon
 * artwork; change both together.
 */
const brand = {
  /** --color-plate-50, the light-theme surface. */
  plate: '#fcfaf4',
  /** --color-void-950, the dark-theme surface. */
  void: '#02060f',
  /** --color-void-900, the ground the icon mark is drawn on. */
  tile: '#08121f',
  /** --color-starlight-700, the light-theme accent. */
  accent: '#004e69',
  /** --color-void-600, muted ink on the plate surface. */
  inkMuted: '#39495d',
  /** --color-plate-400, hairline rules on the plate surface. */
  rule: '#b2aea1',
} as const

export default brand
