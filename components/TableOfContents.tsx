import type { TocItem } from '@/lib/content/toc'

interface NestedTocItem extends TocItem {
  children?: NestedTocItem[]
}

interface TableOfContentsProps {
  toc: TocItem[]
  fromHeading?: number
  toHeading?: number
  asDisclosure?: boolean
  exclude?: string | string[]
  collapse?: boolean
  ulClassName?: string
  liClassName?: string
}

function nestItems(items: TocItem[]): NestedTocItem[] {
  const roots: NestedTocItem[] = []
  const stack: NestedTocItem[] = []

  for (const item of items) {
    const next = { ...item }
    while (stack.length && stack.at(-1)!.depth >= next.depth) stack.pop()

    const parent = stack.at(-1)
    if (parent) (parent.children ??= []).push(next)
    else roots.push(next)
    stack.push(next)
  }

  return roots
}

function TocList({
  items,
  ulClassName,
  liClassName,
}: {
  items: NestedTocItem[]
  ulClassName: string
  liClassName: string
}) {
  if (!items.length) return null

  return (
    <ul className={ulClassName}>
      {items.map((item) => (
        <li className={liClassName} key={item.url}>
          <a href={item.url}>{item.value}</a>
          {item.children && (
            <TocList items={item.children} ulClassName={ulClassName} liClassName={liClassName} />
          )}
        </li>
      ))}
    </ul>
  )
}

export default function TableOfContents({
  toc,
  fromHeading = 1,
  toHeading = 6,
  asDisclosure = false,
  exclude = [],
  collapse = false,
  ulClassName = '',
  liClassName = '',
}: TableOfContentsProps) {
  const excluded = new Set(
    (Array.isArray(exclude) ? exclude : [exclude]).map((item) => item.toLowerCase())
  )
  const items = nestItems(
    toc.filter(
      (item) =>
        item.depth >= fromHeading &&
        item.depth <= toHeading &&
        !excluded.has(item.value.toLowerCase())
    )
  )
  const list = <TocList items={items} ulClassName={ulClassName} liClassName={liClassName} />

  if (!asDisclosure) return list

  return (
    <details open={!collapse}>
      <summary className="ml-6 pt-2 pb-2 text-xl font-bold">Table of Contents</summary>
      <div className="ml-6">{list}</div>
    </details>
  )
}
