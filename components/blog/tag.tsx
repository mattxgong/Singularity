import Link from 'next/link'
import { slug } from 'github-slugger'

export default function Tag({ text }: { text: string }) {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="text-accent hover:text-accent-hover text-caption mr-3 font-sans font-semibold uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}
