const { withContentCollections } = require('@content-collections/next')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const defaultUmamiOrigin = 'https://analytics.umami.is'
const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || `${defaultUmamiOrigin}/script.js`
let umamiOrigin = defaultUmamiOrigin

try {
  umamiOrigin = new URL(umamiScriptUrl).origin
} catch {
  // The application remains analytics-free when the deployment URL is invalid.
}

const developmentScriptSource = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"

// unsafe-inline remains accepted because nonce-based scripts require middleware and would
// forfeit the site's fully static deployment model.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${developmentScriptSource} giscus.app ${umamiOrigin};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  media-src 'none';
  connect-src 'self' ${umamiOrigin};
  font-src 'self';
  frame-src giscus.app;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none'
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentCollections, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    reactStrictMode: true,
    trailingSlash: true,
    turbopack: {
      root: process.cwd(),
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
      formats: ['image/avif', 'image/webp'],
      unoptimized,
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
