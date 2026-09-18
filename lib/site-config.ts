export interface SiteConfig {
  title: string
  author: string
  headerTitle: string
  description: string
  language: string
  theme: 'system' | 'dark' | 'light'
  siteUrl: string
  siteRepo: string
  siteLogo: string
  socialBanner: string
  email: string
  github?: string
  x?: string
  facebook?: string
  youtube?: string
  linkedin?: string
  threads?: string
  instagram?: string
  medium?: string
  bluesky?: string
  mastodon?: string
  locale: string
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
  [key: string]: unknown
}
