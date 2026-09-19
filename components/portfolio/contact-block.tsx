import { Button } from '@/components/ui/button'

interface ContactBlockProps {
  email: string
}

export function ContactBlock({ email }: ContactBlockProps) {
  return (
    <section className="border-boundary py-rhythm-8 sm:py-rhythm-9 border-y">
      <div className="gap-rhythm-6 flex flex-col justify-between sm:flex-row sm:items-end">
        <div className="max-w-[60ch]">
          <h2 className="text-heading-2 text-ink font-sans font-bold">
            Let&rsquo;s build something
          </h2>
          <p className="text-lead text-ink-muted mt-rhythm-3 font-serif">
            I&rsquo;m open to conversations about software, applied machine learning, and ambitious
            technical work.
          </p>
        </div>
        <Button href={`mailto:${email}`} className="shrink-0">
          {email}
        </Button>
      </div>
    </section>
  )
}
