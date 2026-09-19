import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import tagData from '../app/tag-data.json' with { type: 'json' }
import { allBlogs } from '../.content-collections/generated/index.js'
import { generateRss } from './rss-utils.mjs'

// Keep these values aligned with data/site.ts; this standalone script cannot import TypeScript.
const siteMetadata = {
  title: 'Singularity',
  author: 'Matthew Gong',
  description: "Matthew Gong's personal portfolio and technical blog",
  language: 'en-us',
  siteUrl: 'https://mattxgong-singularity.vercel.app',
  email: 'matthewxgong@gmail.com',
}

const sortPosts = (posts) =>
  [...posts].sort((first, second) => Date.parse(second.date) - Date.parse(first.date))

const outputFolder = process.env.EXPORT ? 'out' : 'public'

async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./${outputFolder}/${page}`, rss)
  }

  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allBlogs.filter((post) => post.tags.map((t) => slug(t)).includes(tag))
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join(outputFolder, 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
