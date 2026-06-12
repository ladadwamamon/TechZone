---
name: object-storage-web source lib
description: How the object-storage-web lib is consumed and the storage route visibility model
---

# object-storage-web is consumed as source, not built

`lib/object-storage-web` exposes `"."` → `./src/index.ts` in its exports map and is NOT composite (no `composite`/`emitDeclarationOnly`). Leaf artifacts (e.g. techzone-admin) import it and TypeScript typechecks its `.tsx` source directly via bundler resolution.

**Consequences:**
- Do NOT add it to root `tsconfig.json` references or to an artifact's `references` — it is not a buildable composite project; doing so breaks `tsc --build`.
- Because its source is typechecked from the consuming artifact, the lib must resolve its own imports from its own `node_modules`. pnpm does NOT install `peerDependencies` (react) into a package's node_modules, so the lib carries `@types/react` as a devDependency to satisfy `import ... from "react"` type resolution. `@uppy/*` are real `dependencies` and get symlinked.
- After adding such a source-consumed lib as a workspace dep, run `pnpm install` so the lib's own deps are linked, or the consumer's typecheck fails with TS2307 on react/uppy.

**Why:** React here is 19.1.0 (catalog), so Uppy v5 `react@>=19` peer is already satisfied — no root `pnpm.overrides` for react/react-dom are needed (and `$react` override syntax fails anyway since root has no direct react dep).

# Storage route visibility model

`POST /api/storage/uploads/request-url` is gated behind `requireAuth` + `requirePermission("media:write")` — minting upload URLs is the write boundary.
`GET /api/storage/objects/*` is intentionally PUBLIC (no auth/ACL): uploads are storefront media assets that anonymous visitors must read. Media url is stored as `/api/storage${objectPath}` where objectPath is `/objects/...`.

**How to apply:** if a future use-case needs truly private objects, serve them from a separate protected path with `canAccessObjectEntity` checks — do not loosen the public `/objects/*` route.
