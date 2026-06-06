import { useState } from "react";
import {
  useAdminListSubscriptionPlans,
  getAdminListSubscriptionPlansQueryKey,
  useAdminCreateSubscriptionPlan,
  useAdminUpdateSubscriptionPlan,
  useAdminDeleteSubscriptionPlan,
  type SubscriptionPlanInput,
  type SubscriptionPlanUpdate,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface PlanForm {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn: string;
  price: string;
  period: "monthly" | "quarterly" | "yearly";
  features: string;
  isActive: boolean;
}

const EMPTY_FORM: PlanForm = {
  nameAr: "",
  nameEn: "",
  slug: "",
  descriptionAr: "",
  descriptionEn: "",
  price: "",
  period: "monthly",
  features: "",
  isActive: true,
};

export default function SubscriptionPlans() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);

  const { data: plans, isLoading } = useAdminListSubscriptionPlans({
    query: { queryKey: getAdminListSubscriptionPlansQueryKey() },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useAdminCreateSubscriptionPlan();
  const update = useAdminUpdateSubscriptionPlan();
  const del = useAdminDeleteSubscriptionPlan();

  const set = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const price = Number(form.price);
    if (!price || price <= 0) {
      toast({ title: "السعر مطلوب", variant: "destructive" });
      return;
    }
    const body = {
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      slug: form.slug,
      descriptionAr: form.descriptionAr || null,
      descriptionEn: form.descriptionEn || null,
      price,
      period: form.period,
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    if (editingId) {
      await update.mutateAsync({ id: editingId, data: body as SubscriptionPlanUpdate });
      toast({ title: "تم التحديث" });
    } else {
      await create.mutateAsync({ data: body as SubscriptionPlanInput });
      toast({ title: "تم الإنشاء" });
    }
    queryClient.invalidateQueries({ queryKey: getAdminListSubscriptionPlansQueryKey() });
    setIsDialogOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleEdit = (plan: any) => {
    setEditingId(plan.id);
    setForm({
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      slug: plan.slug,
      descriptionAr: plan.descriptionAr || "",
      descriptionEn: plan.descriptionEn || "",
      price: String(plan.price),
      period: plan.period,
      features: (plan.features || []).join("\n"),
      isActive: plan.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await del.mutateAsync({ id });
    toast({ title: "تم الحذف" });
    queryClient.invalidateQueries({ queryKey: getAdminListSubscriptionPlansQueryKey() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">خطط الاشتراك</h1>
        </div>
        <Button
          onClick={() => { setIsDialogOpen(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          إنشاء خطة
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[540px] border-primary/10">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل خطة" : "إنشاء خطة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الاسم بالعربي</label>
                <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزي</label>
                <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">المعرف (slug)</label>
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">السعر</label>
                <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">الفترة</label>
                <select
                  className="w-full h-9 rounded-md border border-primary/10 bg-background px-3 text-sm"
                  value={form.period}
                  onChange={(e) => set("period", e.target.value as PlanForm["period"])}
                >
                  <option value="monthly">شهري</option>
                  <option value="quarterly">ربع سنوي</option>
                  <option value="yearly">سنوي</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">الوصف بالعربي</label>
              <Textarea value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="min-h-16" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">الوصف بالإنجليزي</label>
              <Textarea value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="min-h-16" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">المميزات (سطر لكل ميزة)</label>
              <Textarea value={form.features} onChange={(e) => set("features", e.target.value)} className="min-h-20" />
            </div>
            <label className="flex items-center gap-3 rounded border border-primary/10 p-3 bg-background/40">
              <Switch checked={form.isActive} onCheckedChange={(c) => set("isActive", c)} />
              <span className="text-sm">فعّال</span>
            </label>
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
          ) : plans && plans.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10">
                    <TableHead>الاسم</TableHead>
                    <TableHead>slug</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id} className="border-primary/10">
                      <TableCell>{plan.nameAr}</TableCell>
                      <TableCell className="font-mono text-xs" dir="ltr">{plan.slug}</TableCell>
                      <TableCell>{plan.price} ₪</TableCell>
                      <TableCell>
                        {plan.period === "monthly" ? "شهري" : plan.period === "quarterly" ? "ربع سنوي" : "سنوي"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${plan.isActive ? "bg-lime/10 text-lime" : "bg-destructive/10 text-destructive"}`}>
                          {plan.isActive ? "فعّال" : "معطّل"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <Calendar className="w-16 h-16 opacity-20" />
              <p>لا توجد خطط اشتراك بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
