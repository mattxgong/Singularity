import { ImageResponse } from 'next/og'
import { allBlogs } from 'content-collections'
import { projects } from '@/data/index'

// Prerendered so the card survives the degraded static-export profile.
export const dynamic = 'force-static'
export const dynamicParams = false

interface RouteContext {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return [
    ...allBlogs
      .filter((post) => !post.draft)
      .map((post) => ({ slug: ['blog', ...post.slug.split('/')] })),
    ...projects.map((project) => ({ slug: ['projects', project.slug] })),
  ]
}

function truncateTitle(title: string, limit = 72) {
  return title.length > limit ? `${title.slice(0, limit - 1).trimEnd()}…` : title
}

function getCard(slugParts: string[]) {
  const [kind, ...pathParts] = slugParts
  const slug = decodeURIComponent(pathParts.join('/'))

  if (kind === 'blog') {
    const post = allBlogs.find((entry) => entry.slug === slug && !entry.draft)
    return post ? { title: post.title, label: 'Field note' } : undefined
  }

  if (kind === 'projects') {
    const project = projects.find((entry) => entry.slug === slug)
    return project ? { title: project.title, label: 'Project' } : undefined
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params
  const card = getCard(slug)

  if (!card) return new Response('Not found', { status: 404 })

  return new ImageResponse(
    <div
      style={{
        background: '#faf8f3',
        color: '#141a26',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 80px',
        width: '100%',
      }}
    >
      <div style={{ color: '#10566b', display: 'flex', fontSize: 28, textTransform: 'uppercase' }}>
        {card.label}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.08,
          maxWidth: 1010,
        }}
      >
        {truncateTitle(card.title)}
      </div>
      <div
        style={{
          alignItems: 'center',
          borderTop: '2px solid #6b7385',
          display: 'flex',
          fontSize: 30,
          justifyContent: 'space-between',
          paddingTop: 28,
        }}
      >
        <span>Matthew Gong</span>
        <span style={{ color: '#10566b' }}>Singularity</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    }
  )
}
