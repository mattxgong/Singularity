import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge only dedupes utilities it can classify, so the observatory
// scales defined in css/tailwind.css have to be declared here.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'void',
        'plate',
        'starlight',
        'surface',
        'surface-raised',
        'ink',
        'ink-muted',
        'accent',
        'accent-hover',
        'focus',
        'boundary',
        'code-surface',
        'code-surface-raised',
        'code-ink',
        'code-muted',
      ],
      text: [
        'caption',
        'small',
        'body',
        'lead',
        'heading-1',
        'heading-2',
        'heading-3',
        'heading-4',
        'display',
      ],
      spacing: [
        'rhythm-1',
        'rhythm-2',
        'rhythm-3',
        'rhythm-4',
        'rhythm-5',
        'rhythm-6',
        'rhythm-7',
        'rhythm-8',
        'rhythm-9',
      ],
      ease: ['standard', 'enter', 'exit'],
    },
    classGroups: {
      duration: [{ duration: ['instant', 'fast', 'normal', 'slow'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
