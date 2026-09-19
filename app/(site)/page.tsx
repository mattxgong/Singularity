import Link from '@/components/Link'
import { ContactBlock } from '@/components/portfolio/contact-block'
import { Hero } from '@/components/portfolio/hero'
import { ProjectGrid } from '@/components/portfolio/project-grid'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { profile, projects, siteMetadata } from '@/data/index'
import { formatDate } from '@/lib/format'
import { sortPosts, allCoreContent } from '@/lib/content'
import { allBlogs } from 'content-collections'

export default function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const recentPosts = allCoreContent(sortedPosts).slice(0, 3)
  const featuredProjects = projects
    .filter((project) => project.featured)
    .sort((first, second) => first.order - second.order)
    .slice(0, 3)

  return (
    <>
      <Hero profile={profile} />

      <Section heading="Featured work">
        <ProjectGrid projects={featuredProjects} />
        <div className="mt-rhythm-6">
          <Button href="/projects" variant="ghost">
            All projects
          </Button>
        </div>
      </Section>

      <Section heading="Recent writing">
        <ol className="border-boundary divide-boundary divide-y border-y">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <article className="py-rhythm-5 gap-rhythm-4 grid sm:grid-cols-[9rem_1fr] sm:items-baseline">
                <time
                  dateTime={post.date}
                  className="text-small text-ink-muted font-sans tabular-nums"
                >
                  {formatDate(post.date, siteMetadata.locale)}
                </time>
                <div>
                  <h3 className="text-heading-4 font-sans font-semibold">
                    <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-ink-muted mt-rhythm-2 font-serif">{post.summary}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <div className="mt-rhythm-6">
          <Button href="/blog" variant="ghost">
            All writing
          </Button>
        </div>
      </Section>

      <ContactBlock email={profile.email} />
    </>
  )
}
