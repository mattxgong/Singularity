import 'css/tailwind.css'
import 'css/fonts.css'
import 'remark-github-blockquote-alert/alert.css'

import localFont from 'next/font/local'
import Analytics from '@/components/Analytics'
import { siteMetadata } from '@/data/index'
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

const inter = localFont({
  src: '../public/fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
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

  return (
    <html
      lang={siteMetadata.language}
      className={`${sourceSerif.variable} ${sourceSerifItalic.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
        color="#5bbad5"
      />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <body className="pl-[calc(100vw-100%)] antialiased">
        <ThemeProviders>
          <Analytics />
          {children}
        </ThemeProviders>
      </body>
    </html>
  )
}
