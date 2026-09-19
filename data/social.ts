import siteMetadata from './site'
import type { SocialLink } from './types'

const socialLinks: SocialLink[] = [
  { kind: 'mail', href: `mailto:${siteMetadata.email}`, label: 'Email Matthew Gong' },
  { kind: 'github', href: siteMetadata.github, label: 'Singularity on GitHub' },
  { kind: 'linkedin', href: siteMetadata.linkedin, label: 'Matthew Gong on LinkedIn' },
]

export default socialLinks
