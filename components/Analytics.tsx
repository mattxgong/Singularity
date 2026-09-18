import Script from 'next/script'
import siteMetadata from '@/data/siteMetadata'

export default function Analytics() {
  const config = siteMetadata.analytics?.umamiAnalytics

  if (process.env.NODE_ENV !== 'production' || !config?.umamiWebsiteId) return null

  return (
    <Script
      defer
      src={config.src ?? 'https://analytics.umami.is/script.js'}
      data-website-id={config.umamiWebsiteId}
      strategy="afterInteractive"
    />
  )
}
