import { load } from 'cheerio'
import { createBuilder } from '@content-collections/core'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const appOutput = path.join(root, '.next', 'server', 'app')
const publicDirectory = path.join(root, 'public')
const failures = []
let externalLinkCount = 0

process.env.NODE_ENV = 'production'

async function walk(directory, predicate = () => true) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(entryPath, predicate)))
    else if (entry.isFile() && predicate(entryPath)) files.push(entryPath)
  }

  return files
}

function routeFromHtml(file) {
  const relative = path.relative(appOutput, file).replaceAll(path.sep, '/')
  if (relative === 'index.html') return '/'
  const withoutExtension = relative.replace(/(?:\/index)?\.html$/, '')
  return `/${withoutExtension}/`
}

function normalizeRoute(pathname) {
  const decoded = decodeURIComponent(pathname)
  if (decoded === '/') return '/'
  return decoded.endsWith('/') ? decoded : `${decoded}/`
}

function publicPath(pathname) {
  return path.join(publicDirectory, pathname.replace(/^\//, ''))
}

function recordFailure(source, link, reason) {
  failures.push(`${source}: ${link} (${reason})`)
}

const builder = await createBuilder('content-collections.ts')
await builder.build()

const generatedUrl = pathToFileURL(
  path.join(root, '.content-collections', 'generated', 'index.js')
).href
const { allBlogs } = await import(`${generatedUrl}?integrity=${Date.now()}`)
const publishedPosts = allBlogs.filter((post) => post.draft !== true)
const draftPosts = allBlogs.filter((post) => post.draft === true)

const htmlFiles = await walk(appOutput, (file) => file.endsWith('.html'))
const routeFiles = new Map(htmlFiles.map((file) => [routeFromHtml(file), file]))
const parsedPages = new Map()

for (const [route, file] of routeFiles) {
  parsedPages.set(route, load(await readFile(file, 'utf8')))
}

for (const [sourceRoute, $] of parsedPages) {
  const sourceFile = path.relative(root, routeFiles.get(sourceRoute)).replaceAll(path.sep, '/')

  for (const element of $('a[href]').toArray()) {
    const href = $(element).attr('href')
    if (!href) continue

    if (/^(?:https?:|mailto:|tel:)/.test(href)) {
      externalLinkCount += 1
      continue
    }

    const url = new URL(href, `https://singularity.local${sourceRoute}`)
    const targetRoute = normalizeRoute(url.pathname)
    const targetPage = parsedPages.get(targetRoute)
    const asset = publicPath(url.pathname)
    const assetExists = await stat(asset)
      .then((entry) => entry.isFile())
      .catch(() => false)

    if (!targetPage && !assetExists) {
      recordFailure(sourceFile, href, `route ${targetRoute} does not exist`)
      continue
    }

    if (url.hash && targetPage) {
      const id = decodeURIComponent(url.hash.slice(1))
      const targetExists = targetPage('[id]')
        .toArray()
        .some((element) => targetPage(element).attr('id') === id)
      if (!targetExists) {
        recordFailure(sourceFile, href, `heading #${id} does not exist on ${targetRoute}`)
      }
    }
  }
}

const searchDocuments = JSON.parse(
  await readFile(path.join(publicDirectory, 'search.json'), 'utf8')
)
const sitemapPath = path.join(appOutput, 'sitemap.xml.body')
const sitemap = load(await readFile(sitemapPath, 'utf8'), { xmlMode: true })
const feed = load(await readFile(path.join(publicDirectory, 'feed.xml'), 'utf8'), { xmlMode: true })
const sitemapRoutes = sitemap('loc')
  .toArray()
  .map((element) => normalizeRoute(new URL(sitemap(element).text()).pathname))
const feedRoutes = feed('item > link')
  .toArray()
  .map((element) => normalizeRoute(new URL(feed(element).text()).pathname))

for (const post of [...publishedPosts, ...draftPosts]) {
  const route = normalizeRoute(`/${post.path}`)
  const expectedCount = post.draft ? 0 : 1
  const counts = {
    search: searchDocuments.filter(({ href }) => normalizeRoute(href) === route).length,
    sitemap: sitemapRoutes.filter((entry) => entry === route).length,
    feed: feedRoutes.filter((entry) => entry === route).length,
  }

  for (const [artifact, count] of Object.entries(counts)) {
    if (count !== expectedCount) {
      recordFailure(
        `data/${post.filePath}`,
        route,
        `${artifact} contains ${count}, expected ${expectedCount}`
      )
    }
  }
}

const projectRoutes = [...routeFiles.keys()].filter((route) => /^\/projects\/[^/]+\/$/.test(route))

for (const route of projectRoutes) {
  const counts = {
    search: searchDocuments.filter(({ href }) => normalizeRoute(href) === route).length,
    sitemap: sitemapRoutes.filter((entry) => entry === route).length,
  }

  for (const [artifact, count] of Object.entries(counts)) {
    if (count !== 1) {
      recordFailure('data/projects.ts', route, `${artifact} contains ${count}, expected 1`)
    }
  }
}

if (failures.length > 0) {
  console.error(`Content integrity failed with ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Content integrity verified across ${routeFiles.size} routes, ${publishedPosts.length} published post(s), and ${projectRoutes.length} project(s); ${externalLinkCount} external links were not fetched.`
  )
}
