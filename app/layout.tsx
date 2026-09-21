import 'css/tailwind.css'
import 'css/fonts.css'
import 'remark-github-blockquote-alert/alert.css'
import 'katex/dist/katex.min.css'

import localFont from 'next/font/local'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Analytics from '@/components/Analytics'
import { brand, siteMetadata } from '@/data/index'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'

const sourceSerif = localFont({
  src: '../public/fonts/source-serif-4-latin-wght-normal.woff2',
  weight: '200 900',
  display: 'swap',
  variable: '--font-source-serif',
  fallback: ['Times New Roman'],
  adjustFontFallback: 'Times New Roman',
  preload: true,
})

const sourceSerifItalic = localFont({
  src: '../public/fonts/source-serif-4-latin-wght-italic.woff2',
  weight: '200 900',
  style: 'italic',
  display: 'swap',
  variable: '--font-source-serif-italic',
  fallback: ['Times New Roman'],
  adjustFontFallback: 'Times New Roman',
  preload: false,
})

const ibmPlexSans = localFont({
  src: '../public/fonts/ibm-plex-sans-latin-wght-normal.woff2',
  weight: '100 700',
  display: 'swap',
  variable: '--font-ibm-plex-sans',
  fallback: ['Arial'],
  adjustFontFallback: 'Arial',
  preload: true,
})

const jetbrainsMono = localFont({
  src: '../public/fonts/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  display: 'swap',
  variable: '--font-jetbrains-mono',
  fallback: ['Courier New'],
  adjustFontFallback: false,
  preload: false,
})

// Display face for page titles only. Metric overrides are off because a decorative
// face has no sensible metric match in the fallback stack.
const sterion = localFont({
  src: '../public/fonts/sterion.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-sterion',
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: false,
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || ''
  // next-themes swaps this before paint when a reader has chosen otherwise.
  // Rendering it server-side is what holds the default without JavaScript.
  const defaultThemeClass = siteMetadata.theme === 'system' ? '' : siteMetadata.theme

  return (
    <html
      lang={siteMetadata.language}
      className={`${sourceSerif.variable} ${sourceSerifItalic.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} ${sterion.variable} ${defaultThemeClass}`}
      suppressHydrationWarning
    >
      <link rel="icon" href={`${basePath}/static/favicons/favicon.ico`} sizes="16x16 32x32 48x48" />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/svg+xml"
        href={`${basePath}/static/favicons/favicon.svg`}
        sizes="any"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
        color={brand.accent}
      />
      <meta name="msapplication-TileColor" content={brand.tile} />
      <meta
        name="msapplication-TileImage"
        content={`${basePath}/static/favicons/mstile-150x150.png`}
      />
      {/* Matches the default theme. ThemeSwitch retints it when the reader picks another. */}
      <meta name="theme-color" content={brand.void} />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <body className="pl-[calc(100vw-100%)] antialiased">
        <ThemeProviders>
          <Analytics />
          {children}
          {process.env.VERCEL_ENV === 'production' && <SpeedInsights />}
        </ThemeProviders>
      </body>
    </html>
  )
}
