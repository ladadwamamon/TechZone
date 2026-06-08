import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Package,
  LogOut,
  Terminal,
  Save,
  ShoppingBag,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import {
  useCustomerOrders,
  useCustomerUpdateProfile,
  getCustomerMeQueryKey,
  getCustomerOrdersQueryKey,
} from "@workspace/api-client-react";
import { useCustomerAuth } from "@/lib/customerAuth";
import { formatPrice } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

function AccountCodeRow({ nameAr, secret }: { nameAr: string; secret: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("تم نسخ الكود");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  return (
    <div className="bg-background/60 border border-lime/30 clip-corner-sm p-3">
      <div className="text-[10px] font-mono text-lime/70 mb-2 uppercase tracking-widest truncate">{nameAr}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="shrink-0 w-8 h-8 flex items-center justify-center border border-lime/40 text-lime hover:bg-lime/10 clip-corner-sm transition-colors"
          aria-label="نسخ الكود"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <div className="flex-1 font-mono font-bold text-sm tracking-widest text-lime neon-text-lime break-all select-all text-left">
          {secret}
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { customer, isLoading, isAuthenticated, logout } = useCustomerAuth();

  const { data: orders, isLoading: ordersLoading } = useCustomerOrders({
    query: { queryKey: getCustomerOrdersQueryKey(), enabled: isAuthenticated },
  });

  const updateProfile = useCustomerUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName,
        phone: customer.phone ?? "",
        city: customer.city ?? "",
        address: customer.address ?? "",
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        data: {
          fullName: data.fullName,
          phone: data.phone || null,
          city: data.city || null,
          address: data.address || null,
        },
      });
      await queryClient.invalidateQueries({ queryKey: getCustomerMeQueryKey() });
      toast.success("تم تحديث بياناتك بنجاح");
    } catch {
      toast.error("تعذر تحديث البيانات");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("تم تسجيل الخروج");
      setLocation("/");
    } catch {
      toast.error("تعذر تسجيل الخروج");
    }
  };

  if (isLoading || !customer) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 border border-primary/30 clip-corner flex items-center justify-center text-primary hud-frame">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black neon-text text-primary uppercase">{customer.fullName}</h1>
              <p className="text-muted-foreground font-mono text-xs mt-1" dir="ltr">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground clip-corner px-5 py-2.5 font-bold font-mono uppercase text-sm transition-colors"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Edit */}
          <div className="lg:w-1/3">
            <div className="glass-panel border-primary/20 hud-frame p-6 relative sticky top-24">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-primary/50">// PROFILE_DATA</div>
              <h2 className="text-xl font-bold mb-6 border-b border-primary/20 pb-4 flex items-center gap-2 pt-2">
                <User size={20} className="text-primary" />
                البيانات الشخصية
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase">الاسم الكامل</label>
                  <input
                    {...register("fullName")}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                  />
                  {errors.fullName && <p className="text-destructive text-sm mt-1 font-mono">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase">رقم الهاتف</label>
                  <input
                    {...register("phone")}
                    dir="ltr"
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-right font-mono"
                    placeholder="05X XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase">المدينة</label>
                  <input
                    {...register("city")}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase">العنوان</label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 transition-all flex items-center justify-center gap-2 glow-hover disabled:opacity-50 disabled:shadow-none uppercase tracking-wide font-mono text-sm"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} />
                      حفظ التغييرات
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order History */}
          <div className="lg:w-2/3">
            <div className="glass-panel border-secondary/30 hud-frame-magenta p-6 relative">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-secondary/60">// ORDER_HISTORY</div>
              <h2 className="text-xl font-bold mb-6 border-b border-secondary/20 pb-4 flex items-center gap-2 pt-2">
                <Package size={20} className="text-secondary" />
                سجل الطلبات
              </h2>

              {ordersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-secondary/5 border border-secondary/10 clip-corner animate-pulse" />
                  ))}
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <ShoppingBag size={48} className="text-secondary/30 mb-4" />
                  <p className="font-mono text-muted-foreground uppercase mb-6">{"//"} لا توجد طلبات بعد</p>
                  <Link
                    href="/categories"
                    className="bg-secondary/10 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground clip-corner font-bold py-3 px-6 transition-all uppercase text-sm font-mono"
                  >
                    [ ابدأ التسوق ]
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-background/40 border border-secondary/20 clip-corner p-4 hover:border-secondary/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-secondary/10">
                        <div className="flex items-center gap-2 font-mono text-sm">
                          <Terminal size={14} className="text-secondary" />
                          <span className="text-secondary font-bold break-all">{order.id}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("ar-EG-u-nu-latn")}
                          </span>
                          <span className="font-mono text-xs font-bold bg-primary/10 border border-primary/30 text-primary px-2 py-1 clip-corner-sm uppercase">
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {order.items.slice(0, 4).map((item) => (
                          <div
                            key={item.productId}
                            className="w-12 h-12 bg-background/60 border border-secondary/20 clip-corner-sm p-1 shrink-0"
                            title={item.nameAr}
                          >
                            <img src={item.image} alt={item.nameAr} className="w-full h-full object-contain mix-blend-screen" />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <span className="font-mono text-xs text-muted-foreground">+{order.items.length - 4}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between font-mono text-sm">
                        <span className="text-muted-foreground">
                          {order.items.reduce((n, i) => n + i.quantity, 0)} منتج
                        </span>
                        <span className="font-bold text-secondary neon-text-magenta">{formatPrice(order.total)}</span>
                      </div>

                      {order.deliveredCodes && order.deliveredCodes.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-lime/20">
                          <div className="flex items-center gap-2 mb-2 font-mono">
                            <KeyRound size={14} className="text-lime" />
                            <span className="text-xs text-lime font-bold uppercase tracking-widest neon-text-lime">الأكواد الرقمية</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.deliveredCodes.map((code, idx) => (
                              <AccountCodeRow key={`${code.productId}-${idx}`} nameAr={code.nameAr} secret={code.secret} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
