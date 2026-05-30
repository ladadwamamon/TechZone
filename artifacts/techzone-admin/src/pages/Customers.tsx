import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminListOrders, type Order } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface CustomerRow {
  name: string;
  phone: string;
  email: string;
  city: string;
  orders: number;
  total: number;
  lastOrder: string;
}

export default function Customers() {
  const { data: allOrders, isLoading } = useQuery({
    queryKey: ["admin", "customers", "all-orders"],
    queryFn: async () => {
      const pageSize = 200;
      const first = await adminListOrders({ page: 1, limit: pageSize });
      const orders: Order[] = [...first.orders];
      const totalPages = Math.max(1, Math.ceil(first.total / pageSize));
      for (let p = 2; p <= totalPages; p++) {
        const next = await adminListOrders({ page: p, limit: pageSize });
        orders.push(...next.orders);
      }
      return orders;
    },
  });

  const customers = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    for (const o of allOrders ?? []) {
      const key = o.phone || o.customerName;
      const existing = map.get(key);
      if (existing) {
        existing.orders += 1;
        existing.total += o.total;
        if (o.email && !existing.email) existing.email = o.email;
        if (new Date(o.createdAt) > new Date(existing.lastOrder)) existing.lastOrder = o.createdAt;
      } else {
        map.set(key, {
          name: o.customerName,
          phone: o.phone,
          email: o.email ?? "",
          city: o.city,
          orders: 1,
          total: o.total,
          lastOrder: o.createdAt,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [allOrders]);

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ["Name", "Phone", "Email", "City", "Orders", "Total", "Last Order"];
    const rows = customers.map((c) =>
      [
        c.name,
        c.phone,
        c.email,
        c.city,
        c.orders,
        c.total,
        format(new Date(c.lastOrder), "yyyy-MM-dd"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Users className="w-8 h-8" />
          العملاء
        </h1>
        <Button
          onClick={handleExportCSV}
          disabled={customers.length === 0}
          className="glow-hover clip-corner-sm gap-2"
        >
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle>قائمة العملاء ({customers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-primary/20" />
              ))}
            </div>
          ) : customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">المدينة</TableHead>
                    <TableHead className="text-right">الطلبات</TableHead>
                    <TableHead className="text-right">إجمالي الإنفاق</TableHead>
                    <TableHead className="text-right">آخر طلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c, i) => (
                    <TableRow key={i} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div>{c.name}</div>
                        {c.email ? (
                          <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                            {c.email}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono" dir="ltr">
                        {c.phone}
                      </TableCell>
                      <TableCell>{c.city}</TableCell>
                      <TableCell className="font-mono">{c.orders}</TableCell>
                      <TableCell className="font-mono text-lime">{c.total} ريال</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {format(new Date(c.lastOrder), "yyyy-MM-dd")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <Users className="w-16 h-16 opacity-20" />
              <p>لا يوجد عملاء بعد. يظهر العملاء بعد إتمام أول طلب.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
