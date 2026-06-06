import { Layout } from "@/components/Layout";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogIn, Terminal, Lock, Mail } from "lucide-react";
import { useCustomerAuth } from "@/lib/customerAuth";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useCustomerAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/account");
    }
  }, [isAuthenticated, setLocation]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      toast.success("تم تسجيل الدخول بنجاح");
      setLocation("/account");
    } catch {
      toast.error("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md glass-panel border-primary/30 hud-frame clip-corner-lg p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="absolute top-2 left-4 text-[10px] font-mono text-primary/50">// AUTH_TERMINAL</div>

          <div className="text-center mb-8 pt-4">
            <div className="w-16 h-16 bg-primary/10 border border-primary/30 clip-corner mx-auto flex items-center justify-center text-primary mb-4 neon-border">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-black neon-text text-primary glitch uppercase" data-text="تسجيل الدخول">
              تسجيل الدخول
            </h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs uppercase">{"//"} CUSTOMER_ACCESS</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase flex items-center gap-2">
                <Mail size={14} /> البريد الإلكتروني
              </label>
              <input
                {...register("email")}
                dir="ltr"
                className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-right font-mono"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1 font-mono">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 font-mono text-primary/80 uppercase flex items-center gap-2">
                <Lock size={14} /> كلمة المرور
              </label>
              <input
                {...register("password")}
                type="password"
                dir="ltr"
                className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-foreground text-right font-mono"
                placeholder="********"
              />
              {errors.password && <p className="text-destructive text-sm mt-1 font-mono">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 transition-all flex items-center justify-center gap-2 glow-hover disabled:opacity-50 disabled:shadow-none uppercase tracking-widest font-mono"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Terminal size={18} />
                  دخول
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary/20 text-center font-mono text-sm">
            <span className="text-muted-foreground">// ليس لديك حساب؟ </span>
            <Link href="/register" className="text-primary hover:text-secondary transition-colors font-bold uppercase">
              [ إنشاء حساب ]
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
