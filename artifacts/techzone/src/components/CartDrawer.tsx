import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const total = getTotalPrice();
  const freeShippingThreshold = 500;
  const progress = Math.min((total / freeShippingThreshold) * 100, 100);
  const amountNeeded = freeShippingThreshold - total;

  // Listen for custom event to open drawer
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-4 bg-primary text-primary-foreground rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-110 transition-transform lg:hidden"
      >
        <ShoppingCart size={24} />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
            {getTotalItems()}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-md bg-background border-r border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-primary" />
                  <h2 className="text-lg font-bold">سلة المشتريات ({getTotalItems()})</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-primary/5 border-b border-primary/20">
                <p className="text-sm font-medium text-center mb-2">
                  {amountNeeded > 0 
                    ? `أضف بقيمة ${formatPrice(amountNeeded)} للحصول على شحن مجاني!` 
                    : "🎉 مبروك! لقد حصلت على شحن مجاني"}
                </p>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${progress === 100 ? 'bg-green-500' : 'bg-primary'} shadow-[0_0_10px_currentColor]`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingCart size={64} className="mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">السلة فارغة</p>
                    <p className="text-sm text-muted-foreground mb-6">ابدأ بتسوق أحدث المنتجات</p>
                    <button 
                      onClick={() => { setIsOpen(false); setLocation("/categories"); }}
                      className="text-primary hover:underline font-medium"
                    >
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div 
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-4 bg-white/5 p-3 rounded-lg border border-white/5"
                      >
                        <div className="w-20 h-20 bg-black/20 rounded-md p-2 flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h4 className="text-sm font-semibold line-clamp-2 mb-1">{item.nameAr}</h4>
                          <span className="text-primary font-bold text-sm neon-text">{formatPrice(item.price)}</span>
                          
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3 bg-background rounded-full px-2 py-1 border border-white/10">
                              <button 
                                onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive/70 hover:text-destructive transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 bg-card border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">المجموع (بدون الشحن)</span>
                    <span className="text-xl font-bold text-primary neon-text">{formatPrice(total)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setIsOpen(false); setLocation("/cart"); }}
                      className="border border-primary text-primary hover:bg-primary/10 py-3 rounded-md font-bold transition-colors text-sm"
                    >
                      عرض السلة
                    </button>
                    <button 
                      onClick={handleCheckout}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-md font-bold transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center gap-2 text-sm"
                    >
                      إتمام الطلب
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
