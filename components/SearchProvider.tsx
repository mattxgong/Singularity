'use client'

import { Command } from 'cmdk'
import MiniSearch from 'minisearch'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import siteMetadata from '@/data/siteMetadata'

interface SearchDocument {
  id: string
  title: string
  summary?: string
  description?: string
  tags?: string[]
  href: string
  kind: 'post' | 'project'
}

interface SearchContextValue {
  openSearch: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function useSearch() {
  const value = useContext(SearchContext)
  if (!value) throw new Error('useSearch must be used within SearchProvider')
  return value
}

export default function SearchProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const triggerRef = useRef<HTMLElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<MiniSearch<SearchDocument> | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [results, setResults] = useState<SearchDocument[]>([])
  const [loading, setLoading] = useState(false)

  function openSearch() {
    triggerRef.current = document.activeElement as HTMLElement
    setOpen(true)
  }

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => {
          if (!current) triggerRef.current = document.activeElement as HTMLElement
          else requestAnimationFrame(() => triggerRef.current?.focus())
          return !current
        })
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
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
    if (!open) {
      searchRef.current = null
      return
    }
    if (!documents.length || searchRef.current) return

    const search = new MiniSearch<SearchDocument>({
      fields: ['title', 'summary', 'description', 'tags'],
      storeFields: ['id', 'title', 'summary', 'description', 'tags', 'href', 'kind'],
      searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2 },
    })
    search.addAll(documents)
    searchRef.current = search
    setResults(documents.slice(0, 8))
  }, [documents, open])

  useEffect(() => {
    if (!open || !searchRef.current) return
    setResults(
      query.trim()
        ? (searchRef.current.search(query).slice(0, 8) as unknown as SearchDocument[])
        : documents.slice(0, 8)
    )
  }, [documents, open, query])

  function selectResult(href: string) {
    changeOpen(false)
    if (/^https?:\/\//.test(href)) window.location.assign(href)
    else router.push(href)
  }

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      <Command.Dialog
        open={open}
        onOpenChange={changeOpen}
        label="Search"
        shouldFilter={false}
        className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        <Command.Input
          ref={inputRef}
          value={query}
          onValueChange={setQuery}
          placeholder="Search posts and projects"
          className="w-full border-0 border-b border-gray-200 bg-transparent px-4 py-3 text-gray-900 outline-none dark:border-gray-700 dark:text-gray-100"
        />
        <Command.List className="max-h-96 overflow-y-auto p-2">
          {loading && <Command.Loading className="p-4 text-gray-500">Loading...</Command.Loading>}
          {!loading && query && !results.length && (
            <Command.Empty className="p-4 text-gray-500">No results found.</Command.Empty>
          )}
          {results.map((result) => (
            <Command.Item
              key={result.id}
              value={result.id}
              onSelect={() => selectResult(result.href)}
              className="data-[selected=true]:bg-primary-100 dark:data-[selected=true]:bg-primary-900 cursor-pointer rounded px-3 py-2"
            >
              <span className="block font-medium">{result.title}</span>
              <span className="block text-sm text-gray-500 capitalize">{result.kind}</span>
            </Command.Item>
          ))}
        </Command.List>
      </Command.Dialog>
    </SearchContext.Provider>
  )
}
