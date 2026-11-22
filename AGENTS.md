# Working on this site

Single-page Astro portfolio for design.ranilmukesh.com, derived from an MIT-licensed constructivist theme (see README).

- Content lives in `cv.json`; runtime validation in `src/data/schema.ts`. After changing the schema run `pnpm schema` so `cv.schema.json` stays aligned.
- Only publish real content and real links (ranilmukesh.com, phobosq.com, k22.ai, the owner's public profiles). No placeholder links or invented metrics.
- Papers and articles are not hosted here; they link to ranilmukesh.com.
- After changing projects, run `pnpm art` to regenerate covers and icons.
- Checks: `pnpm lint`, `pnpm test`, `pnpm knip`, `pnpm build`.
- Do not deploy, push or change repository settings without the owner's approval.
