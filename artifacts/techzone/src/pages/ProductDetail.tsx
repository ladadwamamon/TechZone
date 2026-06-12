import { Layout } from "@/components/Layout";
import { useGetProduct, useGetRelatedProducts, useGetRecentlyViewedProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Link, useParams, useLocation } from "wouter";
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, MessageCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { flyToCart } from "@/lib/flyToCart";
import { formatPrice } from "@/lib/utils";
import { useSiteSettings } from "@/lib/settings";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: product, isLoading } = useGetProduct(id || "");
  const { data: relatedProducts, isLoading: relatedLoading } = useGetRelatedProducts(id || "");
  const { social, contact } = useSiteSettings();
  
  const [activeImage, setActiveImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { productIds, toggleWishlist, isInWishlist } = useWishlistStore();
  
  const isWished = product ? isInWishlist(product.id) : false;
  const isDigital = product?.productType === "digital";

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  // Handle recently viewed
  useEffect(() => {
    if (id) {
      const recent = JSON.parse(localStorage.getItem("nexus-recent") || "[]");
      const updated = [id, ...recent.filter((rId: string) => rId !== id)].slice(0, 8);
      localStorage.setItem("nexus-recent", JSON.stringify(updated));
    }
  }, [id]);

  const { data: recentlyViewed } = useGetRecentlyViewedProducts({
    ids: JSON.parse(localStorage.getItem("nexus-recent") || "[]").join(",")
  });

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (!product) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      image: product.images[0],
      productType: product.productType,
    });
    if (e?.currentTarget) flyToCart(product.images[0], e.currentTarget as HTMLElement);
    toast.success("تمت الإضافة إلى السلة", { description: product.nameAr });
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      image: product.images[0],
      productType: product.productType,
    });
    setLocation('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    if (!isWished) {
      toast.success("تمت الإضافة إلى المفضلة", { description: product.nameAr });
    }
  };

  const whatsappNumber = (social.whatsapp || contact.phone).replace(/[^\d]/g, "");

  const handleWhatsApp = () => {
    if (!product || !whatsappNumber) return;
    const msg = `مرحباً، أريد الاستفسار عن المنتج: ${product.nameAr} - الرابط: ${window.location.href}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

    const helmetTitle = product?.metaTitle || product?.nameAr || "نكسس";
  const helmetDescRaw = product?.metaDescription || product?.descriptionAr || "منتجات إلكترونيات وقطع كمبيوتر وألعاب من Nexus Store";
  const helmetDesc = helmetDescRaw.replace(/<[^>]*>/g, "").trim();
  const helmetKeywords = product?.metaKeywords || "نكسس, إلكترونيات, كمبيوتر, ألعاب";

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const toAbsolute = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (/^https?:\/\//.test(url)) return url;
    return `${siteOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const ogImage = toAbsolute(product?.images?.[0]);

  const productJsonLd = product
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.nameAr,
        image: (product.images ?? []).map((img) => toAbsolute(img)).filter(Boolean),
        description: helmetDesc,
        sku: product.sku || product.id,
        brand: { "@type": "Brand", name: product.brandSlug },
        offers: {
          "@type": "Offer",
          url: pageUrl,
          priceCurrency: "ILS",
          price: product.price,
          availability:
            product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        ...(product.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
      }
    : null;

  if (isLoading || !product) {
    return (
      <Layout>
        <Helmet>
          <title>جار التحميل...</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8 animate-pulse">
          <div className="h-4 w-64 bg-primary/20 clip-corner mb-8"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 space-y-4">
              <div className="aspect-square glass-panel clip-corner-lg border-primary/20"></div>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 glass-panel clip-corner border-primary/10"></div>)}
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <div className="h-8 w-3/4 bg-primary/20 clip-corner"></div>
              <div className="h-6 w-1/4 bg-primary/20 clip-corner"></div>
              <div className="h-12 w-1/3 bg-primary/20 clip-corner"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/5 clip-corner-sm"></div>
                <div className="h-4 w-full bg-white/5 clip-corner-sm"></div>
                <div className="h-4 w-2/3 bg-white/5 clip-corner-sm"></div>
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
      <div className="border-b border-primary/20 py-4 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-xs md:text-sm text-primary font-mono uppercase">
            <Link href="/" className="hover:text-secondary transition-colors">ROOT</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-secondary transition-colors">CAT</Link>
            <span>/</span>
            <Link href={`/categories/${product.categorySlug}`} className="hover:text-secondary transition-colors">
              {product.categorySlug}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[150px] md:max-w-md">{product.sku || product.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

        <Helmet>
          <title>{helmetTitle}</title>
          <meta name="description" content={helmetDesc} />
          <meta name="keywords" content={helmetKeywords} />
          <meta property="og:title" content={helmetTitle} />
          <meta property="og:description" content={helmetDesc} />
          <meta property="og:type" content="product" />
          {pageUrl && <meta property="og:url" content={pageUrl} />}
          {ogImage && <meta property="og:image" content={ogImage} />}
          <meta property="product:price:amount" content={String(product.price)} />
          <meta property="product:price:currency" content="ILS" />
          <meta name="twitter:title" content={helmetTitle} />
          <meta name="twitter:description" content={helmetDesc} />
          {ogImage && <meta name="twitter:image" content={ogImage} />}
          {productJsonLd && (
            <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
          )}
        </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="glass-panel hud-corners clip-corner-lg p-8 aspect-square flex items-center justify-center relative mb-4 group overflow-hidden border-primary/30">
              <div className="absolute inset-0 bg-primary/5 pointer-events-none holo-sweep" />
              {/* Badges */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 font-mono">
                {product.discountPercent && (
                  <span className="bg-destructive text-white text-xs font-bold px-3 py-1 clip-corner shadow-[0_0_10px_rgba(245,41,63,0.5)] tracking-wider">
                    -{product.discountPercent}%
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 clip-corner shadow-[0_0_10px_rgba(0,229,255,0.5)] tracking-wider">
                    [ NEW_ENTRY ]
                  </span>
                )}
              </div>
              
              <img 
                src={activeImage || product.images[0]} 
                alt={product.nameAr} 
                className="max-w-full max-h-full object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-110 z-10 relative"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 w-20 h-20 clip-corner p-2 flex items-center justify-center border-2 transition-all ${activeImage === img ? 'border-primary bg-primary/20 neon-border' : 'border-primary/20 bg-background/50 hover:border-secondary/50'}`}
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
              <div className="flex items-center justify-between mb-4 font-mono">
                <Link href={`/brands/${product.brandSlug}`} className="text-secondary hover:text-primary text-sm font-bold transition-colors uppercase neon-text-magenta hover:neon-text">
                  // MFG: {product.brandNameEn || product.brandSlug}
                </Link>
                <span className="text-xs text-primary/70 bg-primary/10 px-2 py-1 clip-corner-sm border border-primary/20 uppercase tracking-widest">
                  [ SKU: {product.sku || 'N/A'} ]
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4 leading-tight glitch uppercase" data-text={product.nameAr}>{product.nameAr}</h1>
              
              <div className="flex items-center gap-4 mb-6 font-mono text-sm uppercase">
                <div className="flex items-center text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-primary/20 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 font-bold text-foreground text-sm">{product.rating}</span>
                </div>
                <span className="text-primary/60 text-xs">({product.reviewCount} REVIEWS)</span>
                
                <div className="w-px h-4 bg-primary/30 mx-2"></div>
                
                {product.stock > 0 ? (
                  <span className="text-lime text-sm font-bold flex items-center gap-1 neon-text-lime tracking-widest">[ STATUS: متوفر // QTY: {product.stock} ]</span>
                ) : (
                  <span className="text-destructive text-sm font-bold bg-destructive/10 border border-destructive px-2 py-1 clip-corner-sm tracking-widest">[ STATUS: OFFLINE ]</span>
                )}
              </div>

              <div className="flex items-end gap-4 mb-6">
                <div className="text-4xl font-black text-primary font-mono neon-text">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-lg text-muted-foreground font-mono line-through decoration-destructive/80 mb-1">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            <div className="text-muted-foreground leading-relaxed mb-8 font-mono text-sm border-r-2 border-primary/30 pr-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
              <div dangerouslySetInnerHTML={{ __html: product.descriptionAr || "" }} />
            </div>

            {/* Quick Specs */}
            {product.specs && product.specs.length > 0 && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm bg-background/50 p-4 border border-primary/20 clip-corner">
                {product.specs.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex flex-col border-b border-primary/10 pb-2">
                    <span className="text-primary/70 uppercase text-[10px] tracking-widest">[{spec.labelAr}]</span>
                    <span className="font-bold text-foreground truncate">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex gap-4">
                <div className="flex items-center glass-panel clip-corner border-primary/30 w-32 shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 py-3 text-primary hover:text-secondary hover:bg-primary/10 transition-colors font-mono font-bold"
                  >-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    readOnly
                    className="w-12 text-center bg-transparent border-none focus:ring-0 font-mono font-bold text-primary"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="flex-1 py-3 text-primary hover:text-secondary hover:bg-primary/10 transition-colors font-mono font-bold"
                  >+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 px-6 transition-all flex items-center justify-center gap-2 glow-hover disabled:opacity-50 disabled:shadow-none uppercase tracking-wide font-mono"
                >
                  <ShoppingCart size={20} />
                  أضف للسلة
                </button>
                
                <button 
                  onClick={handleToggleWishlist}
                  className={`w-14 shrink-0 clip-corner transition-all flex items-center justify-center border ${isWished ? 'bg-secondary/20 border-secondary text-secondary neon-border-magenta' : 'glass-panel border-primary/30 text-primary hover:border-secondary hover:text-secondary'}`}
                >
                  <Heart size={20} className={isWished ? "fill-current" : ""} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90 clip-corner font-bold py-3 px-6 transition-all flex items-center justify-center gap-2 glow-hover-magenta disabled:opacity-50 disabled:shadow-none uppercase tracking-wide font-mono"
                >
                  <Zap size={20} />
                  اشتري الآن
                </button>

                {whatsappNumber && (
                  <button 
                    onClick={handleWhatsApp}
                    className="flex-1 bg-lime text-lime-foreground hover:bg-lime/90 clip-corner font-bold py-3 px-6 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(158,255,0,0.3)] hover:shadow-[0_0_25px_rgba(158,255,0,0.6)] uppercase tracking-wide font-mono text-black"
                  >
                    <MessageCircle size={20} />
                    استفسر عبر واتساب
                  </button>
                )}
              </div>
            </div>

            {/* Digital delivery instructions */}
            {isDigital && product.digitalInstructionsAr && (
              <div className="mb-8 glass-panel border-lime/30 clip-corner p-4 font-mono text-sm">
                <div className="font-bold text-lime text-[10px] uppercase tracking-widest mb-2 neon-text-lime">[ تعليمات الاستخدام ]</div>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.digitalInstructionsAr}</div>
              </div>
            )}

            {/* Features */}
            {isDigital ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-primary/20 pt-8 font-mono">
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <Zap className="text-lime" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ DELIVERY ]</div>
                    <div className="text-foreground font-bold">تسليم فوري</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <Shield className="text-secondary" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ {product.deliveryType === 'account' ? 'ACCOUNT' : 'CODE'} ]</div>
                    <div className="text-foreground font-bold">{product.deliveryType === 'account' ? 'حساب رقمي' : 'كود رقمي'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <MessageCircle className="text-secondary" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ {product.region ? 'REGION' : 'SUPPORT' } ]</div>
                    <div className="text-foreground font-bold">{product.region || 'دعم على مدار الساعة'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-primary/20 pt-8 font-mono">
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <Shield className="text-secondary" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ WARRANTY ]</div>
                    <div className="text-foreground font-bold">{product.warranty || 'سنة واحدة'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <Truck className="text-secondary" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ SHIPPING ]</div>
                    <div className="text-foreground font-bold">شحن سريع</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm glass-panel p-3 clip-corner-sm border-primary/10">
                  <RotateCcw className="text-secondary" size={20} />
                  <div>
                    <div className="font-bold text-primary text-[10px] uppercase tracking-widest">[ RETURNS ]</div>
                    <div className="text-foreground font-bold">خلال 14 يوم</div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Detailed Specs & Reviews Tabs */}
        <div className="glass-panel border-primary/30 clip-corner-lg overflow-hidden mb-16 relative">
          <div className="absolute top-0 left-0 w-full h-[1px] neon-divider" />
          <div className="flex border-b border-primary/20 overflow-x-auto scrollbar-hide font-mono">
            <button className="px-8 py-4 font-bold text-primary border-b-2 border-primary bg-primary/10 whitespace-nowrap uppercase tracking-widest text-sm">
              // TECH_SPECS
            </button>
            <button className="px-8 py-4 font-bold text-muted-foreground hover:text-secondary hover:bg-secondary/5 transition-colors whitespace-nowrap uppercase tracking-widest text-sm">
              // USER_REVIEWS ({product.reviewCount})
            </button>
          </div>
          <div className="p-8">
            <h3 className="text-xl font-bold mb-6 font-mono text-primary neon-text uppercase tracking-widest">{">>"} HARDWARE_DETAILS</h3>
            {product.specs && product.specs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 font-mono text-sm">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="flex py-3 border-b border-primary/10 hover:bg-primary/5 px-2 transition-colors">
                    <span className="w-1/3 text-primary/70 uppercase text-[10px] tracking-widest flex items-center">[{spec.labelAr}]</span>
                    <span className="w-2/3 font-medium text-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground font-mono">SYSTEM_MSG: No hardware specifications found.</p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {!relatedLoading && relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-16 relative">
            <h2 className="text-2xl font-black mb-8 border-r-4 border-primary pr-4 neon-text flex items-center gap-4">
              وحدات ذات صلة
              <span className="font-mono text-sm text-primary/50 tracking-widest">_RELATED_MODULES</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map(prod => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <div className="relative">
            <h2 className="text-2xl font-black mb-8 border-r-4 border-secondary pr-4 neon-text-magenta flex items-center gap-4">
              سجل التصفح
              <span className="font-mono text-sm text-secondary/50 tracking-widest">_RECENT_LOG</span>
            </h2>
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
