import { type Authors, allAuthors } from 'content-collections'
import { MDXContent } from '@content-collections/mdx/react'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from '@/lib/content'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const author = allAuthors.find((p) => p.slug === 'default') as Authors
  const mainContent = coreContent(author)

  return (
    <>
      <AuthorLayout content={mainContent}>
        <MDXContent code={author.mdx} />
      </AuthorLayout>
    </>
  )
}
