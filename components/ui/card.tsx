import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

function CardRoot({ className, ...props }: ComponentPropsWithoutRef<'article'>) {
  return (
    <article
      className={cn('border-boundary bg-surface-raised rounded-md border', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentPropsWithoutRef<'header'>) {
  return <header className={cn('px-rhythm-5 pt-rhythm-5', className)} {...props} />
}

function CardBody({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('p-rhythm-5', className)} {...props} />
}

function CardFooter({ className, ...props }: ComponentPropsWithoutRef<'footer'>) {
  return <footer className={cn('px-rhythm-5 pb-rhythm-5', className)} {...props} />
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
})
