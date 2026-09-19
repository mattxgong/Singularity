import { MDXContent } from '@content-collections/mdx/react'
import { allProjectCaseStudies } from 'content-collections'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { components } from '@/components/MDXComponents'
import Link from '@/components/Link'
import { ProjectMeta } from '@/components/portfolio/project-meta'
import { Prose } from '@/components/ui/prose'
import { projects, siteMetadata } from '@/data/index'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((entry) => entry.slug === slug)

  if (!project) return {}

  return {
    title: project.title,
    description: `${project.tagline} ${project.outcome}`,
    openGraph: {
      title: project.title,
      description: project.tagline,
      type: 'article',
      url: `${siteMetadata.siteUrl}/projects/${project.slug}`,
      images: [project.cover?.src ?? siteMetadata.socialBanner],
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = projects.find((entry) => entry.slug === slug)

  if (!project) notFound()

  const caseStudy = project.caseStudy
    ? allProjectCaseStudies.find((document) => document.slug === project.caseStudy)
    : undefined

  return (
    <article className="py-rhythm-7 sm:py-rhythm-8">
      <Link href="/projects" className="text-small text-accent font-sans font-semibold">
        Back to projects
      </Link>
      <header className="mt-rhythm-5 gap-rhythm-7 grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div className="space-y-rhythm-4 min-w-0">
          <p className="text-small text-accent font-sans font-semibold uppercase">
            {project.status}
          </p>
          <h1 className="text-heading-1 font-sans font-bold">{project.title}</h1>
          <p className="text-lead text-ink-muted font-serif">{project.tagline}</p>
          <p className="border-accent bg-surface-raised border-l-2 px-5 py-4 font-sans font-semibold">
            {project.outcome}
          </p>
        </div>
        <ProjectMeta project={project} />
      </header>

      {project.links.length > 0 && (
        <ul className="mt-rhythm-6 gap-rhythm-4 flex flex-wrap font-sans font-semibold">
          {project.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-accent underline underline-offset-4">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {caseStudy && (
        <Prose className="mt-rhythm-8">
          <MDXContent code={caseStudy.mdx} components={components} toc={caseStudy.toc} />
        </Prose>
      )}
    </article>
  )
}
