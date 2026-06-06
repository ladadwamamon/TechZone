import { Layout } from "@/components/Layout";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Tag, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [, setLocation] = useLocation();

  const subtotal = getTotalPrice();
  const physicalSubtotal = items
    .filter((i) => i.productType !== "digital")
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  const hasPhysical = physicalSubtotal > 0;
  const shipping = physicalSubtotal === 0 || physicalSubtotal >= 500 ? 0 : 30;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="hud-corners p-8 glass-panel max-w-md w-full relative">
            <div className="absolute top-2 left-4 text-xs font-mono text-primary/50">// STATUS: EMPTY</div>
            <div className="w-24 h-24 mx-auto bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary mb-6 relative">
              <Terminal size={48} className="animate-pulse-glow" />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-2 -right-2 bg-destructive text-white p-2 clip-corner shadow-[0_0_15px_rgba(245,41,63,0.5)]"
              >
                <Trash2 size={20} />
              </motion.div>
            </div>
            <h1 className="text-3xl font-black mb-4 neon-text glitch" data-text="سلة المشتريات فارغة">سلة المشتريات فارغة</h1>
            <p className="text-muted-foreground mb-8">
              لا توجد بيانات في السلة. يرجى مسح المنتجات وإضافتها إلى النظام.
            </p>
            <Link href="/categories" className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 clip-corner font-bold transition-all glow-hover uppercase tracking-wider">
              بدء الفحص والتسوق
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto px-4 relative z-10 flex items-center gap-4">
          <ShoppingCart className="text-primary w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-black neon-text text-primary glitch uppercase" data-text="سلة المشتريات">سلة المشتريات</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="glass-panel border-primary/30 hud-corners p-1">
              <div className="p-4 sm:p-6 border-b border-primary/20 flex justify-between items-center bg-primary/5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <span className="font-mono text-primary">//</span> المنتجات <span className="font-mono text-primary">[{items.length}]</span>
                </h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 font-mono uppercase tracking-wide"
                >
                  <Trash2 size={16} /> إفراغ السلة
                </button>
              </div>
              
              <div className="divide-y divide-primary/10">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center hover:bg-primary/5 transition-colors"
                    >
                      <Link href={`/products/${item.productId}`} className="w-32 h-32 bg-background/50 border border-primary/20 clip-corner-sm p-2 flex items-center justify-center shrink-0 glow-hover group relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                        <img src={item.image} alt={item.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform relative z-10" />
                      </Link>
                      
                      <div className="flex-1 flex flex-col h-full text-center sm:text-right w-full">
                        <Link href={`/products/${item.productId}`} className="font-bold text-lg hover:text-primary transition-colors mb-2 line-clamp-2">
                          {item.nameAr}
                        </Link>
                        
                        <div className="text-primary font-mono text-xl mb-4 sm:mb-auto neon-text">
                          {formatPrice(item.price)}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center bg-background border border-primary/30 clip-corner-sm shadow-inner overflow-hidden">
                            <button 
                              onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-2 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity}
                              readOnly
                              className="w-12 text-center bg-transparent border-none focus:ring-0 font-mono text-primary font-bold"
                            />
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-2 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-mono text-lg hidden sm:block text-muted-foreground">
                              الإجمالي: <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                            </span>
                            <button 
                              onClick={() => removeItem(item.productId)}
                              className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 font-mono uppercase"
                            >
                              <Trash2 size={14} /> إزالة
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="glass-panel border-secondary/30 hud-frame-magenta p-6 sticky top-24">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-secondary/70 tracking-widest">// SUMMARY_SYS</div>
              <h2 className="font-bold text-xl mb-6 pb-4 border-b border-secondary/20 flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary animate-pulse-glow"></span>
                ملخص الطلب
              </h2>
              
              <div className="space-y-4 mb-6 font-mono text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>{hasPhysical ? "رسوم الشحن" : "التسليم"}</span>
                  {!hasPhysical ? (
                    <span className="text-lime font-bold neon-text-lime">[ فوري ]</span>
                  ) : shipping === 0 ? (
                    <span className="text-lime font-bold neon-text-lime">[ مجاني ]</span>
                  ) : (
                    <span className="text-foreground font-medium">{formatPrice(shipping)}</span>
                  )}
                </div>
                
                {hasPhysical && shipping > 0 && (
                  <div className="bg-primary/10 border border-primary/30 clip-corner-sm p-3 text-sm flex gap-2 font-sans">
                    <Tag className="text-primary shrink-0 animate-pulse-glow" size={18} />
                    <p className="text-primary/90">
                      أضف منتجات بقيمة <span className="font-mono font-bold">{formatPrice(500 - physicalSubtotal)}</span> للحصول على شحن مجاني!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="neon-divider my-6"></div>
              
              <div className="mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg font-sans">الإجمالي الكلي</span>
                  <span className="text-3xl font-black text-secondary font-mono neon-text-magenta">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-2 text-left tracking-widest">INC. VAT</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setLocation("/checkout")}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 clip-corner font-bold py-4 transition-all flex items-center justify-center gap-2 glow-hover-magenta uppercase tracking-widest"
                >
                  الاستمرار للدفع
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground pt-4">
                  <ShieldCheck size={16} className="text-lime" />
                  <span>// SECURE_CONNECTION_ESTABLISHED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
