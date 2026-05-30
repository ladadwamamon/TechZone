import { Layout } from "@/components/Layout";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useCreateOrder } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ArrowRight, ShieldCheck, Truck, CheckCircle2, Terminal } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(9, "رقم الهاتف غير صالح"),
  city: z.string().min(2, "المدينة مطلوبة"),
  address: z.string().min(5, "العنوان التفصيلي مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "card", "bank_transfer"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createOrder = useCreateOrder();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 500 ? 0 : 35;
  const total = subtotal + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "cash_on_delivery"
    }
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast.error("السلة فارغة");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        items: items.map(item => ({
          productId: item.productId,
          nameAr: item.nameAr,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      };

      const response = await createOrder.mutateAsync({ data: orderData });
      
      clearCart();
      toast.success("تم تأكيد الطلب بنجاح");
      setLocation(`/order-success?id=${response.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الطلب");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="hud-corners p-8 glass-panel max-w-md w-full relative">
             <Terminal size={64} className="text-primary opacity-50 mb-4 mx-auto animate-pulse-glow" />
             <h1 className="text-3xl font-black mb-4 neon-text glitch" data-text="السلة فارغة">السلة فارغة</h1>
             <Link href="/categories" className="inline-block bg-primary text-primary-foreground px-8 py-3 clip-corner font-bold glow-hover uppercase">
               تسوق الآن
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
          <ShieldCheck className="text-primary w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-black neon-text text-primary glitch uppercase" data-text="إتمام الطلب">إتمام الطلب</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          
          {/* Checkout Form */}
          <div className="lg:w-2/3 space-y-8">
            <div className="glass-panel border-primary/20 p-6 hud-frame relative">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-primary/50">// STEP_01</div>
              <h2 className="text-xl font-bold mb-6 border-b border-primary/20 pb-4 flex items-center gap-3">
                <span className="w-8 h-8 clip-corner bg-primary/20 text-primary flex items-center justify-center font-mono font-bold border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]">1</span>
                معلومات التوصيل
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80">الاسم الكامل *</label>
                  <input 
                    {...register("customerName")}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                    placeholder="الاسم الثلاثي"
                  />
                  {errors.customerName && <p className="text-destructive text-sm mt-1 font-mono">{errors.customerName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80">رقم الهاتف *</label>
                  <input 
                    {...register("phone")}
                    dir="ltr"
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-right font-mono"
                    placeholder="05X XXX XXXX"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1 font-mono">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80">المدينة *</label>
                  <div className="relative">
                    <select 
                      {...register("city")}
                      className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground appearance-none"
                    >
                      <option value="" className="bg-background">اختر المدينة</option>
                      <option value="ramallah" className="bg-background">رام الله</option>
                      <option value="jerusalem" className="bg-background">القدس</option>
                      <option value="hebron" className="bg-background">الخليل</option>
                      <option value="nablus" className="bg-background">نابلس</option>
                      <option value="jenin" className="bg-background">جنين</option>
                      <option value="tulkarm" className="bg-background">طولكرم</option>
                      <option value="bethlehem" className="bg-background">بيت لحم</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none text-primary">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path></svg>
                    </div>
                  </div>
                  {errors.city && <p className="text-destructive text-sm mt-1 font-mono">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80">البريد الإلكتروني (اختياري)</label>
                  <input 
                    {...register("email")}
                    dir="ltr"
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-right font-mono"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1 font-mono">{errors.email.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80">العنوان التفصيلي *</label>
                  <textarea 
                    {...register("address")}
                    rows={3}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                    placeholder="اسم الشارع، البناية، رقم الشقة..."
                  />
                  {errors.address && <p className="text-destructive text-sm mt-1 font-mono">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            <div className="glass-panel border-primary/20 p-6 hud-frame relative">
               <div className="absolute top-2 left-4 text-[10px] font-mono text-primary/50">// STEP_02</div>
              <h2 className="text-xl font-bold mb-6 border-b border-primary/20 pb-4 flex items-center gap-3">
                <span className="w-8 h-8 clip-corner bg-primary/20 text-primary flex items-center justify-center font-mono font-bold border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]">2</span>
                طريقة الدفع
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 border border-primary/20 clip-corner-sm cursor-pointer hover:border-primary/80 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:shadow-[0_0_15px_rgba(0,255,255,0.2)] group relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="pt-1 relative z-10">
                    <input type="radio" value="cash_on_delivery" {...register("paymentMethod")} className="w-4 h-4 text-primary bg-background border-primary/50 focus:ring-primary/50 focus:ring-offset-background" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="font-bold flex items-center gap-2 text-primary neon-text">الدفع عند الاستلام <Truck size={18} className="text-primary" /></div>
                    <div className="text-sm text-muted-foreground mt-1 font-mono">// PAY_ON_DELIVERY</div>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 border border-white/10 clip-corner-sm cursor-not-allowed opacity-50 relative overflow-hidden">
                  <div className="pt-1 relative z-10">
                    <input type="radio" value="card" disabled {...register("paymentMethod")} className="w-4 h-4 text-primary bg-background border-white/20" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="font-bold flex items-center gap-2">البطاقة الائتمانية <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-sm font-mono">[ LOCKED ]</span></div>
                    <div className="text-sm text-muted-foreground mt-1 font-mono">// CREDIT_CARD_UNAVAILABLE</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="glass-panel border-primary/20 p-6 hud-frame relative">
               <div className="absolute top-2 left-4 text-[10px] font-mono text-primary/50">// STEP_03</div>
              <h2 className="text-xl font-bold mb-6 border-b border-primary/20 pb-4 flex items-center gap-3">
                <span className="w-8 h-8 clip-corner bg-primary/20 text-primary flex items-center justify-center font-mono font-bold border border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.3)]">3</span>
                ملاحظات إضافية
              </h2>
              <textarea 
                {...register("notes")}
                rows={3}
                className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                placeholder="أية ملاحظات إضافية حول التوصيل أو الطلب..."
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="glass-panel border-secondary/30 hud-frame-magenta p-6 sticky top-24">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-secondary/70 tracking-widest">// CHECKOUT_SYS</div>
              <h2 className="font-bold text-xl mb-6 pb-4 border-b border-secondary/20 flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary animate-pulse-glow"></span>
                ملخص الطلب
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 hover:bg-secondary/5 p-2 transition-colors rounded-sm border border-transparent hover:border-secondary/20">
                    <div className="w-16 h-16 bg-background/50 border border-secondary/20 clip-corner-sm p-1 shrink-0 relative overflow-hidden">
                      <img src={item.image} alt={item.nameAr} className="w-full h-full object-contain mix-blend-screen relative z-10" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold line-clamp-2">{item.nameAr}</h4>
                      <div className="text-xs font-mono text-muted-foreground mt-1">QTY: <span className="text-foreground">{item.quantity}</span></div>
                      <div className="text-sm font-bold font-mono text-secondary neon-text-magenta mt-1">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="neon-divider my-4"></div>
              
              <div className="space-y-4 mb-6 font-mono text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>رسوم الشحن</span>
                  {shipping === 0 ? (
                    <span className="text-lime font-bold neon-text-lime">[ مجاني ]</span>
                  ) : (
                    <span className="text-foreground font-medium">{formatPrice(shipping)}</span>
                  )}
                </div>
              </div>
              
              <div className="neon-divider my-4"></div>
              
              <div className="mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg font-sans">الإجمالي الكلي</span>
                  <span className="text-3xl font-black text-secondary font-mono neon-text-magenta">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 clip-corner font-bold py-4 transition-all flex items-center justify-center gap-2 glow-hover-magenta disabled:opacity-50 disabled:shadow-none uppercase tracking-widest"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      تأكيد الطلب
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-lime pt-4">
                  <ShieldCheck size={14} />
                  <span>// TRANSACTION_SECURED</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
