---
name: Review moderation approval
description: How product review approval (is_approved) behaves across storefront, admin, and rating recalc
---

Product reviews have an `is_approved` boolean (`product_reviews.is_approved`).

The column **defaults to true**.
**Why:** the storefront and the product rating recalc both filter to approved reviews only. Defaulting to true keeps existing/demo reviews visible after the column was added, and admin-created reviews are trusted (created with `isApproved: true`).
**How to apply:** if you ever add a *public* customer-submitted review route, insert those with `isApproved: false` so they land in the admin moderation queue. Any code that aggregates rating/reviewCount or lists reviews for buyers must filter `is_approved = true`, or pending reviews will leak to the storefront and skew ratings.

Admin moderation: `PATCH /admin/reviews/:id` (operationId `adminUpdateReview`, body `AdminReviewUpdateInput { isApproved }`) toggles approval and re-runs the product rating recalc. Gated by `requirePermission("reviews:write")`.
