'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { siteMetadata } from '@/data/index'
import { Button } from '@/components/ui/button'

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
  ) {
    return null
  }

  if (!loadComments) {
    return (
      <Button variant="secondary" onClick={() => setLoadComments(true)}>
        Load comments
      </Button>
    )
  }

  return (
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
      theme={
        resolvedTheme === 'dark'
          ? (config.darkTheme ?? 'dark_dimmed')
          : (config.theme ?? 'noborder_light')
      }
      lang={config.lang ?? 'en'}
      loading="lazy"
    />
  )
}
