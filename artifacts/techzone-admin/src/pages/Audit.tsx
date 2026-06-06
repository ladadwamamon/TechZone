import { useState, useEffect, useMemo } from "react";
import { useAdminListAuditLog, getAdminListAuditLogQueryKey } from "@workspace/api-client-react";
import type { AdminListAuditLogParams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search } from "lucide-react";
import { format } from "date-fns";

export default function Audit() {
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const [entityType, setEntityType] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: allLogs } = useAdminListAuditLog(
    { limit: 200 },
    { query: { queryKey: getAdminListAuditLogQueryKey({ limit: 200 }) } },
  );

  const actionOptions = useMemo(
    () => Array.from(new Set((allLogs ?? []).map((l) => l.action))).sort(),
    [allLogs],
  );
  const entityTypeOptions = useMemo(
    () => Array.from(new Set((allLogs ?? []).map((l) => l.entityType))).sort(),
    [allLogs],
  );

  const params: AdminListAuditLogParams = {
    limit: 100,
    q: q || undefined,
    action: action !== "all" ? action : undefined,
    entityType: entityType !== "all" ? entityType : undefined,
  };

  const { data: logs, isLoading } = useAdminListAuditLog(params, {
    query: { queryKey: getAdminListAuditLogQueryKey(params) },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Activity className="w-8 h-8" />
          سجل التدقيق
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم المسؤول أو معرف الكيان..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-9 bg-background/50 border-primary/20"
          />
        </div>
        <Select value={action} onValueChange={setAction} dir="rtl">
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="كل الإجراءات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الإجراءات</SelectItem>
            {actionOptions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityType} onValueChange={setEntityType} dir="rtl">
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="كل الكيانات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الكيانات</SelectItem>
            {entityTypeOptions.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle>أحدث النشاطات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-primary/20" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="rounded-md border border-primary/20">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المسؤول</TableHead>
                    <TableHead className="text-right">الإجراء</TableHead>
                    <TableHead className="text-right">الكيان</TableHead>
                    <TableHead className="text-right">معرف الكيان</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {log.adminUsername || 'نظام'}
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="font-mono">{log.entityType}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{log.entityId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد سجلات تدقيق مطابقة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
