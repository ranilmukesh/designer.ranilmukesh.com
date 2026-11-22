import { cv } from './cv'

interface IndexedProject {
  project: (typeof cv.projects)[number]
  index: number
}

/** Tiles shown in the homepage grid before the "All projects" bar. */
const HOME_GRID_LIMIT = 8

const indexed: IndexedProject[] = cv.projects.map((project, index) => ({ project, index }))
const flagged = indexed.filter(({ project }) => project.featured)

/** Pinned showcase: up to four projects flagged `featured` in cv.json. */
export const featuredProjects = (flagged.length > 0
  ? flagged
  : indexed).slice(0, 4)

const featuredIndexes = new Set(featuredProjects.map(({ index }) => index))
const others = indexed.filter(({ index }) => !featuredIndexes.has(index))

/** Compact grid under the showcase on the homepage. */
export const homeGridProjects = others.slice(0, HOME_GRID_LIMIT)

/** Projects only reachable through "All projects" (the /work page or the in-place list). */
export const overflowProjects = others.slice(HOME_GRID_LIMIT)

/** Every project, in cv.json order. */
export const allProjects = indexed
