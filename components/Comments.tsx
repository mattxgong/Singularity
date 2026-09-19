'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { siteMetadata } from '@/data/index'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const { resolvedTheme } = useTheme()
  const config = siteMetadata.comments?.giscusConfig

  if (
    siteMetadata.comments?.provider !== 'giscus' ||
    !config?.repo ||
    !config.repositoryId ||
    !config.category ||
    !config.categoryId
  )
    return null

  return (
    <>
      {loadComments ? (
        <Giscus
          id={slug}
          repo={config.repo}
          repoId={config.repositoryId}
          category={config.category}
          categoryId={config.categoryId}
          mapping={config.mapping ?? 'pathname'}
          reactionsEnabled={config.reactions ?? '1'}
          emitMetadata={config.metadata ?? '0'}
          inputPosition="top"
          theme={resolvedTheme === 'dark' ? (config.darkTheme ?? 'transparent_dark') : config.theme}
          lang={config.lang ?? 'en'}
          loading="lazy"
        />
      ) : (
        <button type="button" onClick={() => setLoadComments(true)}>
          Load Comments
        </button>
      )}
    </>
  )
}
