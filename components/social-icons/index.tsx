import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Mastodon,
  Threads,
  Instagram,
  Medium,
  Bluesky,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
}

type SocialIconProps = {
  kind: keyof typeof components
  href: string | undefined
  label?: string
  size?: number
}

const SocialIcon = ({ kind, href, label = kind, size = 8 }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null

  const SocialSvg = components[kind]

  return (
    <a
      className="focus-visible:outline-focus inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{label}</span>
      <SocialSvg
        aria-hidden="true"
        className="text-ink-muted hover:text-accent fill-current transition-colors"
        style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem` }}
      />
    </a>
  )
}

export default SocialIcon
