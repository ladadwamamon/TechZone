import { formatPrice } from "@/lib/utils";
import {
  useAdminAnalyticsOverview,
  getAdminAnalyticsOverviewQueryKey,
  useAdminAnalyticsSalesOverTime,
  getAdminAnalyticsSalesOverTimeQueryKey,
  useAdminAnalyticsTopProducts,
  getAdminAnalyticsTopProductsQueryKey,
  useAdminAnalyticsLowStock,
  getAdminAnalyticsLowStockQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const NEON = {
  cyan: "#22d3ee",
  magenta: "#e879f9",
  lime: "#a3e635",
  amber: "#fbbf24",
  red: "#f87171",
  blue: "#60a5fa",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  refunded: "مسترد",
};

const PIE_COLORS = [NEON.cyan, NEON.magenta, NEON.lime, NEON.amber, NEON.blue, NEON.red];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="glass-panel border border-primary/30 rounded px-3 py-2 text-xs font-mono">
      {label ? <div className="text-primary mb-1">{label}</div> : null}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useAdminAnalyticsOverview({
    query: { queryKey: getAdminAnalyticsOverviewQueryKey() },
  });

  const salesParams = { days: 30 };
  const { data: salesData } = useAdminAnalyticsSalesOverTime(salesParams, {
    query: { queryKey: getAdminAnalyticsSalesOverTimeQueryKey(salesParams) },
  });

  const topParams = { limit: 5 };
  const { data: topProducts } = useAdminAnalyticsTopProducts(topParams, {
    query: { queryKey: getAdminAnalyticsTopProductsQueryKey(topParams) },
  });

  const lowStockParams = { threshold: 5 };
  const { data: lowStock } = useAdminAnalyticsLowStock(lowStockParams, {
    query: { queryKey: getAdminAnalyticsLowStockQueryKey(lowStockParams) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text">لوحة القيادة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-panel border-primary/20">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-primary/20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-primary/20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-72 w-full bg-primary/10" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "إجمالي الإيرادات", value: formatPrice(data.totalRevenue), icon: DollarSign, color: "text-lime neon-text-lime" },
    { label: "إجمالي الطلبات", value: data.totalOrders, icon: ShoppingCart, color: "text-primary neon-text" },
    { label: "المنتجات", value: data.totalProducts, icon: Package, color: "text-secondary neon-text-magenta" },
    { label: "المشتركين", value: data.totalSubscribers, icon: Users, color: "text-primary neon-text" },
  ];

  const sales = (salesData ?? []).map((p) => ({
    ...p,
    label: p.date.slice(5),
  }));

  const statusPie = (data.ordersByStatus ?? []).map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
  }));

  const maxQty = Math.max(1, ...((topProducts ?? []).map((p) => p.quantitySold)));

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
          <Card
            key={i}
            className="glass-panel border-primary/20 hover:border-primary/50 transition-colors hud-corners"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color.split(" ")[0]}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            المبيعات والطلبات (آخر 30 يوماً)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON.cyan} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={NEON.cyan} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={NEON.magenta} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={NEON.magenta} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,211,252,0.1)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} reversed />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="الإيرادات"
                    stroke={NEON.cyan}
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="الطلبات"
                    stroke={NEON.magenta}
                    strokeWidth={2}
                    fill="url(#ordGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              لا توجد بيانات مبيعات بعد
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {statusPie.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {statusPie.map((_, i) => (
                        <Cell key={i} stroke="transparent" fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">لا توجد طلبات بعد</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-lime" />
              الأكثر مبيعاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.nameAr}
                        className="w-9 h-9 object-cover rounded border border-primary/20 bg-background/50"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded border border-primary/20 bg-background/50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.nameAr}</div>
                      <div className="h-1.5 mt-1 rounded-full bg-primary/10 overflow-hidden">
                        <div
                          className="h-full bg-lime/70"
                          style={{ width: `${(p.quantitySold / maxQty) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="font-mono text-sm text-lime">{p.quantitySold}</div>
                      <div className="text-xs text-muted-foreground font-mono">{formatPrice(p.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                لا توجد مبيعات بعد
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: NEON.amber }} />
              مخزون منخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-2">
                {lowStock.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded bg-background/50 border border-primary/10"
                  >
                    <img
                      src={p.image}
                      alt={p.nameAr}
                      className="w-8 h-8 object-cover rounded border border-primary/20"
                    />
                    <div className="flex-1 min-w-0 text-sm font-medium truncate">{p.nameAr}</div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono"
                      style={
                        p.stock === 0
                          ? { color: NEON.red, backgroundColor: "rgba(248,113,113,0.15)" }
                          : { color: NEON.amber, backgroundColor: "rgba(251,191,36,0.15)" }
                      }
                    >
                      {p.stock} قطعة
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                لا توجد منتجات بمخزون منخفض
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle>أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 rounded bg-background/50 border border-primary/10"
                  >
                    <div>
                      <div className="font-mono text-primary">#{order.id.substring(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">{order.customerName}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold font-mono">{formatPrice(order.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground">
                لا توجد طلبات حديثة
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
