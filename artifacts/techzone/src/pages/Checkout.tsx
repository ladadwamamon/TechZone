import { Layout } from "@/components/Layout";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useCreateOrder } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, ArrowRight, ShieldCheck, Truck, CheckCircle2 } from "lucide-react";
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
          <ShoppingCart size={64} className="opacity-50 mb-4" />
          <h1 className="text-3xl font-black mb-4">السلة فارغة</h1>
          <Link href="/categories" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-bold">
            تسوق الآن
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-card border-b border-white/5 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black neon-text text-primary">إتمام الطلب</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          
          {/* Checkout Form */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-card border border-white/5 rounded-xl p-6 glass-panel">
              <h2 className="text-xl font-bold mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                معلومات التوصيل
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                  <input 
                    {...register("customerName")}
                    className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="الاسم الثلاثي"
                  />
                  {errors.customerName && <p className="text-destructive text-sm mt-1">{errors.customerName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                  <input 
                    {...register("phone")}
                    dir="ltr"
                    className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none text-right"
                    placeholder="05X XXX XXXX"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">المدينة *</label>
                  <select 
                    {...register("city")}
                    className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none appearance-none"
                  >
                    <option value="">اختر المدينة</option>
                    <option value="ramallah">رام الله</option>
                    <option value="jerusalem">القدس</option>
                    <option value="hebron">الخليل</option>
                    <option value="nablus">نابلس</option>
                    <option value="jenin">جنين</option>
                    <option value="tulkarm">طولكرم</option>
                    <option value="bethlehem">الخليل</option>
                  </select>
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">البريد الإلكتروني (اختياري)</label>
                  <input 
                    {...register("email")}
                    dir="ltr"
                    className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none text-right"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">العنوان التفصيلي *</label>
                  <textarea 
                    {...register("address")}
                    rows={3}
                    className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none"
                    placeholder="اسم الشارع، البناية، رقم الشقة..."
                  />
                  {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            <div className="bg-card border border-white/5 rounded-xl p-6 glass-panel">
              <h2 className="text-xl font-bold mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                طريقة الدفع
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 border border-white/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <div className="pt-1">
                    <input type="radio" value="cash_on_delivery" {...register("paymentMethod")} className="w-4 h-4 text-primary bg-background border-white/20 focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2">الدفع عند الاستلام <Truck size={16} className="text-primary" /></div>
                    <div className="text-sm text-muted-foreground mt-1">ادفع نقداً عند استلام طلبك</div>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 border border-white/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 opacity-50">
                  <div className="pt-1">
                    <input type="radio" value="card" disabled {...register("paymentMethod")} className="w-4 h-4 text-primary bg-background border-white/20 focus:ring-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2">البطاقة الائتمانية (قريباً)</div>
                    <div className="text-sm text-muted-foreground mt-1">الدفع بواسطة فيزا أو ماستركارد</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="bg-card border border-white/5 rounded-xl p-6 glass-panel">
              <h2 className="text-xl font-bold mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">3</span>
                ملاحظات إضافية
              </h2>
              <textarea 
                {...register("notes")}
                rows={3}
                className="w-full bg-background border border-white/10 rounded-md px-4 py-3 focus:border-primary focus:outline-none"
                placeholder="أية ملاحظات إضافية حول التوصيل أو الطلب..."
              />
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-card border border-white/5 rounded-xl p-6 sticky top-24 glass-panel">
              <h2 className="font-bold text-xl mb-6 pb-4 border-b border-white/5">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-16 h-16 bg-white/5 rounded p-1 shrink-0">
                      <img src={item.image} alt={item.nameAr} className="w-full h-full object-contain mix-blend-screen" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold line-clamp-2">{item.nameAr}</h4>
                      <div className="text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</div>
                      <div className="text-sm font-bold text-primary neon-text mt-1">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 mb-6 border-t border-white/5 pt-4">
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
              </div>
              
              <div className="border-t border-white/5 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">الإجمالي الكلي</span>
                  <span className="text-3xl font-black text-primary neon-text">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-bold py-4 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      تأكيد الطلب
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
                  <ShieldCheck size={16} />
                  <span>دفع آمن ومعلومات مشفرة</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
