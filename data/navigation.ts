export interface NavigationItem {
  href: string
  title: string
}

const navigation: NavigationItem[] = [
  { href: '/projects', title: 'Work' },
  { href: '/blog', title: 'Writing' },
  { href: '/about', title: 'About' },
  { href: '/resume', title: 'Resume' },
  { href: '/uses', title: 'Uses' },
]

export default navigation
