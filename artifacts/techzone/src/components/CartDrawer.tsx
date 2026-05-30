import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowLeft, Terminal } from "lucide-react";
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
        className="fixed bottom-6 left-6 z-40 p-4 bg-primary text-background clip-corner-lg shadow-[0_0_20px_var(--cyan)] hover:scale-110 transition-transform lg:hidden"
      >
        <ShoppingCart size={24} />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-mono font-bold w-6 h-6 clip-corner-sm flex items-center justify-center shadow-[0_0_10px_var(--magenta)]">
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
              className="fixed inset-0 bg-background/80 z-50 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-full max-w-md glass-panel border-r border-primary/30 z-50 flex flex-col shadow-[0_0_30px_var(--cyan)]"
            >
              <div className="p-4 border-b border-primary/20 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2 text-primary">
                  <Terminal size={18} className="animate-pulse" />
                  <h2 className="text-lg font-mono font-bold neon-text">{"//"} CART_SYSTEM ({getTotalItems()})</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-primary hover:text-secondary transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-background/50 border-b border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
                <p className="text-xs font-mono font-bold text-center mb-3 text-primary relative z-10">
                  {amountNeeded > 0 
                    ? `[ TARGET: ${formatPrice(amountNeeded)} TO FREE_SHIPPING ]` 
                    : "[ STATUS: FREE_SHIPPING_ACTIVATED ]"}
                </p>
                <div className="h-2 bg-background border border-primary/20 rounded-sm overflow-hidden clip-corner-sm relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${progress === 100 ? 'bg-lime shadow-[0_0_10px_var(--lime-raw)]' : 'bg-primary shadow-[0_0_10px_var(--cyan)]'}`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingCart size={64} className="mb-4 text-primary" />
                    <p className="text-lg font-bold text-primary neon-text">سلة المشتريات فارغة</p>
                    <p className="text-xs text-primary/70 mb-6 mt-2">ابدأ التسوق الآن وأضف منتجاتك</p>
                    <button 
                      onClick={() => { setIsOpen(false); setLocation("/categories"); }}
                      className="border border-primary text-primary px-4 py-2 clip-corner-sm hover:bg-primary/20 transition-all text-sm glow-hover"
                    >
                      {">"} تصفح المنتجات
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
                        className="flex gap-4 bg-background/40 p-3 clip-corner-sm border border-primary/20 hover:border-primary/50 transition-colors group"
                      >
                        <div className="w-20 h-20 bg-background/80 clip-corner-sm border border-primary/10 p-2 flex items-center justify-center shrink-0 hud-frame">
                          <img src={item.image} alt={item.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h4 className="text-sm font-sans font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{item.nameAr}</h4>
                          <span className="text-primary font-bold text-sm neon-text">{formatPrice(item.price)}</span>
                          
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-3 bg-background border border-primary/30 clip-corner-sm px-2 py-1">
                              <button 
                                onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
                                className="text-primary hover:text-secondary transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center text-primary">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="text-primary hover:text-secondary transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive/70 hover:text-destructive hover:shadow-[0_0_10px_var(--destructive)] transition-all p-1 border border-transparent hover:border-destructive clip-corner-sm"
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
                <div className="p-4 bg-primary/5 border-t border-primary/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-primary/70 font-mono text-sm">{"[ TOTAL_VALUE ]"}</span>
                    <span className="text-xl font-bold font-mono text-primary neon-text">{formatPrice(total)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setIsOpen(false); setLocation("/cart"); }}
                      className="border border-primary text-primary hover:bg-primary/20 py-3 clip-corner-sm font-mono font-bold transition-all text-sm glow-hover"
                    >
                      عرض السلة
                    </button>
                    <button 
                      onClick={handleCheckout}
                      className="bg-primary text-background hover:bg-primary/90 py-3 clip-corner-sm font-mono font-bold transition-all shadow-[0_0_15px_var(--cyan)] flex items-center justify-center gap-2 text-sm glow-hover"
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
