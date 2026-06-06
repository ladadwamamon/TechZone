import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
  productType?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.productId === item.productId);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter((i) => i.productId !== productId),
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    { name: 'nexus-cart' }
  )
);

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggleWishlist: (productId) => set((state) => ({
        productIds: state.productIds.includes(productId)
          ? state.productIds.filter((id) => id !== productId)
          : [...state.productIds, productId],
      })),
      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    { name: 'nexus-wishlist' }
  )
);

interface PCBuilderState {
  components: Record<string, any>;
  setComponent: (type: string, component: any) => void;
  removeComponent: (type: string) => void;
  clearBuilder: () => void;
  getTotalPrice: () => number;
}

export const usePCBuilderStore = create<PCBuilderState>()(
  persist(
    (set, get) => ({
      components: {},
      setComponent: (type, component) => set((state) => ({
        components: { ...state.components, [type]: component },
      })),
      removeComponent: (type) => set((state) => {
        const newComponents = { ...state.components };
        delete newComponents[type];
        return { components: newComponents };
      }),
      clearBuilder: () => set({ components: {} }),
      getTotalPrice: () => Object.values(get().components).reduce((total, comp) => total + (comp?.price || 0), 0),
    }),
    { name: 'nexus-pcbuilder' }
  )
);
