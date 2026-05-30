import { useAdminAnalyticsOverview, getAdminAnalyticsOverviewQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading } = useAdminAnalyticsOverview({
    query: { queryKey: getAdminAnalyticsOverviewQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text">نظرة عامة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-panel border-primary/20">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24 bg-primary/20" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16 bg-primary/20" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "إجمالي الإيرادات", value: `${data.totalRevenue} ريال`, icon: DollarSign, color: "text-lime neon-text-lime" },
    { label: "إجمالي الطلبات", value: data.totalOrders, icon: ShoppingCart, color: "text-primary neon-text" },
    { label: "المنتجات", value: data.totalProducts, icon: Package, color: "text-secondary neon-text-magenta" },
    { label: "المشتركين", value: data.totalSubscribers, icon: Users, color: "text-primary neon-text" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text">لوحة القيادة</h1>
        <div className="flex items-center gap-2 text-sm text-lime neon-text-lime bg-lime/10 px-3 py-1 rounded-full clip-corner-sm border border-lime/20">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>مباشر</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-panel border-primary/20 hover:border-primary/50 transition-colors hud-corners">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[0]}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* More sections can be added here for charts, recent orders, etc. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {data.recentOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 rounded bg-background/50 border border-primary/10">
                    <div>
                      <div className="font-mono text-primary">#{order.id.substring(0,8)}</div>
                      <div className="text-sm text-muted-foreground">{order.customerName}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold">{order.total} ريال</div>
                      <div className="text-xs">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">لا توجد طلبات حديثة</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ordersByStatus.map(status => (
                <div key={status.status} className="flex items-center justify-between p-2">
                  <span className="capitalize">{status.status.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
