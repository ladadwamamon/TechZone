import { useState } from "react";
import { 
  useAdminListProducts, 
  getAdminListProductsQueryKey,
  useAdminDeleteProduct,
  useListCategories,
  useListBrands,
  useAdminCreateProduct,
  useAdminUpdateProduct
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const productSchema = z.object({
  nameAr: z.string().min(1, "الاسم بالعربي مطلوب"),
  nameEn: z.string().min(1, "الاسم بالإنجليزي مطلوب"),
  slug: z.string().min(1, "الرابط (Slug) مطلوب"),
  price: z.coerce.number().min(0, "السعر يجب أن يكون 0 أو أكثر"),
  originalPrice: z.coerce.number().optional(),
  discountPercent: z.coerce.number().optional(),
  categorySlug: z.string().min(1, "الفئة مطلوبة"),
  brandSlug: z.string().min(1, "العلامة التجارية مطلوبة"),
  image: z.string().min(1, "الصورة مطلوبة"),
  image2: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviewCount: z.coerce.number().min(0).default(0),
  warranty: z.string().optional(),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isExclusive: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  descriptionAr: z.string().optional(),
});

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const productsParams = { page, limit: 10, search };
  const { data: productsData, isLoading } = useAdminListProducts(productsParams, {
    query: { queryKey: getAdminListProductsQueryKey(productsParams) }
  });

  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateProduct();
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nameAr: "", nameEn: "", slug: "", price: 0, categorySlug: "", brandSlug: "", image: "",
      stock: 0, rating: 0, reviewCount: 0, isNew: false, isBestSeller: false, isExclusive: false,
      isFlashDeal: false, isFeatured: false
    }
  });

  const onSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "تم تحديث المنتج بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل تحديث المنتج", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة المنتج بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل إضافة المنتج", variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    form.reset({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice || undefined,
      discountPercent: product.discountPercent || undefined,
      categorySlug: product.categorySlug,
      brandSlug: product.brandSlug,
      image: product.image,
      image2: product.image2 || undefined,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      warranty: product.warranty || undefined,
      isNew: product.isNew || false,
      isBestSeller: product.isBestSeller || false,
      isExclusive: product.isExclusive || false,
      isFlashDeal: product.isFlashDeal || false,
      isFeatured: product.isFeatured || false,
      descriptionAr: product.descriptionAr || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({
      nameAr: "", nameEn: "", slug: "", price: 0, categorySlug: "", brandSlug: "", image: "",
      stock: 0, rating: 0, reviewCount: 0, isNew: false, isBestSeller: false, isExclusive: false,
      isFlashDeal: false, isFeatured: false
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Package className="w-8 h-8" />
          المنتجات
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن منتج..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 bg-background/50 border-primary/20 focus-visible:ring-primary/50"
            />
          </div>
          <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">إضافة منتج</span>
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem><FormLabel>الاسم بالعربي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nameEn" render={({ field }) => (
                  <FormItem><FormLabel>الاسم بالإنجليزي</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>الرابط (Slug)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>السعر</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="categorySlug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفئة</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                      <FormControl><SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories?.map((c) => <SelectItem key={c.id} value={c.slug}>{c.nameAr}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="brandSlug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>العلامة التجارية</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                      <FormControl><SelectTrigger><SelectValue placeholder="اختر العلامة" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {brands?.map((b) => <SelectItem key={b.id} value={b.slug}>{b.nameEn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                  <FormItem><FormLabel>الصورة الرئيسية (رابط)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>المخزون</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-primary/10">
                <FormField control={form.control} name="isNew" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>جديد</FormLabel></FormItem>
                )} />
                <FormField control={form.control} name="isBestSeller" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>الأكثر مبيعاً</FormLabel></FormItem>
                )} />
                <FormField control={form.control} name="isExclusive" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>حصري</FormLabel></FormItem>
                )} />
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>مميز</FormLabel></FormItem>
                )} />
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
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full bg-primary/20" />
              ))}
            </div>
          ) : productsData?.products && productsData.products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المخزون</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsData.products.map((product) => (
                    <TableRow key={product.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.nameAr} className="w-10 h-10 object-cover rounded bg-background/50 border border-primary/20" />
                          <div>
                            <div className="font-bold">{product.nameAr}</div>
                            <div className="text-xs text-muted-foreground" dir="ltr">{product.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.categorySlug}</TableCell>
                      <TableCell className="font-mono">{product.price} ريال</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${product.stock > 0 ? 'bg-lime/10 text-lime' : 'bg-destructive/10 text-destructive'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <Package className="w-16 h-16 opacity-20" />
              <p>لا توجد منتجات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
