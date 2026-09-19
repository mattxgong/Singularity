import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { StarfieldMount } from '@/components/decorative/star-field-mount'
import { SkipLink } from '@/components/layout/skip-link'
import SearchProvider from '@/components/SearchProvider'
import { Container } from '@/components/ui/container'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <StarfieldMount />
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
