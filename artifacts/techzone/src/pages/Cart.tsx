import { Layout } from "@/components/Layout";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const [, setLocation] = useLocation();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 500 ? 0 : 35;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-card border border-white/5 rounded-full flex items-center justify-center text-muted-foreground mb-8 relative">
            <ShoppingCart size={64} className="opacity-50" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute -top-2 -right-2 bg-destructive text-white p-2 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]"
            >
              <Trash2 size={20} />
            </motion.div>
          </div>
          <h1 className="text-3xl font-black mb-4">سلة المشتريات فارغة</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            يبدو أنك لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد. اكتشف أحدث منتجات الجيمنج والإلكترونيات.
          </p>
          <Link href="/categories" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-bold transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            بدء التسوق
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-card border-b border-white/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black neon-text text-primary">سلة المشتريات</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-card border border-white/5 rounded-xl overflow-hidden glass-panel">
              <div className="p-4 sm:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="font-bold text-lg">المنتجات ({items.length})</h2>
                <button 
                  onClick={clearCart}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={16} /> إفراغ السلة
                </button>
              </div>
              
              <div className="divide-y divide-white/5">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div 
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center"
                    >
                      <Link href={`/products/${item.productId}`} className="w-32 h-32 bg-white/5 rounded-lg p-2 flex items-center justify-center shrink-0 border border-white/10 hover:border-primary/50 transition-colors group">
                        <img src={item.image} alt={item.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform" />
                      </Link>
                      
                      <div className="flex-1 flex flex-col h-full text-center sm:text-right w-full">
                        <Link href={`/products/${item.productId}`} className="font-bold text-lg hover:text-primary transition-colors mb-2 line-clamp-2">
                          {item.nameAr}
                        </Link>
                        
                        <div className="text-primary font-black text-xl mb-4 sm:mb-auto">
                          {formatPrice(item.price)}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center bg-background border border-white/10 rounded-md shadow-inner">
                            <button 
                              onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity}
                              readOnly
                              className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold"
                            />
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-lg hidden sm:block">
                              الإجمالي: {formatPrice(item.price * item.quantity)}
                            </span>
                            <button 
                              onClick={() => removeItem(item.productId)}
                              className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} /> حذف
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
            <div className="bg-card border border-white/5 rounded-xl p-6 sticky top-24 glass-panel">
              <h2 className="font-bold text-xl mb-6 pb-4 border-b border-white/5">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>رسوم الشحن</span>
                  {shipping === 0 ? (
                    <span className="text-green-400 font-bold">مجاني</span>
                  ) : (
                    <span className="text-foreground font-medium">{formatPrice(shipping)}</span>
                  )}
                </div>
                
                {shipping > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-sm flex gap-2">
                    <Tag className="text-primary shrink-0" size={18} />
                    <p className="text-primary/90">
                      أضف منتجات بقيمة {formatPrice(500 - subtotal)} للحصول على شحن مجاني!
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-white/5 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">الإجمالي الكلي</span>
                  <span className="text-3xl font-black text-primary neon-text">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-left">شامل ضريبة القيمة المضافة</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setLocation("/checkout")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-bold py-4 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-[1.02]"
                >
                  الاستمرار للدفع
                  <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                  <ShieldCheck size={16} />
                  <span>دفع آمن ومعلومات مشفرة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
