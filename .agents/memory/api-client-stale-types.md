---
name: api-client-react stale generated types
description: Why an artifact typecheck reports "missing" admin/new API hooks that clearly exist in the lib source
---

When an artifact (e.g. `artifacts/techzone-admin`) consumes `@workspace/api-client-react` AND lists it in its tsconfig `references`, TypeScript resolves that import from the lib's **built `.d.ts` output**, not the live source — even though the package's `exports` points at `./src/index.ts`. Composite project references win.

**Symptom:** artifact typecheck says a generated hook/type is missing ("did you mean useListProducts?") for endpoints you know exist in `lib/api-client-react/src/generated/api.ts`. The lib's `dist` is just stale.

**Fix:** run `pnpm run typecheck:libs` (i.e. `tsc --build`) to rebuild the lib declarations, THEN re-run the artifact typecheck. Do this after regenerating the OpenAPI client (`pnpm --filter @workspace/api-spec run codegen`) or any time you add API endpoints.

**Why:** saves chasing phantom "missing export" errors and editing source that was already correct.

Related: generated list-query hooks take `(params, options)` — params is the FIRST arg, react-query options (`{ query: { queryKey, enabled, ... } }`) is the SECOND. Passing `{ query: ... }` as the first arg triggers TS2353 "'query' does not exist in type 'XParams'".
