import type { UsesEntry } from './types'

const uses: readonly UsesEntry[] = [
  {
    category: 'Editors',
    name: 'Visual Studio Code',
    description: 'General-purpose code editing and project work.',
    href: 'https://code.visualstudio.com/',
  },
  {
    category: 'Editors',
    name: 'Xcode',
    description: 'Apple platform development and device tooling.',
    href: 'https://developer.apple.com/xcode/',
  },
  {
    category: 'Editors',
    name: 'Zed',
    description: 'A fast editor for focused coding sessions.',
    href: 'https://zed.dev/',
  },
  {
    category: 'Editors',
    name: 'Vim',
    description: 'Terminal-based editing and quick remote changes.',
    href: 'https://www.vim.org/',
  },
  {
    category: 'Terminal and Workflow',
    name: 'PowerShell',
    description: 'Shell scripting and Windows automation.',
    href: 'https://learn.microsoft.com/powershell/',
  },
  {
    category: 'Terminal and Workflow',
    name: 'Bash',
    description: 'Command-line work across Unix-like environments.',
    href: 'https://www.gnu.org/software/bash/',
  },
  {
    category: 'Terminal and Workflow',
    name: 'Git',
    description: 'Version control for source code and technical writing.',
    href: 'https://git-scm.com/',
  },
  {
    category: 'Terminal and Workflow',
    name: 'Yarn',
    description: 'JavaScript dependency management and project scripts.',
    href: 'https://yarnpkg.com/',
  },
]

export default uses
