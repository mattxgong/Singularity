import profile from './profile'

export interface SiteConfig {
  title: string
  author: string
  headerTitle: string
  description: string
  language: string
  locale: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo: string
  siteLogo: string
  socialBanner: string
  email: string
  github: string
  linkedin: string
  stickyNav: boolean
  analytics?: {
    umamiAnalytics?: {
      umamiWebsiteId?: string
      src?: string
    }
  }
  comments?: {
    provider?: 'giscus'
    giscusConfig?: {
      repo?: `${string}/${string}`
      repositoryId?: string
      category?: string
      categoryId?: string
      mapping?: 'url' | 'title' | 'og:title' | 'specific' | 'number' | 'pathname'
      reactions?: '0' | '1'
      metadata?: '0' | '1'
      theme?: string
      darkTheme?: string
      themeURL?: string
      lang?: string
    }
  }
  search?: {
    provider?: 'local'
    searchDocumentsPath?: string
  }
}

const basePath = process.env.BASE_PATH || ''

const siteMetadata: SiteConfig = {
  title: 'Singularity',
  author: 'Matthew Gong',
  headerTitle: 'Singularity',
  description: "Matthew Gong's personal portfolio and technical blog",
  language: 'en-us',
  locale: 'en-US',
  theme: 'dark',
  siteUrl: 'https://mattxgong-singularity.vercel.app',
  siteRepo: 'https://github.com/mattxgong/Singularity',
  siteLogo: `${basePath}/static/images/logo.png`,
  socialBanner: `${basePath}/static/images/social-card.png`,
  email: profile.email,
  github: 'https://github.com/mattxgong/Singularity',
  linkedin: 'https://ca.linkedin.com/in/matthew-x-gong',
  stickyNav: false,
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      src: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    },
  },
  comments: {
    provider: 'giscus',
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}` | undefined,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'noborder_light',
      darkTheme: 'dark_dimmed',
      lang: 'en',
    },
  },
  search: {
    provider: 'local',
    searchDocumentsPath: `${basePath}/search.json`,
  },
}

export default siteMetadata
