import type { Experience } from './types'

const experience = [
  {
    organization: 'MPBSDP',
    title: 'Technical Analyst',
    period: { start: '2026-04', end: '2026-10' },
    achievements: [
      'Led an Angular 4 to Angular 20 migration through a multi-agent workflow with continuous Karma and Jasmine validation.',
      'Built agent and skill systems that automate planning, implementation, review support, and test generation across Azure DevOps and Figma workflows.',
      'Developed multi-agent pipelines for maintaining LLM knowledge bases with hybrid retrieval and deep context retention.',
    ],
  },
  {
    organization: 'Ontario Financing Authority',
    title: 'Data Analyst',
    period: { start: '2025-01', end: '2025-08' },
    achievements: [
      'Analyzed more than $1 billion in Interest on Debt expenditures using Python, pyODBC, SQL, and Git.',
      'Automated parsing and ranking for more than 1,000 resumes using Python, regular expressions, and natural language processing.',
    ],
  },
  {
    organization: 'Trench Group, Siemens Energy',
    title: 'Finance Intern',
    period: { start: '2024-05', end: '2024-08' },
    achievements: [
      'Automated expense reporting and approvals with Power Apps and Power Automate, supported by Power BI analysis.',
      'Identified more than $3 million in discrepancies by comparing production backlogs with purchase orders using OCR, regular expressions, and Python.',
    ],
  },
] satisfies Experience[]

export default experience
