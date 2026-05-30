# TechZone — متجر الإلكترونيات والجيمنج

An Arabic (RTL) gaming & electronics e-commerce storefront with a cyberpunk "NEON GRID OS" visual identity. Customers browse products, categories and brands, add to cart, and place orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Storefront: `artifacts/techzone` (react-vite).
- Admin CMS: `artifacts/techzone-admin` (react-vite). Cookie-based same-origin auth; pages in `src/pages/`, layout in `src/components/layout/`, auth context in `src/lib/auth.tsx`.
- API server: `artifacts/api-server` (Express 5). Admin/auth routes in `src/routes/admin/*`.
- DB schema (source of truth): `lib/db/src/schema/*` (admin/auth/settings/media/audit in `admin.ts`).
- API contract: OpenAPI spec drives `lib/api-client-react` generated hooks/Zod schemas. Run codegen after spec changes; run `pnpm run typecheck:libs` to rebuild lib `.d.ts` before typechecking artifacts that consume them.

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- Web storefront `artifacts/techzone` (react-vite, port 25339, previewPath `/`), Arabic RTL, served against `artifacts/api-server`.
- Implemented pages: Home, Categories, CategoryDetail, ProductDetail, Cart, Checkout, OrderSuccess, 404. Many secondary routes (deals, search, brands, blog, wishlist, pc-builder, track-order, about, contact, faq) are still placeholders in `src/App.tsx`.
- Visual identity: cyberpunk "NEON GRID OS". The design system lives in `artifacts/techzone/src/index.css` (tokens + neon/HUD utilities). The global animated backdrop is `src/components/CyberBackground.tsx`, rendered once at App level — pages stay transparent so it shows through.
- Product detail is addressed by DB id (`/products/:id`, e.g. `prod-8`), not slug.
- Admin CMS `artifacts/techzone-admin` (react-vite, web port 26084, previewPath `/admin/`), Arabic RTL, same NEON GRID OS identity. Cookie-based same-origin auth against `artifacts/api-server`. First-time setup flow creates the first `super_admin` when 0 admins exist; sidebar links are RBAC-gated by permission strings. Pages: Dashboard, Orders, Products, Categories, Brands, Reviews, Blog, Media, Newsletter, Accounts, Settings, Audit.

## User preferences

- Communicate in Arabic.
- Visual direction is bold/unusual cyberpunk neon — go beyond safe templates. Competitor cobrashop.ps is a reference for the business model only, NOT for design.
- No emojis in the UI.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
