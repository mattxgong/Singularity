import type { SkillGroup } from './types'

const skillGroups = [
  {
    label: 'Programming languages',
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
      'R',
    ].map((name) => ({ name, primary: ['Python', 'C++', 'TypeScript', 'SQL'].includes(name) })),
  },
  {
    label: 'Libraries and frameworks',
    skills: [
      'PyTorch',
      'Google Agent Development Kit',
      'multi-agent systems',
      'Hugging Face',
      'TensorFlow',
      'Node.js',
      'Puppeteer',
      'React',
      'pandas',
    ].map((name) => ({
      name,
      primary: ['PyTorch', 'Google Agent Development Kit', 'multi-agent systems', 'React'].includes(
        name
      ),
    })),
  },
  {
    label: 'Tools and platforms',
    skills: [
      'Git',
      'Linux',
      'ROS',
      'Google AI Studio',
      'iOS',
      'Power BI',
      'Power Apps',
      'Power Automate',
      'AWS',
      'Docker',
      'SAP',
      'Anaconda',
      'Jupyter',
      '.NET',
      'Xcode',
      'Unity',
    ].map((name) => ({ name, primary: ['Git', 'Linux', 'ROS', 'Docker'].includes(name) })),
  },
] satisfies SkillGroup[]

export default skillGroups
