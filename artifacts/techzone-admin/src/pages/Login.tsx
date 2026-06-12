import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { firstAccessiblePath } from "@/lib/access";
import { useAdminLogin, useSetupFirstAdmin, getGetCurrentAdminQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const setupSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export default function Login() {
  const [isSetup, setIsSetup] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loginMutation = useAdminLogin();
  const setupMutation = useSetupFirstAdmin();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation(firstAccessiblePath(hasPermission) ?? "/");
    }
  }, [isAuthenticated, hasPermission, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const setupForm = useForm<z.infer<typeof setupSchema>>({
    resolver: zodResolver(setupSchema),
    defaultValues: { username: "", fullName: "", email: "", password: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentAdminQueryKey() });
        toast({ title: "تم تسجيل الدخول بنجاح" });
      },
      onError: (err: any) => {
        toast({ 
          title: "فشل تسجيل الدخول", 
          description: err.message || "بيانات الاعتماد غير صحيحة", 
          variant: "destructive" 
        });
      }
    });
  };

  const onSetup = (data: z.infer<typeof setupSchema>) => {
    setupMutation.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCurrentAdminQueryKey() });
        toast({ title: "تم إعداد الحساب بنجاح" });
      },
      onError: (err: any) => {
        if (err.status === 403 || err.message?.includes("already exists")) {
          toast({ 
            title: "تنبيه", 
            description: "يوجد مسؤول بالفعل، يرجى تسجيل الدخول", 
          });
          setIsSetup(false);
        } else {
          toast({ 
            title: "فشل الإعداد", 
            description: err.message || "حدث خطأ غير متوقع", 
            variant: "destructive" 
          });
        }
      }
    });
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background cyber-grid relative p-4">
        <div className="absolute inset-0 vignette pointer-events-none z-0" />
        <div className="relative z-10 font-mono text-primary neon-text animate-pulse tracking-widest">
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid relative p-4">
      <div className="absolute inset-0 vignette pointer-events-none z-0" />
      
      <div className="w-full max-w-md relative z-10 hud-corners">
        <Card className="glass-panel border-primary/20 bg-background/80 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="font-mono font-bold text-4xl tracking-wider text-primary neon-text glitch mx-auto" data-text="NEXUS">
              NEXUS
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSetup ? "إعداد النظام" : "تسجيل الدخول"}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm font-mono">
              {isSetup ? "قم بإنشاء حساب المسؤول الأول" : "أدخل بيانات الاعتماد للوصول للوحة التحكم"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSetup ? (
              <Form {...setupForm}>
                <form onSubmit={setupForm.handleSubmit(onSetup)} className="space-y-4">
                  <FormField
                    control={setupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="username" className="bg-background/50 focus-visible:ring-primary/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="name" className="bg-background/50 focus-visible:ring-primary/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني (اختياري)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" autoComplete="email" className="bg-background/50 focus-visible:ring-primary/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={setupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="new-password" className="bg-background/50 focus-visible:ring-primary/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6 glow-hover clip-corner-sm" disabled={setupMutation.isPending}>
                    {setupMutation.isPending ? "جاري الإعداد..." : "إنشاء حساب"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="username" className="bg-background/50 focus-visible:ring-primary/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" autoComplete="current-password" className="bg-background/50 focus-visible:ring-primary/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-6 glow-hover clip-corner-sm" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "جاري التحقق..." : "دخول"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={() => setIsSetup(!isSetup)}
              >
                {isSetup ? "لدي حساب بالفعل؟ تسجيل الدخول" : "إعداد النظام لأول مرة؟"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
