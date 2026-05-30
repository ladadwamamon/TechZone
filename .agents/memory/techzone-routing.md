---
name: TechZone product routing
description: How TechZone product detail pages are addressed (id vs slug)
---
# TechZone product detail routing

Product detail route is `/products/:id` and the API `GET /api/products/:id` looks up by the DB **id** (e.g. `prod-8`), NOT the `slug`. Product links must use `product.id` (ProductCard already does). Hitting `/products/<slug>` returns 404 — that is expected, not a bug.

**Why:** Easy to mistake the human-readable `slug` field for the URL key when manually testing pages; wasted a debugging cycle screenshotting a slug URL.

**How to apply:** When testing or linking to a product, use the `id` value from the products API, not `slug`.
