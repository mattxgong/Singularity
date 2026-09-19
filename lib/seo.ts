interface BreadcrumbItem {
  name: string
  path: string
}

interface PersonInput {
  name: string
  url: string
  email: string
  jobTitle: string
  education: readonly string[]
  sameAs: readonly string[]
  knowsAbout?: readonly string[]
}

function absoluteUrl(siteUrl: string, path: string) {
  return new URL(path, `${siteUrl.replace(/\/$/, '')}/`).toString()
}

export function createWebsiteJsonLd(siteUrl: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url: absoluteUrl(siteUrl, '/'),
  }
}

export function createPersonJsonLd(input: PersonInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    url: input.url,
    email: `mailto:${input.email}`,
    jobTitle: input.jobTitle,
    alumniOf: input.education.map((name) => ({
      '@type': 'CollegeOrUniversity',
      name,
    })),
    sameAs: [...input.sameAs],
    ...(input.knowsAbout ? { knowsAbout: [...input.knowsAbout] } : {}),
  }
}

export function createBreadcrumbJsonLd(siteUrl: string, items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  }
}

export function createSocialImageUrl(siteUrl: string, kind: 'blog' | 'projects', slug: string) {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/')
  return absoluteUrl(siteUrl, `/og/${kind}/${encodedSlug}/`)
}
