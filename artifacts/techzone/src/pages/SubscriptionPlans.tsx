import { Layout } from "@/components/Layout";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Crown, Zap } from "lucide-react";

export default function SubscriptionPlansPage() {
  const { data, isLoading } = useListProducts({ category: "subscriptions", limit: 100 });
  const products = data?.products ?? [];

  return (
    <Layout>
      <div className="border-b border-primary/20 py-10 relative overflow-hidden glass-panel">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
              <Crown className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-black neon-text">الاشتراكات الرقمية</h1>
              <p className="text-muted-foreground text-sm mt-1">
                اشتراكات PS Plus و Xbox Game Pass و حسابات الألعاب — أكواد رسمية بتسليم فوري
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-lime border border-lime/30 bg-lime/5 px-3 py-1.5 rounded">
            <Zap className="w-3.5 h-3.5" />
            تسليم فوري — يظهر الكود مباشرة بعد إتمام الطلب
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
            <Crown className="w-16 h-16 opacity-20" />
            <p>لا توجد اشتراكات متاحة حالياً</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
