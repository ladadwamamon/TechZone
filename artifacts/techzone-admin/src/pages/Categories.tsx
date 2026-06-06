import { useState } from "react";
import { 
  useListCategories, 
  getListCategoriesQueryKey,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tags, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const categorySchema = z.object({
  slug: z.string().min(1, "الرابط (Slug) مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربي مطلوب"),
  nameEn: z.string().min(1, "الاسم بالإنجليزي مطلوب"),
  icon: z.string().min(1, "الأيقونة مطلوبة"),
  image: z.string().optional(),
  descriptionAr: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateCategory();
  const updateMutation = useAdminUpdateCategory();
  const deleteMutation = useAdminDeleteCategory();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { slug: "", nameAr: "", nameEn: "", icon: "", image: "", descriptionAr: "", metaTitle: "", metaDescription: "", metaKeywords: "" }
  });

  const onSubmit = (data: z.infer<typeof categorySchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "تم تحديث الفئة بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل تحديث الفئة", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة الفئة بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل إضافة الفئة", variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    form.reset({
      slug: category.slug,
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      icon: category.icon,
      image: category.image || undefined,
      descriptionAr: category.descriptionAr || undefined,
      metaTitle: category.metaTitle || undefined,
      metaDescription: category.metaDescription || undefined,
      metaKeywords: category.metaKeywords || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({ slug: "", nameAr: "", nameEn: "", icon: "", image: "", descriptionAr: "", metaTitle: "", metaDescription: "", metaKeywords: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Tags className="w-8 h-8" />
          الفئات
        </h1>
        <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة فئة
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nameAr" render={({ field }) => (
                <FormItem><FormLabel>الاسم بالعربي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nameEn" render={({ field }) => (
                <FormItem><FormLabel>الاسم بالإنجليزي</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>الرابط (Slug)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem><FormLabel>الأيقونة (Lucide Icon name)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="pt-2 border-t border-primary/10">
                <p className="text-sm font-mono text-primary/80 mb-3">تحسين محركات البحث (SEO)</p>
                <div className="space-y-4">
                  <FormField control={form.control} name="metaTitle" render={({ field }) => (
                    <FormItem><FormLabel>عنوان الميتا (Meta Title)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="metaDescription" render={({ field }) => (
                    <FormItem><FormLabel>وصف الميتا (Meta Description)</FormLabel><FormControl><Textarea {...field} className="min-h-20" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="metaKeywords" render={({ field }) => (
                    <FormItem><FormLabel>الكلمات المفتاحية (Meta Keywords)</FormLabel><FormControl><Input {...field} placeholder="كلمة1، كلمة2، كلمة3" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
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
          ) : categories && categories.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">الرابط</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">{category.nameAr}</TableCell>
                      <TableCell className="font-mono text-muted-foreground" dir="ltr">{category.slug}</TableCell>
                      <TableCell className="font-mono">{category.productCount}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <Tags className="w-16 h-16 opacity-20" />
              <p>لا توجد فئات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
