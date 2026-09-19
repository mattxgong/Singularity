import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' })

export default function Page() {
  const tagCounts = tagData as Record<string, number>
  const sortedTags = Object.keys(tagCounts).sort(
    (first, second) => tagCounts[second] - tagCounts[first] || first.localeCompare(second)
  )

  return (
    <section className="py-rhythm-7 sm:py-rhythm-8">
      <h1 className="text-display text-ink font-sans font-bold">Tags</h1>
      <p className="text-lead text-ink-muted mt-rhythm-4 max-w-[62ch] font-serif">
        Every topic covered in the writing, ordered by how often it appears.
      </p>

      {sortedTags.length === 0 ? (
        <p className="text-ink-muted mt-rhythm-7">No tags found.</p>
      ) : (
        <ul className="mt-rhythm-7 gap-rhythm-3 flex flex-wrap">
          {sortedTags.map((tag) => (
            <li key={tag}>
              <Link
                href={`/tags/${slug(tag)}`}
                className="border-boundary text-ink duration-fast hover:border-accent hover:text-accent focus-visible:outline-focus gap-rhythm-2 text-small inline-flex min-h-6 items-center rounded-sm border px-3 py-2 font-sans font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {tag}
                <span className="text-ink-muted tabular-nums">{tagCounts[tag]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
