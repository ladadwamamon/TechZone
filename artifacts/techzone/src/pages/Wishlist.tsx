import { Layout } from "@/components/Layout";
import { useWishlistStore } from "@/lib/store";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link } from "wouter";
import { Heart, HeartCrack, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

export default function Wishlist() {
  const { productIds, toggleWishlist } = useWishlistStore();
  const { data, isLoading } = useListProducts({ limit: 200 });

  const wishlistProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter(p => productIds.includes(p.id));
  }, [data?.products, productIds]);

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <span className="text-foreground truncate uppercase">WISHLIST</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text="المفضلة">
            المفضلة
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 min-h-[50vh]">
        <div className="glass-panel clip-corner border-primary/20 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-mono text-primary uppercase flex items-center gap-2">
            <Heart size={18} className="fill-primary" />
            SYS.SAVED_ITEMS: {productIds.length}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="glass-panel clip-corner hud-frame p-12 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 clip-corner flex items-center justify-center text-primary mb-4 neon-border">
              <HeartCrack size={48} />
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono uppercase neon-text">{">"} NO_SAVED_ITEMS</h3>
            <p className="text-muted-foreground mb-6 font-mono text-sm">// قائمة المفضلة الخاصة بك فارغة حالياً.</p>
            <Link href="/categories">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 px-6 transition-all glow-hover uppercase tracking-wide font-mono text-sm flex items-center gap-2">
                [ BROWSE_CATALOG ]
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <ProductCard product={product} />
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute -top-3 -right-3 z-30 bg-destructive/90 text-destructive-foreground hover:bg-destructive p-2 clip-corner-sm shadow-[0_0_10px_var(--destructive)] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="إزالة من المفضلة"
                  >
                    <HeartCrack size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Layout>
  );
}
