# Working on this site

Single-page Astro portfolio for design.ranilmukesh.com, derived from an MIT-licensed constructivist theme (see README).

- Content lives in `cv.json`; runtime validation in `src/data/schema.ts`. After changing the schema run `pnpm schema` so `cv.schema.json` stays aligned.
- Only publish real content and real links (ranilmukesh.com, phobosq.com, k22.ai, the owner's public profiles). No placeholder links or invented metrics.
- Papers and articles are not hosted here; they link to ranilmukesh.com. Expertise detail lives on ranilmukesh.com/expertise.
- Project covers are drawn inline by `src/utils/cover.ts` from palette tokens, so they follow every theme and dark mode. Never commit coloured cover images. `pnpm art` only regenerates the favicon, touch icons and social card.
- Checks: `pnpm lint`, `pnpm test`, `pnpm knip`, `pnpm build`.
- Do not deploy, push or change repository settings without the owner's approval.

## Layout rules (every change must hold on every device)

Device matrix, in CSS pixels: phone 375×812, large phone 430×932, tablet 768×1024, iPad Pro 1024×1366,
Windows 13" 1366×657 and 1366×768, Windows 16" 1536×864, MacBook 14" 1512×982, MacBook 16" 1728×1117,
27" 2560×1440, 40" 3840×2160. `tests/e2e/device-matrix.spec.ts` checks it (`pnpm test:e2e device-matrix`).

1. No sideways scrolling at any size.
2. Whole page within 24 screens on every device; aim for one to two screens per section on laptops.
3. Pinned showcase: four projects at most (`featured: true` in `cv.json`), snapping to whole panels. Everything else goes in the compact work grid.
4. Research shows three papers and Writing three articles; the rest sit behind the "All …" links to ranilmukesh.com.
5. Fixed chrome (scene HUD, spec tab) must never cover the footer; it hides while the footer is on screen.
6. Size type and spacing with height as well as width (`min(vw, svh)`), so short laptop screens are not cramped.
7. Colours only from palette tokens (`--bg`, `--fg`, `--accent`, …). No hex values in components or images.
