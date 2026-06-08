import { useState } from "react";
import {
  useAdminListRoles,
  getAdminListRolesQueryKey,
  useAdminCreateRole,
  useAdminUpdateRole,
  useAdminDeleteRole,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Plus, Trash2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PermDef = { key: string; label: string };
type PermGroup = { title: string; perms: PermDef[] };

const PERMISSION_GROUPS: PermGroup[] = [
  {
    title: "المتجر والمحتوى",
    perms: [
      { key: "products:write", label: "إدارة المنتجات" },
      { key: "categories:write", label: "إدارة الفئات" },
      { key: "brands:write", label: "إدارة العلامات التجارية" },
      { key: "reviews:write", label: "إدارة التقييمات" },
      { key: "blog:write", label: "إدارة المدونة" },
      { key: "media:write", label: "إدارة الوسائط" },
      { key: "navigation:write", label: "إدارة القوائم" },
      { key: "pages:write", label: "إدارة الصفحات" },
    ],
  },
  {
    title: "الطلبات والتسويق",
    perms: [
      { key: "orders:write", label: "إدارة الطلبات" },
      { key: "coupons:write", label: "إدارة الكوبونات" },
      { key: "digital_codes:write", label: "إدارة الأكواد الرقمية" },
      { key: "newsletter:read", label: "عرض النشرة الإخبارية" },
      { key: "newsletter:write", label: "إدارة النشرة الإخبارية" },
    ],
  },
  {
    title: "النظام",
    perms: [
      { key: "analytics:read", label: "عرض الإحصائيات" },
      { key: "settings:write", label: "إدارة الإعدادات" },
      { key: "audit:read", label: "عرض سجل التدقيق" },
      { key: "admins:manage", label: "إدارة الحسابات والأدوار" },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key));

export default function Roles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [key, setKey] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: roles, isLoading } = useAdminListRoles({
    query: { queryKey: getAdminListRolesQueryKey() },
  });

  const createMutation = useAdminCreateRole();
  const updateMutation = useAdminUpdateRole();
  const deleteMutation = useAdminDeleteRole();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListRolesQueryKey() });

  const openCreate = () => {
    setEditingId(null);
    setEditingKey(null);
    setNameAr("");
    setKey("");
    setSelectedPerms(new Set());
    setIsDialogOpen(true);
  };

  const openEdit = (role: { id: string; key: string; nameAr: string; permissions: string[] }) => {
    setEditingId(role.id);
    setEditingKey(role.key);
    setNameAr(role.nameAr);
    setKey(role.key);
    setSelectedPerms(new Set(role.permissions));
    setIsDialogOpen(true);
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleGroup = (group: PermGroup, on: boolean) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const p of group.perms) {
        if (on) next.add(p.key);
        else next.delete(p.key);
      }
      return next;
    });
  };

  const isSuperAdmin = editingKey === "super_admin";

  const handleSubmit = () => {
    if (!nameAr.trim()) {
      toast({ title: "اسم الدور مطلوب", variant: "destructive" });
      return;
    }
    const permissions = Array.from(selectedPerms);

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: { nameAr: nameAr.trim(), permissions } },
        {
          onSuccess: () => {
            toast({ title: "تم تحديث الدور بنجاح" });
            invalidate();
            setIsDialogOpen(false);
          },
          onError: (err: any) =>
            toast({ title: "فشل تحديث الدور", description: err.message, variant: "destructive" }),
        },
      );
    } else {
      if (!key.trim()) {
        toast({ title: "معرّف الدور مطلوب", variant: "destructive" });
        return;
      }
      createMutation.mutate(
        { data: { key: key.trim(), nameAr: nameAr.trim(), permissions } },
        {
          onSuccess: () => {
            toast({ title: "تم إنشاء الدور بنجاح" });
            invalidate();
            setIsDialogOpen(false);
          },
          onError: (err: any) =>
            toast({ title: "فشل إنشاء الدور", description: err.message, variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم الحذف بنجاح" });
            invalidate();
          },
          onError: (err: any) =>
            toast({ title: "فشل الحذف", description: err.message, variant: "destructive" }),
        },
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          الأدوار والصلاحيات
        </h1>
        <Button onClick={openCreate} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة دور
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full bg-primary/20" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {roles?.map((role) => (
            <Card key={role.id} className="glass-panel border-primary/20 hud-frame">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-mono text-primary flex items-center gap-2">
                    {role.isSystem && <Lock className="h-4 w-4 text-muted-foreground" />}
                    {role.nameAr}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground font-mono mt-1" dir="ltr">{role.key}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(role)} className="h-8">
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role.id)}
                    disabled={role.isSystem}
                    className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.length === ALL_PERMISSION_KEYS.length ? (
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">جميع الصلاحيات</span>
                  ) : role.permissions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">لا توجد صلاحيات</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {role.permissions.length} من {ALL_PERMISSION_KEYS.length} صلاحية
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل دور" : "إنشاء دور جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">اسم الدور</label>
                <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: مدير المخزون" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">المعرّف (إنجليزي)</label>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  disabled={!!editingId}
                  dir="ltr"
                  placeholder="inventory_manager"
                />
              </div>
            </div>

            {isSuperAdmin && (
              <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded p-2">
                دور المدير العام يملك جميع الصلاحيات دائماً ولا يمكن تقييده.
              </div>
            )}

            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => {
                const allOn = group.perms.every((p) => selectedPerms.has(p.key));
                return (
                  <div key={group.title} className="border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-primary">{group.title}</h3>
                      <button
                        type="button"
                        disabled={isSuperAdmin}
                        onClick={() => toggleGroup(group, !allOn)}
                        className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50"
                      >
                        {allOn ? "إلغاء الكل" : "تحديد الكل"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.perms.map((p) => (
                        <label
                          key={p.key}
                          className="flex items-center gap-2 text-sm cursor-pointer py-1"
                        >
                          <Checkbox
                            checked={isSuperAdmin || selectedPerms.has(p.key)}
                            disabled={isSuperAdmin}
                            onCheckedChange={() => togglePerm(p.key)}
                          />
                          <span>{p.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
