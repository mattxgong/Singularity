import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { StarfieldStatic } from '@/components/decorative/starfield-static'
import { SkipLink } from '@/components/layout/skip-link'
import SearchProvider from '@/components/SearchProvider'
import { Container } from '@/components/ui/container'
import { siteMetadata } from '@/data/index'
import { createWebsiteJsonLd } from '@/lib/seo'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = createWebsiteJsonLd(
    siteMetadata.siteUrl,
    siteMetadata.title,
    siteMetadata.description
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SkipLink />
      <StarfieldStatic />
      <div className="relative z-10">
        <Container>
          <SearchProvider>
            <Header />
            <main id="main-content" tabIndex={-1} className="mb-auto">
              {children}
            </main>
          </SearchProvider>
          <Footer />
        </Container>
      </div>
    </>
  )
}
