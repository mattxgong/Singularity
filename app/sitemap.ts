import { MetadataRoute } from 'next'
import { allBlogs } from 'content-collections'
import tagData from 'app/tag-data.json'
import { projects, siteMetadata } from '@/data/index'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl
  const today = new Date().toISOString().split('T')[0]

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const projectRoutes = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: today,
  }))

  const tagRoutes = Object.keys(tagData as Record<string, number>).map((tag) => ({
    url: `${siteUrl}/tags/${encodeURI(tag)}`,
    lastModified: today,
  }))

  const routes = ['', 'about', 'projects', 'resume', 'blog', 'tags', 'uses'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: today,
  }))

  return [...routes, ...projectRoutes, ...tagRoutes, ...blogRoutes]
}
