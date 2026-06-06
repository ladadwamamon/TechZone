import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Terminal, Lock, Mail, User, Phone } from "lucide-react";
import { useCustomerAuth } from "@/lib/customerAuth";

const registerSchema = z.object({
  fullName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { register: registerCustomer, isAuthenticated } = useCustomerAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/account");
    }
  }, [isAuthenticated, setLocation]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerCustomer({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
      });
      toast.success("تم إنشاء الحساب بنجاح");
      setLocation("/account");
    } catch {
      toast.error("تعذر إنشاء الحساب، قد يكون البريد مستخدماً مسبقاً");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md glass-panel border-secondary/30 hud-frame-magenta clip-corner-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50" />
          <div className="absolute top-2 left-4 text-[10px] font-mono text-secondary/60">// REGISTER_TERMINAL</div>

          <div className="text-center mb-8 pt-4">
            <div className="w-16 h-16 bg-secondary/10 border border-secondary/30 clip-corner mx-auto flex items-center justify-center text-secondary mb-4 neon-border-magenta">
              <UserPlus size={32} />
            </div>
            <h1 className="text-3xl font-black neon-text-magenta text-secondary glitch uppercase" data-text="إنشاء حساب">
              إنشاء حساب
            </h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs uppercase">{"//"} NEW_USER_REGISTRATION</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-secondary/80 uppercase flex items-center gap-2">
                <User size={14} /> الاسم الكامل
              </label>
              <input
                {...register("fullName")}
                className="w-full bg-background/50 border border-secondary/30 clip-corner-sm px-4 py-3 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all text-foreground"
                placeholder="الاسم الثلاثي"
              />
              {errors.fullName && <p className="text-destructive text-sm mt-1 font-mono">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-secondary/80 uppercase flex items-center gap-2">
                <Mail size={14} /> البريد الإلكتروني
              </label>
              <input
                {...register("email")}
                dir="ltr"
                className="w-full bg-background/50 border border-secondary/30 clip-corner-sm px-4 py-3 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all text-foreground text-right font-mono"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-secondary/80 uppercase flex items-center gap-2">
                <Phone size={14} /> رقم الهاتف (اختياري)
              </label>
              <input
                {...register("phone")}
                dir="ltr"
                className="w-full bg-background/50 border border-secondary/30 clip-corner-sm px-4 py-3 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all text-foreground text-right font-mono"
                placeholder="05X XXX XXXX"
              />
              {errors.phone && <p className="text-destructive text-sm mt-1 font-mono">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-secondary/80 uppercase flex items-center gap-2">
                <Lock size={14} /> كلمة المرور
              </label>
              <input
                {...register("password")}
                type="password"
                dir="ltr"
                className="w-full bg-background/50 border border-secondary/30 clip-corner-sm px-4 py-3 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50 transition-all text-foreground text-right font-mono"
                placeholder="********"
              />
              {errors.password && <p className="text-destructive text-sm mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 clip-corner font-bold py-3 transition-all flex items-center justify-center gap-2 glow-hover-magenta disabled:opacity-50 disabled:shadow-none uppercase tracking-widest font-mono"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal size={18} />
                  تسجيل
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-secondary/20 text-center font-mono text-sm">
            <span className="text-muted-foreground">// لديك حساب بالفعل؟ </span>
            <Link href="/login" className="text-secondary hover:text-primary transition-colors font-bold uppercase">
              [ تسجيل الدخول ]
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
