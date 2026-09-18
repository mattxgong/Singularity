import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { StarfieldStatic } from '@/components/decorative/starfield-static'
import { SkipLink } from '@/components/layout/skip-link'
import SearchProvider from '@/components/SearchProvider'
import SectionContainer from '@/components/SectionContainer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <StarfieldStatic />
      <div className="relative z-10">
        <SectionContainer>
          <SearchProvider>
            <Header />
            <main id="main-content" tabIndex={-1} className="mb-auto">
              {children}
            </main>
          </SearchProvider>
          <Footer />
        </SectionContainer>
      </div>
    </>
  )
}
