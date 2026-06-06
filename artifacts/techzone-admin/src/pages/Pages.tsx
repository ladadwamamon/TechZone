import { useState } from "react";
import {
  useAdminListPages,
  getAdminListPagesQueryKey,
  useAdminCreatePage,
  useAdminUpdatePage,
  useAdminDeletePage,
  type CustomPage,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/RichTextEditor";

interface FormState {
  slug: string;
  titleAr: string;
  contentHtml: string;
  isPublished: boolean;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY: FormState = { slug: "", titleAr: "", contentHtml: "", isPublished: true, metaTitle: "", metaDescription: "" };

export default function Pages() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: pages, isLoading } = useAdminListPages({ query: { queryKey: getAdminListPagesQueryKey() } });
  const createM = useAdminCreatePage();
  const updateM = useAdminUpdatePage();
  const deleteM = useAdminDeletePage();

  const refresh = () => queryClient.invalidateQueries({ queryKey: getAdminListPagesQueryKey() });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setIsOpen(true); };
  const openEdit = (p: CustomPage) => {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      titleAr: p.titleAr,
      contentHtml: p.contentHtml,
      isPublished: p.isPublished,
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!form.titleAr.trim() || !form.slug.trim()) {
      toast({ title: "العنوان والرابط مطلوبان", variant: "destructive" });
      return;
    }
    const payload = {
      slug: form.slug.trim().toLowerCase(),
      titleAr: form.titleAr.trim(),
      contentHtml: form.contentHtml,
      isPublished: form.isPublished,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
    };
    if (editingId) {
      updateM.mutate({ id: editingId, data: payload }, {
        onSuccess: () => { toast({ title: "تم التحديث" }); refresh(); setIsOpen(false); },
        onError: () => toast({ title: "فشل التحديث (تأكد أن الرابط غير مكرر)", variant: "destructive" }),
      });
    } else {
      createM.mutate({ data: payload }, {
        onSuccess: () => { toast({ title: "تمت الإضافة" }); refresh(); setIsOpen(false); },
        onError: () => toast({ title: "فشل الإضافة (تأكد أن الرابط غير مكرر)", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("حذف هذه الصفحة؟")) return;
    deleteM.mutate({ id }, {
      onSuccess: () => { toast({ title: "تم الحذف" }); refresh(); },
      onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <FileText className="w-8 h-8" />
          الصفحات
        </h1>
        <Button onClick={openCreate} className="gap-2 glow-hover">
          <Plus className="h-4 w-4" /> إضافة صفحة
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[720px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل الصفحة" : "إضافة صفحة"}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="basic" dir="rtl">
            <TabsList>
              <TabsTrigger value="basic">المحتوى</TabsTrigger>
              <TabsTrigger value="seo">تحسين محركات البحث</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">العنوان بالعربي</label>
                  <Input value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">الرابط (Slug)</label>
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} dir="ltr" placeholder="about-us" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">المحتوى</label>
                <RichTextEditor value={form.contentHtml} onChange={(v) => set("contentHtml", v)} placeholder="اكتب محتوى الصفحة..." />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.isPublished} onCheckedChange={(c) => set("isPublished", !!c)} />
                منشورة
              </label>
            </TabsContent>
            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">عنوان الميتا</label>
                <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">وصف الميتا</label>
                <Textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="min-h-24" />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-2 pt-4 border-t border-primary/10">
            <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createM.isPending || updateM.isPending} className="glow-hover">
              {createM.isPending || updateM.isPending ? "جاري الحفظ..." : "حفظ"}
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
          ) : pages && pages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">الرابط</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((p) => (
                    <TableRow key={p.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-bold">{p.titleAr}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">/p/{p.slug}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${p.isPublished ? "bg-lime/10 text-lime" : "bg-muted text-muted-foreground"}`}>
                          {p.isPublished ? "منشورة" : "مسودة"}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><ExternalLink className="h-4 w-4" /></Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openEdit(p)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
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
              <FileText className="w-16 h-16 opacity-20" />
              <p>لا توجد صفحات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
