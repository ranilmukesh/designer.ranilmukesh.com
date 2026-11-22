// @env browser
import { gsap } from 'gsap'

export interface ProjectScroll {
  targetY: (target: HTMLElement) => number | undefined
  focusedY: (target: HTMLElement) => number | undefined
  readingTarget: () => HTMLElement | undefined
  sync: () => void
  destroy: () => void
}

/** Vertical scroll spent per pixel of sideways travel: below 1 keeps the pinned showcase short. */
const SCROLL_RATIO = 0.6

/** Minimal surface of the smooth-scroll engine (Lenis) used for settling. */
interface SmoothScroller {
  on: (event: 'scroll', handler: () => void) => unknown
  off: (event: 'scroll', handler: () => void) => unknown
  scrollTo: (target: number, options?: { duration?: number }) => void
}

export function initProjectScroll(main: HTMLElement, headerHeight: () => number, smooth?: SmoothScroller): ProjectScroll | undefined {
  const exhibition = main.querySelector<HTMLElement>('[data-project-exhibition]')
  const pin = exhibition?.querySelector<HTMLElement>('[data-project-pin]')
  const track = exhibition?.querySelector<HTMLElement>('[data-project-track]')
  const panels = [
    ...(track?.querySelectorAll<HTMLElement>('[data-project]') ?? []),
  ]
  if (!exhibition || !pin || !track || panels.length < 2)
    return

  const counter = exhibition.querySelector<HTMLElement>('[data-project-current]')
  const links = [
    ...(exhibition.closest('section')?.querySelectorAll<HTMLAnchorElement>('a[href^="#project-"]') ?? []),
  ]
  const originalTransform = track.style.transform
  let travel = 0
  let activeIndex = -1

  const measure = () => {
    travel = Math.max(0, track.scrollWidth - pin.clientWidth)
    const value = `${Math.round(travel * SCROLL_RATIO)}px`
    if (exhibition.style.getPropertyValue('--project-travel') !== value)
      exhibition.style.setProperty('--project-travel', value)
  }
  const offset = (panel: HTMLElement) => gsap.utils.clamp(0, travel, panel.offsetLeft - panels[0]!.offsetLeft)
  const update = (progress: number) => {
    exhibition.style.setProperty('--project-progress', progress.toFixed(4))
    const distance = progress * travel
    let next = 0
    for (const [index, panel] of panels.entries()) {
      if (distance >= offset(panel) - panel.offsetWidth / 2)
        next = index
    }
    if (next === activeIndex)
      return
    activeIndex = next
    const current = panels[next]!
    exhibition.dataset.activeProject = current.id
    if (counter)
      counter.textContent = String(next + 1).padStart(2, '0')
    for (const link of links) {
      if (link.hash === `#${current.id}`)
        link.setAttribute('aria-current', 'true')
      else
        link.removeAttribute('aria-current')
    }
  }
  const reset = () => {
    delete exhibition.dataset.projectScroll
    delete exhibition.dataset.activeProject
    exhibition.style.removeProperty('--project-travel')
    exhibition.style.removeProperty('--project-progress')
    for (const link of links)
      link.removeAttribute('aria-current')
    if (counter)
      counter.textContent = '01'
  }

  // The opt-in attribute establishes the flex geometry before it is measured.
  exhibition.dataset.projectScroll = 'true'
  measure()
  if (travel < 1) {
    reset()
    return
  }

  /** Progress values at which a whole project fills the showcase. */
  const stops = () => travel < 1
    ? [0]
    : panels.map(panel => offset(panel) / travel)

  /**
   * Where to rest after the reader pauses. A deliberate nudge (more than a small share of one
   * project) moves on in the direction of travel; a tiny one settles back. Never rests between two.
   */
  function restingStop(value: number, from: number): number {
    const points = stops()
    const segment = points.length > 1
      ? Math.abs(points[1]! - points[0]!)
      : 1
    const moved = value - from
    if (Math.abs(moved) < segment * 0.12)
      return from
    return moved > 0
      ? points.find(point => point >= value - 0.001) ?? points.at(-1)!
      : [...points].reverse().find(point => point <= value + 0.001) ?? points[0]!
  }

  const tween = gsap.to(track, {
    x: () => -travel,
    ease: 'none',
    scrollTrigger: {
      trigger: exhibition,
      start: () => `top top+=${headerHeight()}`,
      end: () => `+=${Math.max(1, travel * SCROLL_RATIO)}`,
      scrub: 0.65,
      // Native scrolling: GSAP settles on a whole project. With smooth scrolling the settle
      // below takes over, because GSAP's snap and Lenis would fight over the scroll position.
      snap: smooth
        ? undefined
        : {
            snapTo: 1 / Math.max(1, panels.length - 1),
            directional: true,
            duration: { min: 0.18, max: 0.45 },
            delay: 0.06,
            ease: 'power2.out',
            inertia: false,
          },
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: self => update(self.progress),
      onRefresh: self => update(self.progress),
    },
  })
  const trigger = tween.scrollTrigger

  // Smooth scrolling: once the reader pauses inside the showcase, glide to a whole project.
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let rest = 0
  const settle = () => {
    if (!smooth || !trigger)
      return
    if (!trigger.isActive) {
      rest = trigger.progress >= 1
        ? 1
        : 0
      return
    }
    const target = restingStop(trigger.progress, rest)
    rest = target
    const goal = trigger.start + target * (trigger.end - trigger.start)
    if (Math.abs(goal - window.scrollY) > 2)
      smooth.scrollTo(goal, { duration: 0.5 })
  }
  const onSmoothScroll = () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(settle, 160)
  }
  smooth?.on('scroll', onSmoothScroll)

  const targetY = (target: HTMLElement) => {
    const panel = target.closest<HTMLElement>('[data-project]')
    if (!panel || !panels.includes(panel))
      return
    const top = exhibition.getBoundingClientRect().top + window.scrollY - headerHeight()
    return Math.max(0, top + offset(panel) * SCROLL_RATIO)
  }

  update(trigger?.progress ?? 0)

  return {
    targetY,
    focusedY: (target) => {
      const destination = targetY(target)
      if (destination === undefined)
        return
      const bounds = target.getBoundingClientRect()
      const viewport = pin.getBoundingClientRect()
      if (bounds.left < viewport.left || bounds.right > viewport.right
        || bounds.top < headerHeight() || bounds.bottom > window.innerHeight) {
        return destination
      }
    },
    readingTarget: () => panels[Math.max(0, activeIndex)],
    sync: () => {
      trigger?.getTween()?.progress(1)
    },
    destroy: () => {
      clearTimeout(settleTimer)
      smooth?.off('scroll', onSmoothScroll)
      trigger?.getTween()?.kill()
      trigger?.kill()
      tween.revert()
      gsap.set(track, { clearProps: 'transform' })
      if (originalTransform)
        track.style.transform = originalTransform
      reset()
    },
  }
}
