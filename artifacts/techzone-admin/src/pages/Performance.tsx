import {
  useAdminSystemHealth,
  getAdminSystemHealthQueryKey,
  useAdminWebVitalsSummary,
  getAdminWebVitalsSummaryQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Cpu, AlertTriangle, Clock, Server, Gauge } from "lucide-react";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d} يوم`);
  if (h > 0) parts.push(`${h} ساعة`);
  parts.push(`${m} دقيقة`);
  return parts.join(" ");
}

const VITALS_META: Record<string, { label: string; unit: string; good: number; poor: number }> = {
  LCP: { label: "أكبر عنصر مرئي (LCP)", unit: "ms", good: 2500, poor: 4000 },
  INP: { label: "التفاعل حتى الرسم (INP)", unit: "ms", good: 200, poor: 500 },
  CLS: { label: "إزاحة التخطيط (CLS)", unit: "", good: 0.1, poor: 0.25 },
  FCP: { label: "أول رسم للمحتوى (FCP)", unit: "ms", good: 1800, poor: 3000 },
  TTFB: { label: "وقت أول بايت (TTFB)", unit: "ms", good: 800, poor: 1800 },
};

function vitalColor(metric: string, value: number): string {
  const meta = VITALS_META[metric];
  if (!meta) return "text-foreground";
  if (value <= meta.good) return "text-lime";
  if (value <= meta.poor) return "text-yellow-400";
  return "text-destructive";
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card className="glass-panel border-primary/20 hud-frame">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-bold font-mono text-foreground">{value}</div>
          {sub && <div className="text-xs text-muted-foreground font-mono">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Performance() {
  const { data: health, isLoading: healthLoading } = useAdminSystemHealth({
    query: { queryKey: getAdminSystemHealthQueryKey(), refetchInterval: 10000 },
  });

  const { data: vitals, isLoading: vitalsLoading } = useAdminWebVitalsSummary(
    { days: 7 },
    { query: { queryKey: getAdminWebVitalsSummaryQueryKey({ days: 7 }), refetchInterval: 30000 } },
  );

  const heapPct = health
    ? Math.min(100, Math.round((health.memory.heapUsedMb / Math.max(1, health.memory.heapTotalMb)) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Activity className="w-8 h-8" />
          الأداء والمراقبة
        </h1>
        {health && (
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            مباشر
          </span>
        )}
      </div>

      {healthLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full bg-primary/20" />)}
        </div>
      ) : health ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Clock} label="مدة التشغيل" value={formatUptime(health.uptimeSeconds)} />
          <StatCard icon={Server} label="عدد الطلبات" value={health.requestCount.toLocaleString("en-US")} />
          <StatCard
            icon={AlertTriangle}
            label="أخطاء الخادم"
            value={health.errorCount.toLocaleString("en-US")}
            sub={`Node ${health.nodeVersion}`}
          />
          <StatCard
            icon={Cpu}
            label="استهلاك الذاكرة"
            value={`${health.memory.heapUsedMb} MB`}
            sub={`من ${health.memory.heapTotalMb} MB (${heapPct}%)`}
          />
        </div>
      ) : null}

      {health && (
        <Card className="glass-panel border-primary/20 hud-frame">
          <CardHeader>
            <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              الذاكرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${heapPct}%` }} />
            </div>
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>Heap: {health.memory.heapUsedMb} / {health.memory.heapTotalMb} MB</span>
              <span>RSS: {health.memory.rssMb} MB</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            مؤشرات الويب الحيوية (آخر 7 أيام)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vitalsLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full bg-primary/20" />)}
            </div>
          ) : vitals && vitals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {vitals.map((v) => {
                const meta = VITALS_META[v.metric];
                return (
                  <div key={v.metric} className="border border-primary/20 rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">{meta?.label ?? v.metric}</div>
                    <div className={`text-2xl font-bold font-mono ${vitalColor(v.metric, v.p75)}`}>
                      {v.p75}
                      {meta?.unit && <span className="text-xs mr-1">{meta.unit}</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-1">
                      المتوسط: {v.avg} · العينات: {v.count.toLocaleString("en-US")}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              لا توجد بيانات بعد. تُجمع المؤشرات تلقائياً من زيارات المتجر.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            آخر أخطاء الخادم
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {health && health.recentErrors.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الوقت</TableHead>
                    <TableHead className="text-right">الطريقة</TableHead>
                    <TableHead className="text-right">المسار</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {health.recentErrors.map((e, i) => (
                    <TableRow key={i} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-mono text-xs" dir="ltr">
                        {new Date(e.time).toLocaleString("ar-EG-u-nu-latn", { dateStyle: "short", timeStyle: "medium" })}
                      </TableCell>
                      <TableCell className="font-mono text-xs" dir="ltr">{e.method}</TableCell>
                      <TableCell className="font-mono text-xs" dir="ltr">{e.path}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded text-xs bg-destructive/10 text-destructive">{e.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">لا توجد أخطاء مسجلة</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
