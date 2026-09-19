import { Button } from '@/components/ui/button'
import type { profile as profileData } from '@/data/index'

interface HeroProps {
  profile: typeof profileData
}

export function Hero({ profile }: HeroProps) {
  return (
    <header className="py-rhythm-7 sm:py-rhythm-9 flex min-h-[min(34rem,72vh)] flex-col justify-center">
      <div className="max-w-4xl">
        <p className="text-small text-accent mb-rhythm-4 font-sans font-semibold uppercase">
          {profile.status}
        </p>
        <h1 className="text-display text-ink font-sans font-bold">{profile.name}</h1>
        <p className="text-lead text-ink-muted mt-rhythm-5 max-w-[62ch] font-serif">
          {profile.positioning}
        </p>
        <div className="mt-rhythm-6 gap-rhythm-3 flex flex-wrap">
          <Button href="/projects">View projects</Button>
          <Button href="/resume" variant="secondary">
            Resume
          </Button>
        </div>
      </div>
    </header>
  )
}
