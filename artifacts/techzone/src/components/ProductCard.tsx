import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { Product } from "@workspace/api-client-react/src/generated/api.schemas";
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
      <Link href={`/products/${product.id}`}>
        <motion.div 
          className="group relative bg-card border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors duration-300 h-full flex flex-col glass-panel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ y: -5 }}
        >
          {/* Badges */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {product.discountPercent && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-lg">
                خصم {product.discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-lg">
                جديد
              </span>
            )}
            {product.isBestSeller && (
              <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-lg">
                الأكثر مبيعاً
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-sm shadow-lg">
                نفدت الكمية
              </span>
            )}
          </div>

          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-white/5 p-4 flex items-center justify-center">
            <img 
              src={isHovered && product.image2 ? product.image2 : product.image} 
              alt={product.nameAr} 
              className="object-contain w-full h-full mix-blend-screen transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Quick Actions (Hover) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"
                >
                  <button 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                    aria-label="أضف للسلة"
                  >
                    <ShoppingCart size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
                    className="bg-card text-foreground border border-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform hover:border-primary/50"
                    aria-label="نظرة سريعة"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={handleToggleWishlist}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 border ${isWished ? 'bg-destructive border-destructive text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-card text-foreground border-white/10 hover:border-destructive/50'}`}
                    aria-label="أضف للمفضلة"
                  >
                    <Heart size={18} className={isWished ? "fill-current" : ""} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-1 mb-2 text-yellow-500">
              <Star size={14} className="fill-current" />
              <span className="text-xs font-bold">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
            
            <h3 className="font-semibold text-sm line-clamp-2 mb-1 flex-1 group-hover:text-primary transition-colors">
              {product.nameAr}
            </h3>
            
            <p className="text-xs text-muted-foreground mb-3">{product.categorySlug}</p>
            
            <div className="flex items-end justify-between mt-auto">
              <div className="flex flex-col">
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through decoration-destructive/50">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="font-bold text-lg text-primary neon-text">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="sm:max-w-[700px] bg-card/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{product.nameAr}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-center aspect-square">
              <img src={product.image} alt={product.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">SKU: {product.sku || 'N/A'}</span>
                {product.stock > 0 ? (
                  <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Zap size={12} /> متوفر ({product.stock})</span>
                ) : (
                  <span className="text-destructive text-xs font-bold">نفدت الكمية</span>
                )}
              </div>
              
              <div className="text-2xl font-bold text-primary mb-6 mt-2">
                {formatPrice(product.price)}
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2 mr-2">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 line-clamp-4">
                تصفح المواصفات الكاملة للمنتج في صفحة التفاصيل. هذا المنتج متوفر مع ضمان {product.warranty || 'سنة'}.
              </p>
              
              <div className="mt-auto space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:shadow-none"
                >
                  <ShoppingCart size={20} />
                  أضف للسلة
                </button>
                <Link href={`/products/${product.id}`} className="block w-full text-center border border-white/10 hover:border-primary/50 text-foreground py-3 rounded-md transition-all">
                  عرض التفاصيل الكاملة
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
    <div className="bg-card border border-white/5 rounded-xl overflow-hidden h-full flex flex-col p-4 gap-4 animate-pulse">
      <div className="aspect-square bg-white/5 rounded-lg w-full"></div>
      <div className="w-16 h-3 bg-white/10 rounded"></div>
      <div className="w-full h-4 bg-white/10 rounded mt-2"></div>
      <div className="w-2/3 h-4 bg-white/10 rounded"></div>
      <div className="mt-auto pt-4 flex justify-between items-end">
        <div className="w-24 h-6 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}
