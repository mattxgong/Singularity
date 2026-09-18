import { encodeXML } from 'entities'

const xml = (value) => encodeXML(String(value))

export const generateRssItem = (config, post) => `
  <item>
    <guid>${xml(`${config.siteUrl}/blog/${post.slug}`)}</guid>
    <title>${xml(post.title)}</title>
    <link>${xml(`${config.siteUrl}/blog/${post.slug}`)}</link>
    ${post.summary && `<description>${xml(post.summary)}</description>`}
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <author>${xml(`${config.email} (${config.author})`)}</author>
    ${post.tags?.map((tag) => `<category>${xml(tag)}</category>`).join('') ?? ''}
  </item>
`

export const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${xml(config.title)}</title>
      <link>${xml(`${config.siteUrl}/blog`)}</link>
      <description>${xml(config.description)}</description>
      <language>${xml(config.language)}</language>
      <managingEditor>${xml(`${config.email} (${config.author})`)}</managingEditor>
      <webMaster>${xml(`${config.email} (${config.author})`)}</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${xml(`${config.siteUrl}/${page}`)}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`
