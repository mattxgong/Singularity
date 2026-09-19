'use client'

import { Command } from 'cmdk'
import MiniSearch from 'minisearch'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { siteMetadata } from '@/data/index'

export interface SearchDocument {
  id: string
  title: string
  summary?: string
  description?: string
  tags?: string[]
  href: string
  kind: 'post' | 'project'
}

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_RESULTS = 8

export default function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [matchedIds, setMatchedIds] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)

  const documentsById = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents]
  )

  const search = useMemo(() => {
    if (!documents.length) return null

    const index = new MiniSearch<SearchDocument>({
      fields: ['title', 'summary', 'description', 'tags'],
      searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2 },
    })
    index.addAll(documents)
    return index
  }, [documents])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
    else setQuery('')
  }, [open])

  useEffect(() => {
    if (!open || documents.length) return

    const controller = new AbortController()
    setLoading(true)
    fetch(siteMetadata.search?.searchDocumentsPath ?? '/search.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`)
        return response.json() as Promise<SearchDocument[]>
      })
      .then(setDocuments)
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') console.error(error)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [documents.length, open])

  useEffect(() => {
    const trimmed = query.trim()
    if (!search || !trimmed) {
      setMatchedIds(null)
      return
    }

    setMatchedIds(
      search
        .search(trimmed)
        .slice(0, MAX_RESULTS)
        .map((match) => String(match.id))
    )
  }, [query, search])

  const results =
    matchedIds === null
      ? documents.slice(0, MAX_RESULTS)
      : matchedIds.flatMap((id) => {
          const document = documentsById.get(id)
          return document ? [document] : []
        })

  function selectResult(href: string) {
    onOpenChange(false)
    if (/^https?:\/\//.test(href)) window.location.assign(href)
    else router.push(href)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Search"
      shouldFilter={false}
      className="border-boundary bg-surface text-ink fixed inset-x-4 top-[15vh] z-50 mx-auto w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-md border shadow-2xl"
    >
      <Command.Input
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        placeholder="Search posts and projects"
        className="border-boundary bg-surface text-ink placeholder:text-ink-muted focus-visible:outline-focus w-full border-0 border-b px-4 py-3 font-sans focus-visible:outline-2 focus-visible:-outline-offset-2"
      />
      <Command.List className="max-h-96 overflow-y-auto p-2">
        {loading && <Command.Loading className="text-ink-muted p-4">Loading...</Command.Loading>}
        {!loading && query && !results.length && (
          <Command.Empty className="text-ink-muted p-4">No results found.</Command.Empty>
        )}
        {results.map((result) => (
          <Command.Item
            key={result.id}
            value={result.id}
            onSelect={() => selectResult(result.href)}
            className="data-[selected=true]:bg-surface-raised data-[selected=true]:text-accent cursor-pointer rounded-sm px-3 py-2 outline-none"
          >
            <span className="block font-medium">{result.title}</span>
            <span className="text-ink-muted text-caption block font-sans capitalize">
              {result.kind}
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}
