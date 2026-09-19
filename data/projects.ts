import type { Project } from './types'
import { validateProjects } from './types'

const projects: Project[] = [
  {
    slug: 'solomon-chess-engine',
    title: 'Solomon: Chess Engine',
    tagline: 'A high-performance C++ chess engine with NNUE position evaluation.',
    role: 'Chess engine developer',
    period: { start: '2025-01' },
    status: 'active',
    stack: ['C++', 'Bitboards', 'Alpha-Beta Search', 'NNUE'],
    outcome:
      'Implemented incremental neural evaluation and optimized search while maintaining real-time play.',
    featured: false,
    order: 2,
    links: [],
  },
  {
    slug: 'robotics-challenge',
    title: 'Robotics Challenge',
    tagline: 'Computer vision and autonomous navigation for a humanoid robot.',
    role: 'Computer vision and autonomous navigation developer',
    period: { start: '2025-07', end: '2025-08' },
    status: 'competition',
    stack: ['Python', 'ROS', 'YOLO', 'Computer Vision'],
    outcome: 'Won third place among hundreds of university teams across China.',
    featured: true,
    order: 1,
    links: [],
    caseStudy: 'robotics-challenge',
  },
  {
    slug: 'ros-mobile-controller',
    title: 'ROS Mobile Controller',
    tagline: 'Remote iOS control and real-time SLAM mapping for a ROS robot.',
    role: 'iOS, controls, and mapping developer',
    period: { start: '2023-09', end: '2024-04' },
    status: 'archived',
    stack: ['C++', 'ROS', 'Swift', 'iOS', 'SLAM'],
    outcome: 'Delivered stable remote control and real-time spatial mapping on iOS.',
    featured: false,
    order: 3,
    links: [],
  },
]

validateProjects(projects)

export default projects
