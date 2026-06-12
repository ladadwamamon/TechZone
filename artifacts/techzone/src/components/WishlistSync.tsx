import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWishlistStore } from "@/lib/store";
import { useCustomerAuth } from "@/lib/customerAuth";
import {
  useCustomerWishlist,
  useCustomerWishlistAdd,
  useCustomerWishlistRemove,
  getCustomerWishlistQueryKey,
} from "@workspace/api-client-react";

export function WishlistSync() {
  const { isAuthenticated, customer } = useCustomerAuth();
  const customerId = customer?.id ?? null;
  const queryClient = useQueryClient();

  const { data, isSuccess, isFetching } = useCustomerWishlist({
    query: { queryKey: getCustomerWishlistQueryKey(), enabled: isAuthenticated, retry: false },
  });
  const addMutation = useCustomerWishlistAdd();
  const removeMutation = useCustomerWishlistRemove();

  const mergedForRef = useRef<string | null>(null);
  const syncedRef = useRef<Set<string>>(new Set());
  const prevAuthRef = useRef(isAuthenticated);

  // Clear the local (shared, persisted) wishlist on logout so one account's
  // items can never leak into the next account that logs in on this browser.
  useEffect(() => {
    if (prevAuthRef.current && !isAuthenticated) {
      useWishlistStore.getState().setProductIds([]);
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Reset sync state and force a fresh server fetch whenever the account changes,
  // so we never merge against another account's cached wishlist.
  useEffect(() => {
    syncedRef.current = new Set();
    mergedForRef.current = null;
    if (customerId) {
      queryClient.removeQueries({ queryKey: getCustomerWishlistQueryKey() });
    }
  }, [customerId, queryClient]);

  // One-time merge per account, only against fresh (not in-flight) server data.
  useEffect(() => {
    if (!isAuthenticated || !customerId) return;
    if (mergedForRef.current === customerId) return;
    if (!isSuccess || isFetching || !data) return;

    const serverIds = data.productIds ?? [];
    const localIds = useWishlistStore.getState().productIds;
    const serverSet = new Set(serverIds);
    const merged = Array.from(new Set([...serverIds, ...localIds]));

    const toPush = localIds.filter((id) => !serverSet.has(id));
    for (const productId of toPush) {
      addMutation.mutate({ data: { productId } });
    }

    useWishlistStore.getState().setProductIds(merged);
    syncedRef.current = new Set(merged);
    mergedForRef.current = customerId;
  }, [isAuthenticated, customerId, isSuccess, isFetching, data, addMutation]);

  // Mirror local toggles to the server, but only after this account's merge ran.
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = useWishlistStore.subscribe((state) => {
      if (mergedForRef.current !== customerId) return;
      const current = new Set(state.productIds);
      const synced = syncedRef.current;

      for (const id of current) {
        if (!synced.has(id)) addMutation.mutate({ data: { productId: id } });
      }
      for (const id of synced) {
        if (!current.has(id)) removeMutation.mutate({ productId: id });
      }
      syncedRef.current = current;
    });

    return unsubscribe;
  }, [isAuthenticated, customerId, addMutation, removeMutation]);

  return null;
}
