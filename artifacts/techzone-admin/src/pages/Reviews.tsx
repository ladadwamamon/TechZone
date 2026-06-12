import { useState } from "react";
import { 
  useAdminListReviews, 
  getAdminListReviewsQueryKey,
  useAdminCreateReview,
  useAdminUpdateReview,
  useAdminDeleteReview,
  useAdminListProducts,
  getAdminListProductsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Plus, Trash2, Star, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
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

const reviewSchema = z.object({
  productId: z.string().min(1, "المنتج مطلوب"),
  authorName: z.string().min(1, "اسم الكاتب مطلوب"),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(1, "التعليق مطلوب"),
  date: z.string().optional(),
});

export default function Reviews() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productIdFilter, setProductIdFilter] = useState<string>("all");

  const reviewsParams = productIdFilter !== "all" ? { productId: productIdFilter } : undefined;
  const { data: reviews, isLoading } = useAdminListReviews(reviewsParams, {
    query: { queryKey: getAdminListReviewsQueryKey(reviewsParams) }
  });

  const productsParams = { limit: 100 };
  const { data: productsData } = useAdminListProducts(productsParams, {
    query: { queryKey: getAdminListProductsQueryKey(productsParams) }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateReview();
  const updateMutation = useAdminUpdateReview();
  const deleteMutation = useAdminDeleteReview();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { productId: "", authorName: "", rating: 5, comment: "", date: "" }
  });

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "تمت إضافة التقييم بنجاح" });
        queryClient.invalidateQueries({ queryKey: getAdminListReviewsQueryKey() });
        setIsDialogOpen(false);
      },
      onError: () => {
        toast({ title: "فشل إضافة التقييم", variant: "destructive" });
      }
    });
  };

  const handleToggleApprove = (id: string, isApproved: boolean) => {
    updateMutation.mutate({ id, data: { isApproved: !isApproved } }, {
      onSuccess: () => {
        toast({ title: isApproved ? "تم إلغاء اعتماد التقييم" : "تم اعتماد التقييم" });
        queryClient.invalidateQueries({ queryKey: getAdminListReviewsQueryKey() });
      },
      onError: () => {
        toast({ title: "فشل تحديث حالة التقييم", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListReviewsQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    form.reset({ productId: "", authorName: "", rating: 5, comment: "", date: format(new Date(), 'yyyy-MM-dd') });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <MessageSquare className="w-8 h-8" />
          التقييمات
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={productIdFilter} onValueChange={setProductIdFilter} dir="rtl">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="تصفية حسب المنتج" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المنتجات</SelectItem>
              {productsData?.products?.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nameAr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
            <Plus className="h-4 w-4" />
            إضافة تقييم
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              إضافة تقييم جديد
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="productId" render={({ field }) => (
                <FormItem>
                  <FormLabel>المنتج</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                    <FormControl><SelectTrigger><SelectValue placeholder="اختر المنتج" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {productsData?.products?.map((p) => <SelectItem key={p.id} value={p.id}>{p.nameAr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="authorName" render={({ field }) => (
                <FormItem><FormLabel>اسم الكاتب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="rating" render={({ field }) => (
                <FormItem><FormLabel>التقييم (1-5)</FormLabel><FormControl><Input type="number" min="1" max="5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="comment" render={({ field }) => (
                <FormItem><FormLabel>التعليق</FormLabel><FormControl><Textarea {...field} className="resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>التاريخ</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                <Button type="submit" className="glow-hover" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
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
          ) : reviews && reviews.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">الكاتب</TableHead>
                    <TableHead className="text-right">التقييم</TableHead>
                    <TableHead className="text-right w-1/2">التعليق</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">{review.authorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-muted/30'}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{review.comment}</TableCell>
                      <TableCell>
                        {review.isApproved ? (
                          <Badge variant="outline" className="gap-1 border-green-500/40 text-green-400">
                            <Check className="w-3 h-3" /> معتمد
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-yellow-500/40 text-yellow-400">
                            <Clock className="w-3 h-3" /> قيد المراجعة
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {format(new Date(review.date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleApprove(review.id, review.isApproved)}
                          disabled={updateMutation.isPending}
                          title={review.isApproved ? "إلغاء الاعتماد" : "اعتماد"}
                          className={`h-8 w-8 ${review.isApproved ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10" : "text-green-400 hover:text-green-300 hover:bg-green-500/10"}`}
                        >
                          {review.isApproved ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <MessageSquare className="w-16 h-16 opacity-20" />
              <p>لا توجد تقييمات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
