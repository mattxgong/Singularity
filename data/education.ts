import type { Award, Education } from './types'

export const education = [
  {
    institution: 'University of Waterloo',
    degree: 'Bachelor of Computing and Financial Management',
    period: { start: '2023-09', end: '2027-04' },
  },
] satisfies Education[]

export const awards = [
  { title: 'American Invitational Mathematics Examination', year: 2022 },
  { title: 'Canadian Computing Competition, top 7 percent', year: 2021 },
  { title: 'USA Computing Olympiad Bronze, perfect score of 1000', year: 2020 },
  {
    title: "University of Waterloo President's Scholarship of Distinction and CFM Entrance Award",
    year: 2023,
  },
] satisfies Award[]
