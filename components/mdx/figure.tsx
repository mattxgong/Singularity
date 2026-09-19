import Image from '@/components/Image'

interface FigureProps {
  src: string
  darkSrc?: string
  alt: string
  caption: string
  width: number
  height: number
}

export default function Figure({ src, darkSrc, alt, caption, width, height }: FigureProps) {
  return (
    <figure>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={darkSrc ? 'dark:hidden' : undefined}
      />
      {darkSrc && (
        <Image
          src={darkSrc}
          alt={alt}
          width={width}
          height={height}
          className="hidden dark:block"
        />
      )}
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
