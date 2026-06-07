import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { 
  useAdminListOrders, 
  getAdminListOrdersQueryKey, 
  useAdminUpdateOrderStatus,
  useAdminGetOrder,
  getAdminGetOrderQueryKey,
  useAdminFulfillOrder
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ExternalLink, Package, KeyRound } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusMap: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  out_for_delivery: "في الطريق للتوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي"
};

export default function Orders() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  const ordersParams = { page, limit: 10, ...(status !== "all" ? { status } : {}) };
  const { data, isLoading } = useAdminListOrders(ordersParams, {
    query: { queryKey: getAdminListOrdersQueryKey(ordersParams) }
  });

  const { data: orderDetails, isLoading: isLoadingDetails } = useAdminGetOrder(selectedOrderId || "", {
    query: { 
      enabled: !!selectedOrderId,
      queryKey: getAdminGetOrderQueryKey(selectedOrderId || "") 
    }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateStatus = useAdminUpdateOrderStatus();
  const fulfillOrder = useAdminFulfillOrder();

  const handleFulfill = (id: string) => {
    fulfillOrder.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "تم تسليم الأكواد المتاحة" });
        queryClient.invalidateQueries({ queryKey: getAdminGetOrderQueryKey(id) });
      },
      onError: () => toast({ title: "تعذر التسليم (قد لا يتوفر مخزون كافٍ)", variant: "destructive" }),
    });
  };

  const handleStatusChange = (id: string, newStatus: any) => {
    updateStatus.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast({ title: "تم تحديث حالة الطلب بنجاح" });
        queryClient.invalidateQueries({ queryKey: getAdminListOrdersQueryKey() });
        if (selectedOrderId === id) {
          queryClient.invalidateQueries({ queryKey: getAdminGetOrderQueryKey(id) });
        }
      },
      onError: () => {
        toast({ title: "فشل تحديث حالة الطلب", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          الطلبات
        </h1>
        <Select value={status} onValueChange={setStatus} dir="rtl">
          <SelectTrigger className="w-[180px]" data-testid="select-order-status-filter">
            <SelectValue placeholder="حالة الطلب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(statusMap).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="sm:max-w-[700px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text flex items-center gap-2">
              تفاصيل الطلب 
              <span className="text-sm bg-primary/20 px-2 py-0.5 rounded text-primary" dir="ltr" data-testid="text-order-id-detail">
                #{selectedOrderId?.substring(0,8)}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-24 w-full bg-primary/20" />
              <Skeleton className="h-48 w-full bg-primary/20" />
            </div>
          ) : orderDetails ? (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-background/50 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      معلومات العميل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">الاسم</span>
                      <span className="font-bold">{orderDetails.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">الهاتف</span>
                      <span className="font-mono" dir="ltr">{orderDetails.phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">المدينة</span>
                      <span>{orderDetails.city}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-1">
                      <span className="text-muted-foreground">العنوان</span>
                      <span className="truncate max-w-[150px]">{orderDetails.address}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/50 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                      <span>حالة الطلب</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select 
                      value={orderDetails.status} 
                      onValueChange={(val) => handleStatusChange(orderDetails.id, val)}
                      dir="rtl"
                    >
                      <SelectTrigger data-testid={`select-order-status-${orderDetails.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusMap).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-between border-b border-primary/10 pb-1 text-sm mt-4">
                      <span className="text-muted-foreground">طريقة الدفع</span>
                      <span className="capitalize">{orderDetails.paymentMethod.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-primary/10 pb-1 text-sm">
                      <span className="text-muted-foreground">التاريخ</span>
                      <span className="font-mono" dir="ltr">{format(new Date(orderDetails.createdAt), "yyyy-MM-dd HH:mm")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2 border-b border-primary/20 pb-2">
                  <Package className="w-4 h-4" />
                  المنتجات ({orderDetails.items.length})
                </h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, i) => (
                    <div key={i} className="flex gap-3 bg-background/30 p-2 rounded border border-primary/10 items-center">
                      <img src={item.image} alt={item.nameAr} className="w-12 h-12 rounded object-cover border border-primary/20" />
                      <div className="flex-1">
                        <div className="font-bold text-sm line-clamp-1">{item.nameAr}</div>
                        <div className="text-xs text-muted-foreground font-mono">الكمية: {item.quantity}</div>
                      </div>
                      <div className="font-mono font-bold text-primary whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 border-b border-primary/20 pb-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    الأكواد الرقمية المُسلّمة
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFulfill(orderDetails.id)}
                    disabled={fulfillOrder.isPending}
                    className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    {fulfillOrder.isPending ? "جاري التسليم..." : "تسليم/تعبئة الأكواد"}
                  </Button>
                </div>
                {orderDetails.deliveredCodes && orderDetails.deliveredCodes.length > 0 ? (
                  <div className="space-y-2">
                    {orderDetails.deliveredCodes.map((dc, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 bg-background/40 border border-primary/15 rounded px-3 py-2">
                        <span className="text-sm text-muted-foreground line-clamp-1">{dc.nameAr}</span>
                        <span className="font-mono text-sm text-lime" dir="ltr">{dc.secret}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    لا توجد أكواد رقمية في هذا الطلب، أو لم يتوفر مخزون وقت الشراء. استخدم "تسليم/تعبئة الأكواد" إذا أضفت مخزوناً لاحقاً.
                  </div>
                )}
              </div>

              <div className="bg-primary/5 p-4 rounded border border-primary/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-mono">{formatPrice(orderDetails.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-mono">{formatPrice(orderDetails.shipping)}</span>
                </div>
                {orderDetails.discount && orderDetails.discount > 0 && (
                  <div className="flex justify-between text-sm text-lime">
                    <span>الخصم</span>
                    <span className="font-mono">-{formatPrice(orderDetails.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-primary/20 pt-2 mt-2 text-lg">
                  <span>الإجمالي</span>
                  <span className="font-mono text-primary">{formatPrice(orderDetails.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">تعذر تحميل تفاصيل الطلب</div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-primary/20" />
              ))}
            </div>
          ) : data?.orders && data.orders.length > 0 ? (
            <div className="rounded-md border border-primary/20 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الطلب</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">تفاصيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map((order) => (
                    <TableRow key={order.id} className="border-primary/20 hover:bg-primary/5 cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                      <TableCell className="font-mono text-sm text-primary" dir="ltr">#{order.id.substring(0,8)}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground" dir="ltr">
                        {format(new Date(order.createdAt), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell className="font-mono font-bold">{formatPrice(order.total)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select 
                          value={order.status} 
                          onValueChange={(val) => handleStatusChange(order.id, val)}
                          dir="rtl"
                        >
                          <SelectTrigger className="h-8 text-xs w-[130px]" data-testid={`select-order-status-row-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusMap).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setSelectedOrderId(order.id)}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>لا توجد طلبات حتى الآن</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
