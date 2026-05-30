---
name: TechZone static image assets
description: How images are served in artifacts/techzone and the dev-path trap to avoid
---

# Static image assets in artifacts/techzone

Catalog and brand images live in `artifacts/techzone/public/` and are served at
`/catalog/...` and `/brands/...` (filenames like `prebuilt-pc-1.jpg`, `corsair.png`).

**Trap:** never reference images with `src="/src/assets/..."`. That is a dev-only
Vite path that 404s in the production build (it is not an imported module asset and
not under `/public`). Use a `/public` path (`/catalog/...`, `/brands/...`) or a real
`import` of the asset.

**Why:** the original hero used `/src/assets/images/hero-*.png` and rendered broken
images in preview/prod. Switching to `/catalog/*.jpg` fixed it.

**How to apply:** when adding any `<img src=...>` in this artifact, point at a
`/public` file that exists, or import the asset; verify with
`curl -s -o /dev/null -w "%{http_code}" localhost:80/<path>`.
