import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="py-rhythm-9 mx-auto max-w-2xl">
      <p className="text-ink-muted text-caption font-mono font-semibold uppercase">
        404 / Off chart
      </p>
      <h1 className="text-display text-ink mt-rhythm-3 font-title">This coordinate is empty.</h1>
      <p className="text-ink-muted text-lead mt-rhythm-4 max-w-[62ch] font-serif">
        The page may have moved, or the address may be incorrect. Choose a known destination to
        continue.
      </p>
      <nav aria-label="Page recovery" className="mt-rhythm-7 flex flex-wrap gap-3">
        <Button href="/">Home</Button>
        <Button href="/projects" variant="secondary">
          Work
        </Button>
        <Button href="/blog" variant="secondary">
          Writing
        </Button>
        <Button href="/resume" variant="secondary">
          Resume
        </Button>
      </nav>
    </section>
  )
}
