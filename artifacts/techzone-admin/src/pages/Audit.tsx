import { useState } from "react";
import { useAdminListAuditLog, getAdminListAuditLogQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { format } from "date-fns";

export default function Audit() {
  const { data: logs, isLoading } = useAdminListAuditLog(undefined, {
    query: { queryKey: getAdminListAuditLogQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Activity className="w-8 h-8" />
          سجل التدقيق
        </h1>
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
              لا توجد سجلات تدقيق حتى الآن
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
