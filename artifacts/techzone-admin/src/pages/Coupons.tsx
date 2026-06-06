import { useState } from "react";
import {
  useAdminListCoupons,
  getAdminListCouponsQueryKey,
  useAdminCreateCoupon,
  useAdminUpdateCoupon,
  useAdminDeleteCoupon,
  type AdminCouponInput,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CouponFormState {
  code: string;
  type: "percent" | "fixed";
  value: string;
  minSubtotal: string;
  maxUses: string;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  descriptionAr: string;
}

const EMPTY_FORM: CouponFormState = {
  code: "",
  type: "percent",
  value: "",
  minSubtotal: "",
  maxUses: "",
  isActive: true,
  startsAt: "",
  expiresAt: "",
  descriptionAr: "",
};

const numOrUndef = (v: string): number | undefined => {
  const t = v.trim();
  if (t === "") return undefined;
  const n = Number(t);
  return Number.isNaN(n) ? undefined : n;
};

const toLocalInput = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIso = (local: string): string | null => {
  const t = local.trim();
  if (t === "") return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

export default function Coupons() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<string[]>([]);

  const { data: coupons, isLoading } = useAdminListCoupons({
    query: { queryKey: getAdminListCouponsQueryKey() },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateCoupon();
  const updateMutation = useAdminUpdateCoupon();
  const deleteMutation = useAdminDeleteCoupon();

  const set = <K extends keyof CouponFormState>(key: K, value: CouponFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors([]);
    setIsDialogOpen(true);
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon.id);
    setErrors([]);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minSubtotal: coupon.minSubtotal != null ? String(coupon.minSubtotal) : "",
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
      isActive: !!coupon.isActive,
      startsAt: toLocalInput(coupon.startsAt),
      expiresAt: toLocalInput(coupon.expiresAt),
      descriptionAr: coupon.descriptionAr ?? "",
    });
    setIsDialogOpen(true);
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.code.trim()) errs.push("الكود مطلوب");
    if (numOrUndef(form.value) === undefined) errs.push("القيمة مطلوبة ويجب أن تكون رقماً");
    return errs;
  };

  const buildPayload = (): AdminCouponInput => ({
    code: form.code.trim(),
    type: form.type,
    value: numOrUndef(form.value) ?? 0,
    minSubtotal: numOrUndef(form.minSubtotal) ?? null,
    maxUses: numOrUndef(form.maxUses) ?? null,
    isActive: form.isActive,
    startsAt: toIso(form.startsAt),
    expiresAt: toIso(form.expiresAt),
    descriptionAr: form.descriptionAr.trim() || null,
  });

  const handleSubmit = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;
    const payload = buildPayload();
    const onSuccess = (msg: string) => {
      toast({ title: msg });
      queryClient.invalidateQueries({ queryKey: getAdminListCouponsQueryKey() });
      setIsDialogOpen(false);
    };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => onSuccess("تم تحديث الكوبون بنجاح"),
          onError: () => toast({ title: "فشل تحديث الكوبون", variant: "destructive" }),
        },
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => onSuccess("تمت إضافة الكوبون بنجاح"),
          onError: () => toast({ title: "فشل إضافة الكوبون", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListCouponsQueryKey() });
        },
        onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Ticket className="w-8 h-8" />
          الكوبونات
        </h1>
        <Button onClick={handleOpenCreate} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة كوبون
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل الكوبون" : "إضافة كوبون جديد"}
            </DialogTitle>
          </DialogHeader>

          {errors.length > 0 && (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive space-y-1">
              {errors.map((e, i) => (
                <div key={i}>• {e}</div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="الكود">
                <Input value={form.code} onChange={(e) => set("code", e.target.value)} dir="ltr" />
              </Field>
              <Field label="النوع">
                <Select value={form.type} onValueChange={(v) => set("type", v as "percent" | "fixed")} dir="rtl">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="القيمة">
                <Input type="number" step="0.01" value={form.value} onChange={(e) => set("value", e.target.value)} />
              </Field>
              <Field label="الحد الأدنى للطلب (اختياري)">
                <Input
                  type="number"
                  step="0.01"
                  value={form.minSubtotal}
                  onChange={(e) => set("minSubtotal", e.target.value)}
                />
              </Field>
              <Field label="الحد الأقصى للاستخدام (اختياري)">
                <Input type="number" value={form.maxUses} onChange={(e) => set("maxUses", e.target.value)} />
              </Field>
              <Field label="تاريخ البدء (اختياري)">
                <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              </Field>
              <Field label="تاريخ الانتهاء (اختياري)">
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
              </Field>
            </div>

            <Field label="الوصف (اختياري)">
              <Textarea
                value={form.descriptionAr}
                onChange={(e) => set("descriptionAr", e.target.value)}
                className="min-h-20"
              />
            </Field>

            <label className="flex items-center gap-3 rounded border border-primary/10 p-3 bg-background/40">
              <Switch checked={form.isActive} onCheckedChange={(c) => set("isActive", c)} />
              <span className="text-sm">مفعّل</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="glow-hover"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full bg-primary/20" />)}
            </div>
          ) : coupons && coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                    <TableHead className="text-right">الاستخدام</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-mono font-bold text-primary" dir="ltr">{coupon.code}</TableCell>
                      <TableCell>{coupon.type === "percent" ? "نسبة مئوية" : "مبلغ ثابت"}</TableCell>
                      <TableCell className="font-mono">
                        {coupon.type === "percent" ? `${coupon.value}%` : `${coupon.value} ريال`}
                      </TableCell>
                      <TableCell className="font-mono">
                        {coupon.usedCount}
                        {coupon.maxUses != null ? ` / ${coupon.maxUses}` : ""}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-mono ${
                            coupon.isActive ? "bg-lime/10 text-lime" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {coupon.isActive ? "مفعّل" : "معطّل"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(coupon)}
                            className="h-8 w-8 hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(coupon.id)}
                            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                          >
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
              <Ticket className="w-16 h-16 opacity-20" />
              <p>لا توجد كوبونات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
