import { Layout } from "@/components/Layout";
import { useGetProduct, useGetRelatedProducts, useGetRecentlyViewedProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Link, useParams } from "wouter";
import { ChevronLeft, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useGetProduct(id || "");
  const { data: relatedProducts, isLoading: relatedLoading } = useGetRelatedProducts(id || "");
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { productIds, toggleWishlist, isInWishlist } = useWishlistStore();
  
  const isWished = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  // Handle recently viewed
  useEffect(() => {
    if (id) {
      const recent = JSON.parse(localStorage.getItem("techzone-recent") || "[]");
      const updated = [id, ...recent.filter((rId: string) => rId !== id)].slice(0, 8);
      localStorage.setItem("techzone-recent", JSON.stringify(updated));
    }
  }, [id]);

  const { data: recentlyViewed } = useGetRecentlyViewedProducts({
    ids: JSON.parse(localStorage.getItem("techzone-recent") || "[]").join(",")
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      image: product.images[0],
    });
    toast.success("تمت الإضافة إلى السلة", { description: product.nameAr });
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success("تمت الإضافة إلى المفضلة", { description: product.nameAr });
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `مرحباً، أريد الاستفسار عن المنتج: ${product.nameAr} - الرابط: ${window.location.href}`;
    window.open(`https://wa.me/1234567890?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (isLoading || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-4 w-64 bg-white/10 rounded mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 space-y-4">
              <div className="aspect-square bg-white/5 rounded-xl"></div>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 bg-white/5 rounded-md"></div>)}
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <div className="h-8 w-3/4 bg-white/10 rounded"></div>
              <div className="h-6 w-1/4 bg-white/10 rounded"></div>
              <div className="h-12 w-1/3 bg-white/10 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-2/3 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-card border-b border-white/5 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
            <ChevronLeft size={14} />
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-primary transition-colors">
              {product.categoryNameAr || product.categorySlug}
            </Link>
            <ChevronLeft size={14} />
            <span className="text-foreground truncate max-w-[200px] md:max-w-md">{product.nameAr}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 aspect-square flex items-center justify-center relative mb-4 group overflow-hidden glass-panel">
              {/* Badges */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {product.discountPercent && (
                  <span className="bg-destructive text-white text-sm font-bold px-3 py-1 rounded shadow-lg">
                    خصم {product.discountPercent}%
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded shadow-lg">
                    جديد
                  </span>
                )}
              </div>
              
              <img 
                src={activeImage || product.images[0]} 
                alt={product.nameAr} 
                className="max-w-full max-h-full object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 rounded-lg p-2 flex items-center justify-center border-2 transition-all ${activeImage === img ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-primary/50'}`}
                  >
                    <img src={img} alt="" className="max-w-full max-h-full object-contain mix-blend-screen" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Link href={`/brands/${product.brandSlug}`} className="text-muted-foreground hover:text-primary text-sm font-bold transition-colors">
                  {product.brandNameEn || product.brandSlug}
                </Link>
                <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight">{product.nameAr}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-white/20 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 font-bold text-foreground text-sm">{product.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">({product.reviewCount} تقييم)</span>
                
                <div className="w-px h-4 bg-white/20 mx-2"></div>
                
                {product.stock > 0 ? (
                  <span className="text-green-400 text-sm font-bold flex items-center gap-1">متوفر ({product.stock})</span>
                ) : (
                  <span className="text-destructive text-sm font-bold">نفدت الكمية</span>
                )}
              </div>

              <div className="text-4xl font-black text-primary neon-text mb-2">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-lg text-muted-foreground line-through decoration-destructive/50 mb-6">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.descriptionAr}
            </p>

            {/* Quick Specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="mb-8 grid grid-cols-2 gap-y-2 text-sm">
                {product.specs.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex flex-col border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">{spec.labelAr}</span>
                    <span className="font-bold text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center bg-background border border-white/10 rounded-md">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >-</button>
                <input 
                  type="number" 
                  value={quantity}
                  readOnly
                  className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold"
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-bold py-3 px-6 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                <ShoppingCart size={20} />
                أضف للسلة
              </button>
              
              <button 
                onClick={handleToggleWishlist}
                className={`px-4 py-3 rounded-md border transition-colors flex items-center justify-center ${isWished ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-background border-white/10 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
              >
                <Heart size={20} className={isWished ? "fill-current" : ""} />
              </button>
            </div>

            <button 
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-md font-bold py-3 px-6 transition-all flex items-center justify-center gap-2 mb-8"
            >
              <MessageCircle size={20} />
              استفسر عبر واتساب
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="text-primary" size={24} />
                <div>
                  <div className="font-bold text-foreground">ضمان محلي</div>
                  <div>{product.warranty || 'سنة واحدة'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="text-primary" size={24} />
                <div>
                  <div className="font-bold text-foreground">شحن سريع</div>
                  <div>لجميع المدن</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="text-primary" size={24} />
                <div>
                  <div className="font-bold text-foreground">إرجاع سهل</div>
                  <div>خلال 14 يوم</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Detailed Specs & Reviews Tabs */}
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden mb-16">
          <div className="flex border-b border-white/5 overflow-x-auto scrollbar-hide">
            <button className="px-8 py-4 font-bold text-primary border-b-2 border-primary bg-primary/5 whitespace-nowrap">
              المواصفات التقنية
            </button>
            <button className="px-8 py-4 font-bold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors whitespace-nowrap">
              مراجعات العملاء ({product.reviewCount})
            </button>
          </div>
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6">المواصفات التفصيلية</h3>
            {product.specs && product.specs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className={`flex py-3 border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.02] px-4 rounded -mx-4' : ''}`}>
                    <span className="w-1/3 text-muted-foreground">{spec.labelAr}</span>
                    <span className="w-2/3 font-medium text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">لا توجد مواصفات تقنية تفصيلية متاحة لهذا المنتج.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {!relatedLoading && relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-black mb-8 border-r-4 border-primary pr-4">منتجات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-8 border-r-4 border-secondary pr-4">شاهدت مؤخراً</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
