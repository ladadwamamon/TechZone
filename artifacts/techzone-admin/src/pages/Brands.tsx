import { useState } from "react";
import { 
  useListBrands, 
  getListBrandsQueryKey,
  useAdminCreateBrand,
  useAdminUpdateBrand,
  useAdminDeleteBrand
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Copyright, Plus, Edit, Trash2 } from "lucide-react";
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

const brandSchema = z.object({
  slug: z.string().min(1, "الرابط (Slug) مطلوب"),
  nameEn: z.string().min(1, "الاسم مطلوب"),
  logo: z.string().min(1, "الشعار مطلوب"),
  website: z.string().optional(),
  descriptionAr: z.string().optional(),
});

export default function Brands() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: brands, isLoading } = useListBrands({
    query: { queryKey: getListBrandsQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateBrand();
  const updateMutation = useAdminUpdateBrand();
  const deleteMutation = useAdminDeleteBrand();

  const form = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: { slug: "", nameEn: "", logo: "", website: "", descriptionAr: "" }
  });

  const onSubmit = (data: z.infer<typeof brandSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "تم تحديث العلامة التجارية بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListBrandsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل تحديث العلامة التجارية", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة العلامة التجارية بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListBrandsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل إضافة العلامة التجارية", variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (brand: any) => {
    setEditingId(brand.id);
    form.reset({
      slug: brand.slug,
      nameEn: brand.nameEn,
      logo: brand.logo,
      website: brand.website || undefined,
      descriptionAr: brand.descriptionAr || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه العلامة التجارية؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getListBrandsQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({ slug: "", nameEn: "", logo: "", website: "", descriptionAr: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Copyright className="w-8 h-8" />
          العلامات التجارية
        </h1>
        <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة علامة تجارية
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل العلامة التجارية" : "إضافة علامة تجارية"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nameEn" render={({ field }) => (
                <FormItem><FormLabel>الاسم</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>الرابط (Slug)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="logo" render={({ field }) => (
                <FormItem><FormLabel>مسار الشعار</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
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
          ) : brands && brands.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">العلامة التجارية</TableHead>
                    <TableHead className="text-right">الرابط</TableHead>
                    <TableHead className="text-right">عدد المنتجات</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-white rounded p-1">
                            <img src={brand.logo} alt={brand.nameEn} className="max-w-full max-h-full object-contain" />
                          </div>
                          <span dir="ltr">{brand.nameEn}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground" dir="ltr">{brand.slug}</TableCell>
                      <TableCell className="font-mono">{brand.productCount}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(brand)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <Copyright className="w-16 h-16 opacity-20" />
              <p>لا توجد علامات تجارية بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
