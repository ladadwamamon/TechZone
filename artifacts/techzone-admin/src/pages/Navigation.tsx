import { useState } from "react";
import {
  useAdminListNavItems,
  getAdminListNavItemsQueryKey,
  useAdminCreateNavItem,
  useAdminUpdateNavItem,
  useAdminDeleteNavItem,
  useAdminReorderNavItems,
  type NavItem,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Menu, Plus, Edit, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormState {
  label: string;
  href: string;
  location: "header" | "footer";
  isVisible: boolean;
  opensNewTab: boolean;
}

const EMPTY: FormState = { label: "", href: "", location: "header", isVisible: true, opensNewTab: false };

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useAdminListNavItems({ query: { queryKey: getAdminListNavItemsQueryKey() } });
  const createM = useAdminCreateNavItem();
  const updateM = useAdminUpdateNavItem();
  const deleteM = useAdminDeleteNavItem();
  const reorderM = useAdminReorderNavItems();

  const refresh = () => queryClient.invalidateQueries({ queryKey: getAdminListNavItemsQueryKey() });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const header = (items ?? []).filter((i) => i.location === "header").sort((a, b) => a.sortOrder - b.sortOrder);
  const footer = (items ?? []).filter((i) => i.location === "footer").sort((a, b) => a.sortOrder - b.sortOrder);

  const openCreate = (location: "header" | "footer") => {
    setEditingId(null);
    setForm({ ...EMPTY, location });
    setIsOpen(true);
  };

  const openEdit = (item: NavItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      href: item.href,
      location: item.location as "header" | "footer",
      isVisible: item.isVisible,
      opensNewTab: item.opensNewTab,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.label.trim() || !form.href.trim()) {
      toast({ title: "العنوان والرابط مطلوبان", variant: "destructive" });
      return;
    }
    const group = form.location === "header" ? header : footer;
    const payload = {
      label: form.label.trim(),
      href: form.href.trim(),
      location: form.location,
      isVisible: form.isVisible,
      opensNewTab: form.opensNewTab,
    };
    if (editingId) {
      updateM.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast({ title: "تم التحديث" }); refresh(); setIsOpen(false); },
        onError: () => toast({ title: "فشل التحديث", variant: "destructive" }),
      });
    } else {
      createM.mutate({ data: { ...payload, sortOrder: group.length } }, {
        onSuccess: () => { toast({ title: "تمت الإضافة" }); refresh(); setIsOpen(false); },
        onError: () => toast({ title: "فشل الإضافة", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("حذف هذا الرابط؟")) return;
    deleteM.mutate({ id }, {
      onSuccess: () => { toast({ title: "تم الحذف" }); refresh(); },
      onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
    });
  };

  const move = (group: NavItem[], index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= group.length) return;
    const reordered = [...group];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const payload = reordered.map((it, idx) => ({ id: it.id, sortOrder: idx }));
    reorderM.mutate({ data: { items: payload } }, {
      onSuccess: refresh,
      onError: () => toast({ title: "فشل الترتيب", variant: "destructive" }),
    });
  };

  const renderGroup = (title: string, group: NavItem[], location: "header" | "footer") => (
    <Card className="glass-panel border-primary/20 hud-frame">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button size="sm" onClick={() => openCreate(location)} className="gap-2 glow-hover">
          <Plus className="h-4 w-4" /> إضافة رابط
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <Skeleton className="h-10 w-full bg-primary/20" />
        ) : group.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">لا توجد روابط</div>
        ) : (
          group.map((item, i) => (
            <div key={item.id} className="flex items-center gap-2 rounded border border-primary/15 bg-background/40 px-3 py-2">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === 0} onClick={() => move(group, i, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-6" disabled={i === group.length - 1} onClick={() => move(group, i, 1)}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm flex items-center gap-2">
                  {item.label}
                  {!item.isVisible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                  {item.opensNewTab && <span className="text-[10px] text-muted-foreground">↗</span>}
                </div>
                <div className="text-xs text-muted-foreground truncate" dir="ltr">{item.href}</div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
        <Menu className="w-8 h-8" />
        إدارة القوائم
      </h1>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل الرابط" : "إضافة رابط"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">العنوان</label>
              <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="مثال: العروض" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">الرابط</label>
              <Input value={form.href} onChange={(e) => set("href", e.target.value)} dir="ltr" placeholder="/deals أو https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">الموقع</label>
              <Select value={form.location} onValueChange={(v) => set("location", v as "header" | "footer")} dir="rtl">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">الشريط العلوي</SelectItem>
                  <SelectItem value="footer">التذييل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.isVisible} onCheckedChange={(c) => set("isVisible", !!c)} />
              <Eye className="h-4 w-4" /> ظاهر
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.opensNewTab} onCheckedChange={(c) => set("opensNewTab", !!c)} />
              فتح في نافذة جديدة
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
            <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createM.isPending || updateM.isPending} className="glow-hover">
              {createM.isPending || updateM.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderGroup("الشريط العلوي", header, "header")}
        {renderGroup("التذييل", footer, "footer")}
      </div>
    </div>
  );
}
