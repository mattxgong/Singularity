import type { SkillGroup } from './types'

const skillGroups = [
  {
    label: 'Programming Languages',
    skills: [
      'Python',
      'C++',
      'SQL',
      'JavaScript',
      'TypeScript',
      'Java',
      'Swift',
      'CSS',
      'HTML',
      'C',
      'C#',
      'Dart',
    ].map((name) => ({ name, primary: ['Python', 'C++', 'TypeScript', 'SQL'].includes(name) })),
  },
  {
    label: 'Libraries and Frameworks',
    skills: [
      'Copilot SDK',
      'PyTorch',
      'Google Agent Development Kit',
      'Multi-Agent Systems',
      'Hugging Face',
      'TensorFlow',
      'Node.js',
      'Puppeteer',
      'React',
      'Next.js',
      'numpy',
      'pandas',
    ].map((name) => ({
      name,
      primary: ['Copilot SDK', 'PyTorch', 'Google Agent Development Kit', 'React'].includes(name),
    })),
  },
  {
    label: 'Tools and Platforms',
    skills: [
      'GitHub Copilot',
      'Claude Code',
      'Ollama',
      'Azure DevOps',
      'AWS',
      'Llama.cpp',
      'Git',
      'Linux',
      'ROS',
      'Google AI Studio',
      'iOS',
      'Power BI',
      'Power Apps',
      'Power Automate',
      'Docker',
      'SAP',
      'Anaconda',
      'Jupyter',
      '.NET',
      'Xcode',
      'Unity',
    ].map((name) => ({
      name,
      primary: ['GitHub Copilot', 'Claude Code', 'AWS', 'ROS'].includes(name),
    })),
  },
] satisfies SkillGroup[]

export default skillGroups
