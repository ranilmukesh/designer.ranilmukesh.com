// @env browser
let initialized = false

interface SectionDetail {
  index: string
  label: string
  progress: number
}

export function initSceneHud(): void {
  const hud = document.querySelector<HTMLElement>('.scene-hud')
  const index = hud?.querySelector<HTMLElement>('[data-scene-index]')
  const label = hud?.querySelector<HTMLElement>('[data-scene-label]')
  const fill = hud?.querySelector<HTMLElement>('[data-scene-fill]')
  const count = hud?.querySelector<HTMLElement>('[data-scene-count]')
  if (!hud || !index || !label || !fill || !count || initialized)
    return
  initialized = true

  // The fixed bottom bars would sit on top of the footer's last line, so they step aside there.
  const footer = document.querySelector<HTMLElement>('footer.footer')
  if (footer && 'IntersectionObserver' in window) {
    const root = document.documentElement
    new IntersectionObserver((entries) => {
      for (const entry of entries)
        root.classList.toggle('footer-in-view', entry.isIntersecting)
    }, { rootMargin: '0px 0px -2px 0px' }).observe(footer)
  }

  document.addEventListener('portfolio:section', (event) => {
    const detail = (event as CustomEvent<SectionDetail>).detail
    // Fires every scroll frame: touch the text only when the section actually changes.
    if (index.textContent !== detail.index) {
      index.textContent = detail.index
      count.textContent = `${detail.index} / ${hud.dataset.sectionTotal ?? '00'}`
    }
    if (label.textContent !== detail.label)
      label.textContent = detail.label
    fill.style.transform = `scaleX(${detail.progress.toFixed(4)})`
  })
}
