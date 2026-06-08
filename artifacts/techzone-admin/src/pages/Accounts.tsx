import { useState } from "react";
import { 
  useAdminListAccounts, 
  getAdminListAccountsQueryKey,
  useAdminCreateAccount,
  useAdminUpdateAccount,
  useAdminDeleteAccount,
  useAdminListRoles,
  getAdminListRolesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const fallbackRoleMap: Record<string, string> = {
  super_admin: "مدير عام",
  content_editor: "محرر محتوى",
  order_manager: "مدير طلبات",
};

const accountSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  fullName: z.string().min(1, "الاسم الكامل مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل").optional(),
  role: z.string().min(1, "الدور مطلوب"),
  isActive: z.boolean().default(true),
});

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: accounts, isLoading } = useAdminListAccounts({
    query: { queryKey: getAdminListAccountsQueryKey() }
  });

  const { data: roles } = useAdminListRoles({
    query: { queryKey: getAdminListRolesQueryKey() }
  });

  const roleOptions = (roles && roles.length > 0)
    ? roles.map((r) => ({ key: r.key, name: r.nameAr }))
    : Object.entries(fallbackRoleMap).map(([key, name]) => ({ key, name }));

  const roleLabel = (key: string) =>
    roleOptions.find((r) => r.key === key)?.name ?? fallbackRoleMap[key] ?? key;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateAccount();
  const updateMutation = useAdminUpdateAccount();
  const deleteMutation = useAdminDeleteAccount();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: { username: "", fullName: "", email: "", password: "", role: "content_editor", isActive: true }
  });

  const onSubmit = (data: z.infer<typeof accountSchema>) => {
    if (editingId) {
      // Don't send empty password
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      updateMutation.mutate({ id: editingId, data: updateData }, {
        onSuccess: () => {
          toast({ title: "تم تحديث الحساب بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListAccountsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: (err: any) => {
          toast({ title: "فشل تحديث الحساب", description: err.message, variant: "destructive" });
        }
      });
    } else {
      if (!data.password) {
        form.setError("password", { message: "كلمة المرور مطلوبة للحسابات الجديدة" });
        return;
      }
      createMutation.mutate({ data: data as any }, {
        onSuccess: () => {
          toast({ title: "تم إنشاء الحساب بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListAccountsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: (err: any) => {
          toast({ title: "فشل إنشاء الحساب", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (account: any) => {
    setEditingId(account.id);
    form.reset({
      username: account.username, // Might not be updatable, but keep it in form
      fullName: account.fullName,
      email: account.email || "",
      password: "", // Empty so it's not changed unless typed
      role: account.role as any,
      isActive: account.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListAccountsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "فشل الحذف", description: err.message, variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({ username: "", fullName: "", email: "", password: "", role: "content_editor", isActive: true });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Users className="w-8 h-8" />
          حسابات المسؤولين
        </h1>
        <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة مسؤول
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل حساب" : "إنشاء حساب مسؤول"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>اسم المستخدم</FormLabel><FormControl><Input {...field} disabled={!!editingId} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input {...field} type="email" dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{editingId ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور"}</FormLabel>
                  <FormControl><Input {...field} type="password" dir="ltr" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue placeholder="اختر الدور" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {roleOptions.map((r) => (
                        <SelectItem key={r.key} value={r.key}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 pt-2">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>حساب نشط</FormLabel>
                </FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" className="glow-hover" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full bg-primary/20" />)}
            </div>
          ) : accounts && accounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">آخر تسجيل دخول</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-bold">{account.fullName}</div>
                          <div className="text-xs text-muted-foreground font-mono" dir="ltr">@{account.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>{roleLabel(account.role)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${account.isActive ? 'bg-lime/10 text-lime' : 'bg-destructive/10 text-destructive'}`}>
                          {account.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {account.lastLoginAt ? format(new Date(account.lastLoginAt), "yyyy-MM-dd HH:mm") : 'لم يسجل الدخول'}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(account)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" disabled={account.role === 'super_admin'}>
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
              <Users className="w-16 h-16 opacity-20" />
              <p>لا توجد حسابات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
