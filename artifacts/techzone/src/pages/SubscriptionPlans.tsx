import { Layout } from "@/components/Layout";
import { useListSubscriptionPlans, useCreateCustomerSubscription, useCustomerSubscriptions } from "@workspace/api-client-react";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, Crown, Zap, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function SubscriptionPlansPage() {
  const { data: plans, isLoading } = useListSubscriptionPlans({
    query: { queryKey: ["subscription-plans"] },
  });
  const { customer } = useCustomerAuth();
  const { data: mySubs } = useCustomerSubscriptions({
    query: { queryKey: ["customer-subscriptions"], enabled: !!customer },
  });
  const { toast } = useToast();
  const createSub = useCreateCustomerSubscription();

  const handleSubscribe = async (planId: string) => {
    if (!customer) {
      toast({ title: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }
    try {
      await createSub.mutateAsync({ data: { planId } });
      toast({ title: "تم الاشتراك بنجاح" });
    } catch {
      toast({ title: "فشل في الاشتراك", variant: "destructive" });
    }
  };

  const hasActiveSub = (planId: string) => {
    return mySubs?.some((s) => s.planId === planId && s.status === "active") ?? false;
  };

  const periodLabel = (p: string) => {
    switch (p) {
      case "monthly": return "شهري";
      case "quarterly": return "ربع سنوي";
      case "yearly": return "سنوي";
      default: return p;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 neon-text">خطط الاشتراك</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            اشترك في أحد خطط نيكسس للحصول على مميزات حصرية وتوصيلات بدون تاخر
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <Card
                key={plan.id}
                className={`border-primary/10 relative overflow-hidden ${
                  idx === 1 ? "border-primary/30 ring-1 ring-primary/20" : ""
                }`}
              >
                {idx === 1 && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 clip-corner">
                    الأكثر شعبية
                  </div>
                )}
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">{plan.nameAr}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{plan.nameEn}</p>
                  </div>

                  <div className="text-center">
                    <span className="text-4xl font-black neon-text">{plan.price}</span>
                    <span className="text-muted-foreground text-sm mr-1"> ₪</span>
                    <span className="text-muted-foreground text-sm">/ {periodLabel(plan.period)}</span>
                  </div>

                  <div className="space-y-3">
                    {plan.features?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-lime shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {hasActiveSub(plan.id) ? (
                    <div className="flex items-center justify-center gap-2 text-lime text-sm font-bold border border-lime/20 rounded p-2">
                      <Check className="w-4 h-4" />
                      <span>مشترك حالياً</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={createSub.isPending}
                    >
                      {createSub.isPending ? "جاري..." : "اشترك الآن"}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto opacity-20 mb-4" />
            <p>لا توجد خطط اشتراك متاحة حالياً</p>
          </div>
        )}

        {!customer && (
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              يجب تسجيل الدخول للاشتراك في الخطط
            </p>
            <Link href="/login">
              <Button variant="outline" className="border-primary/20">
                <Zap className="w-4 h-4 mr-2" />
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        )}

        {mySubs && mySubs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              اشتراكاتي
            </h2>
            <div className="space-y-3">
              {mySubs.map((sub) => (
                <Card key={sub.id} className="border-primary/10">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">الخطة:</p>
                      <p className="text-muted-foreground text-sm">الحالة:
                        <span className={`mr-1 font-bold ${sub.status === "active" ? "text-lime" : "text-muted-foreground"}`}>
                          {sub.status === "active" ? "فعّال" : sub.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-left text-sm text-muted-foreground">
                      {sub.expiresAt && (
                        <p>تنتهي: {new Date(sub.expiresAt).toLocaleDateString("ar-PS")}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
