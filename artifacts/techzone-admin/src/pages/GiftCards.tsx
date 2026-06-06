import { useState } from "react";
import {
  useAdminListGiftCards,
  getAdminListGiftCardsQueryKey,
  useAdminCreateGiftCard,
  useAdminUpdateGiftCard,
  useAdminDeleteGiftCard,
  type GiftCardInput,
  type GiftCardUpdate,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface GiftCardForm {
  code: string;
  amount: string;
  balance: string;
  status: "active" | "redeemed" | "expired" | "cancelled";
  expiresAt: string;
}

const EMPTY_FORM: GiftCardForm = {
  code: "",
  amount: "",
  balance: "",
  status: "active",
  expiresAt: "",
};

export default function GiftCards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GiftCardForm>(EMPTY_FORM);

  const { data: cards, isLoading } = useAdminListGiftCards({
    query: { queryKey: getAdminListGiftCardsQueryKey() },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useAdminCreateGiftCard();
  const update = useAdminUpdateGiftCard();
  const del = useAdminDeleteGiftCard();

  const set = <K extends keyof GiftCardForm>(key: K, value: GiftCardForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      toast({ title: "المبلغ مطلوب", variant: "destructive" });
      return;
    }
    const balance = form.balance ? Number(form.balance) : amount;
    const body = {
      code: form.code,
      amount,
      balance,
      status: form.status,
      expiresAt: form.expiresAt || null,
    };

    if (editingId) {
      await update.mutateAsync({ id: editingId, data: body as GiftCardUpdate });
      toast({ title: "تم التحديث" });
    } else {
      await create.mutateAsync({ data: body as GiftCardInput });
      toast({ title: "تم الإنشاء" });
    }
    queryClient.invalidateQueries({ queryKey: getAdminListGiftCardsQueryKey() });
    setIsDialogOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (card: any) => {
    setEditingId(card.id);
    setForm({
      code: card.code,
      amount: String(card.amount),
      balance: String(card.balance),
      status: card.status,
      expiresAt: card.expiresAt ? card.expiresAt.slice(0, 16) : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await del.mutateAsync({ id });
    toast({ title: "تم الحذف" });
    queryClient.invalidateQueries({ queryKey: getAdminListGiftCardsQueryKey() });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-lime/10 text-lime";
      case "redeemed": return "bg-blue-500/10 text-blue-400";
      case "expired": return "bg-yellow/10 text-yellow";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">بطاقات الهدايا</h1>
        </div>
        <Button
          onClick={() => { setIsDialogOpen(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          إنشاء بطاقة
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-primary/10">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل بطاقة" : "إنشاء بطاقة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الرمز</label>
                <Input value={form.code} onChange={(e) => set("code", e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">المبلغ</label>
                <Input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الرصيد (افتراضي = المبلغ)</label>
                <Input type="number" value={form.balance} onChange={(e) => set("balance", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الحالة</label>
                <select
                  className="w-full h-9 rounded-md border border-primary/10 bg-background px-3 text-sm"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as GiftCardForm["status"])}
                >
                  <option value="active">فعّالة</option>
                  <option value="redeemed">تم الاستخدام</option>
                  <option value="expired">منتهية</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">تاريخ الانتهاء (اختياري)</label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90" disabled={create.isPending || update.isPending}>
                {editingId ? "حفظ" : "إنشاء"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-primary/10">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : cards && cards.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10">
                    <TableHead>الرمز</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الانتهاء</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card) => (
                    <TableRow key={card.id} className="border-primary/10">
                      <TableCell className="font-mono text-xs" dir="ltr">{card.code}</TableCell>
                      <TableCell>{card.amount} ₪</TableCell>
                      <TableCell>{card.balance} ₪</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${statusColor(card.status)}`}>
                          {card.status === "active" ? "فعّالة" : card.status === "redeemed" ? "تم الاستخدام" : card.status === "expired" ? "منتهية" : "ملغاة"}
                        </span>
                      </TableCell>
                      <TableCell>{card.expiresAt ? new Date(card.expiresAt).toLocaleDateString("ar-PS") : "—"}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(card)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <Gift className="w-16 h-16 opacity-20" />
              <p>لا توجد بطاقات هدايا بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
