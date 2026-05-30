import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { productIds, toggleWishlist, isInWishlist } = useWishlistStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const isWished = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success("تمت الإضافة إلى السلة", {
      description: product.nameAr,
      icon: <ShoppingCart className="h-4 w-4" />
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success("تمت الإضافة إلى المفضلة", { description: product.nameAr });
    }
  };

  return (
    <>
      <Link href={`/products/${product.id}`} className="block h-full">
        <motion.div 
          className="group relative glass-panel border border-primary/20 clip-corner-lg overflow-hidden transition-all duration-300 h-full flex flex-col glow-hover holo-sweep hud-frame"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -5 }}
        >
          {/* Top Scanline accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20"></div>

          {/* Badges */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            {product.discountPercent && (
              <span className="bg-secondary/20 text-secondary border border-secondary text-[10px] font-mono font-bold px-2 py-0.5 clip-corner-sm shadow-[0_0_8px_var(--magenta)]">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-primary/20 text-primary border border-primary text-[10px] font-mono font-bold px-2 py-0.5 clip-corner-sm shadow-[0_0_8px_var(--cyan)] animate-pulse">
                NEW
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-secondary/20 text-secondary border border-secondary text-[10px] font-mono font-bold px-2 py-0.5 clip-corner-sm shadow-[0_0_8px_var(--magenta)]">
                BEST_SELLER
              </span>
            )}
            {product.stock === 0 ? (
              <span className="bg-destructive/20 text-destructive border border-destructive text-[10px] font-mono font-bold px-2 py-0.5 clip-corner-sm shadow-[0_0_8px_var(--destructive)]">
                OUT_OF_STOCK
              </span>
            ) : product.stock < 5 ? (
              <span className="bg-lime/20 text-lime border border-lime text-[10px] font-mono font-bold px-2 py-0.5 clip-corner-sm shadow-[0_0_8px_var(--lime-raw)]">
                LOW_STOCK
              </span>
            ) : null}
          </div>

          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-background/50 p-6 flex items-center justify-center border-b border-primary/10">
            <img 
              src={isHovered && product.image2 ? product.image2 : product.image} 
              alt={product.nameAr} 
              className="object-contain w-full h-full mix-blend-screen transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            />
            
            {/* Grid overlay on image background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none mix-blend-screen"></div>
            
            {/* Quick Actions (Hover) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30"
                >
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="bg-primary/20 text-primary border border-primary w-10 h-10 clip-corner-sm flex items-center justify-center hover:bg-primary hover:text-background hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary/20 disabled:hover:text-primary shadow-[0_0_10px_var(--cyan)]"
                    aria-label="أضف للسلة"
                  >
                    <ShoppingCart size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
                    className="bg-background/80 text-primary border border-primary/50 w-10 h-10 clip-corner-sm flex items-center justify-center hover:scale-110 transition-all hover:border-primary hover:shadow-[0_0_10px_var(--cyan)]"
                    aria-label="نظرة سريعة"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={handleToggleWishlist}
                    className={`w-10 h-10 clip-corner-sm flex items-center justify-center transition-all hover:scale-110 border ${isWished ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_10px_var(--magenta)]' : 'bg-background/80 text-primary border-primary/50 hover:border-secondary hover:text-secondary'}`}
                    aria-label="أضف للمفضلة"
                  >
                    <Heart size={18} className={isWished ? "fill-current" : ""} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-background/40 to-background/80">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-primary/50 uppercase tracking-widest">
                SKU_{product.sku || product.id.slice(0, 6)}
              </span>
              <div className="flex items-center gap-1 text-primary">
                <Star size={12} className="fill-current" />
                <span className="text-xs font-mono font-bold">{product.rating}</span>
                <span className="text-[10px] font-mono text-primary/50">({product.reviewCount})</span>
              </div>
            </div>
            
            <h3 className="font-sans font-bold text-sm line-clamp-2 mb-2 flex-1 group-hover:text-primary transition-colors text-foreground">
              {product.nameAr}
            </h3>
            
            <p className="text-[11px] font-mono text-primary/40 mb-4 tracking-wider uppercase">
              {">"} {product.categorySlug}
            </p>
            
            <div className="flex items-end justify-between mt-auto pt-2 border-t border-primary/10">
              <div className="flex flex-col">
                {product.originalPrice && (
                  <span className="text-[10px] font-mono text-secondary/70 line-through decoration-secondary/50">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="font-mono font-bold text-lg text-primary neon-text flex items-center gap-1">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="w-2 h-2 bg-primary/30 clip-corner-sm group-hover:bg-primary group-hover:shadow-[0_0_8px_var(--cyan)] transition-colors animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-[700px] glass-panel border-primary clip-corner-lg shadow-[0_0_30px_var(--cyan)] font-sans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-sans text-primary neon-text glitch" data-text={product.nameAr}>{product.nameAr}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-background/50 border border-primary/20 clip-corner p-4 flex items-center justify-center aspect-square relative hud-corners">
              <img src={product.image} alt={product.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen drop-shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none mix-blend-screen"></div>
            </div>
            <div className="flex flex-col relative">
              <div className="absolute top-0 right-0 text-[10px] font-mono text-primary/30 uppercase tracking-widest text-right">
                <div>SYSTEM_INFO</div>
                <div>ID: {product.id}</div>
              </div>
              <div className="flex items-center gap-2 mb-4 mt-8">
                <span className="bg-primary/10 border border-primary/30 text-primary px-2 py-1 clip-corner-sm text-[10px] font-mono font-bold">
                  SKU: {product.sku || 'N/A'}
                </span>
                {product.stock > 0 ? (
                  <span className="bg-lime/10 border border-lime/30 text-lime text-[10px] font-mono font-bold px-2 py-1 clip-corner-sm flex items-center gap-1 shadow-[0_0_8px_var(--lime-raw)]">
                    <Zap size={10} /> STATUS: IN_STOCK ({product.stock})
                  </span>
                ) : (
                  <span className="bg-destructive/10 border border-destructive/30 text-destructive text-[10px] font-mono font-bold px-2 py-1 clip-corner-sm shadow-[0_0_8px_var(--destructive)]">
                    STATUS: OFFLINE
                  </span>
                )}
              </div>
              
              <div className="text-2xl font-mono font-bold text-primary mb-6 flex items-end gap-2 neon-text">
                {formatPrice(product.price)}
                {product.originalPrice && (
                  <span className="text-sm text-secondary/70 line-through decoration-secondary/50 mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-foreground/80 mb-6 line-clamp-4 leading-relaxed font-sans">
                تصفح المواصفات الكاملة للمنتج في صفحة التفاصيل.
                <br /><br />
                <span className="text-primary/70 font-mono text-xs">{"// "} WARRANTY: {product.warranty || '1_YEAR'}</span>
              </p>
              
              <div className="mt-auto space-y-3 font-mono">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background font-bold py-3 clip-corner transition-all flex items-center justify-center gap-2 glow-hover disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ShoppingCart size={18} />
                  [ ADD_TO_CART ]
                </button>
                <Link href={`/products/${product.id}`} className="block w-full text-center border border-primary/30 hover:border-primary text-primary py-3 clip-corner transition-all glow-hover text-sm">
                  {">"} FULL_DIAGNOSTICS
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-panel border border-primary/10 clip-corner-lg overflow-hidden h-full flex flex-col p-4 gap-4 animate-pulse hud-frame">
      <div className="aspect-square bg-primary/5 clip-corner-sm w-full border border-primary/10"></div>
      <div className="w-16 h-2 bg-primary/20"></div>
      <div className="w-full h-3 bg-primary/10 mt-2"></div>
      <div className="w-2/3 h-3 bg-primary/10"></div>
      <div className="mt-auto pt-4 flex justify-between items-end border-t border-primary/10">
        <div className="w-24 h-5 bg-primary/20"></div>
        <div className="w-2 h-2 bg-primary/20 clip-corner-sm"></div>
      </div>
    </div>
  );
}
