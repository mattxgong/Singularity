import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from '@/components/Link'
import { cn } from '@/lib/cn'

const variants = {
  primary: 'border-accent bg-accent text-surface hover:border-accent-hover hover:bg-accent-hover',
  secondary: 'border-boundary bg-surface-raised text-ink hover:bg-surface',
  ghost: 'border-transparent bg-transparent text-accent hover:border-boundary',
} as const

interface ButtonBaseProps {
  children: ReactNode
  className?: string
  variant?: keyof typeof variants
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & { href?: never }

type ButtonAsLink = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps | 'href'> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button(props: ButtonProps) {
  const classes = cn(
    'inline-flex min-h-6 min-w-6 items-center justify-center rounded-sm border px-3 py-2 font-sans text-small font-semibold transition-colors duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    variants[props.variant ?? 'primary'],
    props.className
  )

  if ('href' in props && props.href) {
    const { children, className: _className, variant: _variant, href, ...anchorProps } = props
    return (
      <Link {...anchorProps} href={href} className={classes}>
        {children}
      </Link>
    )
  }

  const {
    children,
    className: _className,
    variant: _variant,
    type = 'button',
    ...buttonProps
  } = props as ButtonAsButton
  return (
    <button {...buttonProps} type={type} className={classes}>
      {children}
    </button>
  )
}
