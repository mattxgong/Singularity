import type { Project } from './types'
import { validateProjects } from './types'

const projects: Project[] = [
  {
    slug: 'hypatia',
    title: 'Hypatia',
    tagline:
      'A cross-platform application that lets users create independent, self-contained study wikis',
    role: 'Developer',
    period: { start: '2026-08' },
    status: 'active',
    stack: ['Flutter', 'Python', 'LLM SDKs', 'FastAPI', 'SQLite'],
    outcome:
      'Users can upload videos and notes, then search and chat with the knowledge base that Hypatia maintains.',
    featured: true,
    order: 1,
    links: [],
    caseStudy: 'hypatia',
  },
  {
    slug: 'solomon-chess-engine',
    title: 'Solomon: Chess Engine',
    tagline: 'A high-performance C++ chess engine with NNUE position evaluation.',
    role: 'Developer',
    period: { start: '2025-01' },
    status: 'active',
    stack: ['C++', 'Bitboards', 'Alpha-Beta Search', 'NNUE'],
    outcome:
      'Implemented incremental neural evaluation and optimized search while maintaining real-time play.',
    featured: false,
    order: 4,
    links: [],
  },
  {
    slug: 'robotics-challenge',
    title: 'Robotics Challenge',
    tagline: 'Computer vision and autonomous navigation for a humanoid robot.',
    role: 'Computer Vision and Autonomous Navigation Developer',
    period: { start: '2025-07', end: '2025-08' },
    status: 'competition',
    stack: ['Python', 'ROS', 'YOLO', 'Computer Vision'],
    outcome: 'Won third place among hundreds of university teams across China.',
    featured: true,
    order: 2,
    links: [],
    caseStudy: 'robotics-challenge',
  },
  {
    slug: 'ros-mobile-controller',
    title: 'ROS Mobile Controller',
    tagline: 'Remote iOS control and real-time SLAM mapping for a ROS robot.',
    role: 'iOS, Controls, and Mapping Developer',
    period: { start: '2023-09', end: '2024-04' },
    status: 'archived',
    stack: ['C++', 'ROS', 'Swift', 'iOS', 'SLAM'],
    outcome: 'Delivered stable remote control and real-time spatial mapping on iOS.',
    featured: false,
    order: 3,
    links: [],
  },
  {
    slug: 'cornucopia',
    title: 'Cornucopia',
    tagline: 'An iOS app to find recipes depending on the ingredients in your fridge.',
    role: 'Main Developer',
    period: { start: '2022-06', end: '2022-07' },
    status: 'archived',
    stack: ['WebSocket', 'Javascript', 'Swift', 'iOS'],
    outcome:
      'From a list of ingredients, finds dozen of possible recipes along with their nutritional data.',
    featured: false,
    order: 5,
    links: [],
  },
]

validateProjects(projects)

export default projects
