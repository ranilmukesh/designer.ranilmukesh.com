import { expect, test } from '@playwright/test'
import { waitForScrollReady } from './scroll-helpers'

/**
 * The device matrix every layout change must pass (see AGENTS.md).
 * Viewport sizes are CSS pixels as browsers report them on each device class.
 */
export const DEVICE_MATRIX = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'large phone', width: 430, height: 932 },
  { name: 'tablet portrait', width: 768, height: 1024 },
  { name: 'iPad Pro portrait', width: 1024, height: 1366 },
  { name: 'Windows 13 in', width: 1366, height: 657 },
  { name: 'Windows 13 in (full screen)', width: 1366, height: 768 },
  { name: 'Windows 16 in', width: 1536, height: 864 },
  { name: 'MacBook 14 in', width: 1512, height: 982 },
  { name: 'MacBook 16 in', width: 1728, height: 1117 },
  { name: 'desktop 27 in', width: 2560, height: 1440 },
  { name: 'display 40 in', width: 3840, height: 2160 },
] as const

/** Page length budget, in screens, so the page never turns into a scroll marathon. */
const MAX_SCREENS = 24

test.describe('device matrix', () => {
  for (const device of DEVICE_MATRIX) {
    test(`${device.name} ${device.width}x${device.height}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'Runs once on desktop Chromium; each case sets its own viewport')
      await page.setViewportSize({ width: device.width, height: device.height })
      await page.goto('./')
      await waitForScrollReady(page)

      // No sideways scrolling anywhere.
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)

      // Showcase holds at most four projects; the rest live in the compact grid.
      expect(await page.locator('[data-project-track] [data-project]').count()).toBeLessThanOrEqual(4)

      // Page length stays within budget.
      const screens = await page.evaluate(() => document.documentElement.scrollHeight / innerHeight)
      expect(screens).toBeLessThanOrEqual(MAX_SCREENS)

      // Fixed bottom bars never cover the footer.
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await expect(page.locator('html')).toHaveClass(/footer-in-view/)
      for (const selector of ['.scene-hud', '.blueprint-tab'])
        await expect(page.locator(selector)).toBeHidden()
    })
  }
})
