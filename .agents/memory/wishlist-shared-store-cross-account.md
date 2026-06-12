---
name: Wishlist shared local store cross-account hazard
description: Why client-side wishlist sync must clear local state on logout and refetch per-account
---

A persisted client store (zustand-persist localStorage, e.g. `useWishlistStore`) is shared by ALL accounts that use the same browser. Any "merge local <-> server on login" logic must guard against cross-account contamination.

**Rule:** when syncing a shared persisted store to a per-user server resource:
1. Clear the local store on logout (auth true→false transition) so the next account starts clean — otherwise account A's items merge into account B.
2. Force a fresh server fetch on account change (`queryClient.removeQueries` on the static query key) and gate the merge on `!isFetching` — React Query serves the previous user's cached data first under a static query key.
3. Key the one-time merge by `customer.id`, not just `isAuthenticated`, and gate the local→server mirror subscription on `mergedForRef === customerId`.

**Why:** code review caught that a static `getCustomerWishlistQueryKey()` + logout only invalidating `customerMe` let account A's wishlist leak into account B on a shared browser (privacy/data-mixing bug).

**How to apply:** any future feature that mirrors a localStorage-backed store (cart, wishlist, recently-viewed) to an authenticated server endpoint.
