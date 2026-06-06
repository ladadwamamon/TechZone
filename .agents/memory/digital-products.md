---
name: digital products & code allocation
description: Invariants for digital-product code inventory, allocation idempotency, and shipping rules in Nexus Store.
---

# Digital products (gift cards / subscriptions / accounts)

Digital goods are `products.productType='digital'` with a `digital_codes` inventory pool. Buying allocates codes from the pool; codes are revealed on order-success + customer account.

## Allocation must be idempotent
`allocateCodesForOrder()` (api-server `src/lib/digital.ts`) is called BOTH at checkout and by admin fulfill (`/admin/orders/:id/fulfill`). It must never over-allocate.
- **Rule:** aggregate desired qty per product, then subtract codes already `sold` for that `(orderId, productId)` before picking `remaining` more. Allocate with `FOR UPDATE SKIP LOCKED` for concurrency.
- **Why:** fulfill re-passes the full order quantities; without the "already allocated" guard a second fulfill (or fulfill after checkout) double-sells codes.

## Stock is derived, never manual for digital
`products.stock` for digital products must equal the count of `available` codes. `syncDigitalStock()` is the single source of truth — call it after any code add/delete/allocate AND after admin product create/update (which otherwise accepts arbitrary `stock`).

## Shipping rule (single source, both sides)
Shipping is charged only on the **physical** portion: `physicalSubtotal === 0 || physicalSubtotal >= 500 ? 0 : 30`. Frontend (Cart.tsx, Checkout.tsx) and backend (orders.ts) must use the SAME rule, computed from physical-only subtotal — not the full subtotal — or mixed carts show one price and get charged another.

## Admin-authored HTML is sanitized at render
Custom pages (`contentHtml`) render via `dangerouslySetInnerHTML`; sanitize with DOMPurify on the storefront to avoid stored XSS from a compromised admin.
