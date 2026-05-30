import { useState } from "react";
import { 
  useAdminListBlogPosts, 
  getAdminListBlogPostsQueryKey,
  useAdminCreateBlogPost,
  useAdminUpdateBlogPost,
  useAdminDeleteBlogPost
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";

const blogPostSchema = z.object({
  slug: z.string().min(1, "الرابط (Slug) مطلوب"),
  titleAr: z.string().min(1, "العنوان مطلوب"),
  excerpt: z.string().min(1, "المقتطف مطلوب"),
  contentAr: z.string().min(1, "المحتوى مطلوب"),
  coverImage: z.string().min(1, "صورة الغلاف مطلوبة"),
  date: z.string().min(1, "التاريخ مطلوب"),
  readingMinutes: z.coerce.number().min(1).optional(),
  categoryAr: z.string().min(1, "الفئة مطلوبة"),
  isFeatured: z.boolean().default(false),
  authorName: z.string().optional(),
  authorAvatar: z.string().optional(),
});

export default function Blog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: posts, isLoading } = useAdminListBlogPosts({
    query: { queryKey: getAdminListBlogPostsQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateBlogPost();
  const updateMutation = useAdminUpdateBlogPost();
  const deleteMutation = useAdminDeleteBlogPost();

  const form = useForm<z.infer<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { 
      slug: "", titleAr: "", excerpt: "", contentAr: "", coverImage: "", 
      date: format(new Date(), 'yyyy-MM-dd'), readingMinutes: 5, categoryAr: "", 
      isFeatured: false, authorName: "", authorAvatar: "" 
    }
  });

  const onSubmit = (data: z.infer<typeof blogPostSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "تم تحديث المقال بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListBlogPostsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل تحديث المقال", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة المقال بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListBlogPostsQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل إضافة المقال", variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    form.reset({
      slug: post.slug,
      titleAr: post.titleAr,
      excerpt: post.excerpt,
      contentAr: post.contentAr,
      coverImage: post.coverImage,
      date: format(new Date(post.date), 'yyyy-MM-dd'),
      readingMinutes: post.readingMinutes || 5,
      categoryAr: post.categoryAr,
      isFeatured: post.isFeatured || false,
      authorName: post.authorName || "",
      authorAvatar: post.authorAvatar || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المقال؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListBlogPostsQueryKey() });
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
      slug: "", titleAr: "", excerpt: "", contentAr: "", coverImage: "", 
      date: format(new Date(), 'yyyy-MM-dd'), readingMinutes: 5, categoryAr: "", 
      isFeatured: false, authorName: "", authorAvatar: "" 
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <FileText className="w-8 h-8" />
          المدونة
        </h1>
        <Button onClick={handleOpenDialog} className="glow-hover clip-corner-sm gap-2">
          <Plus className="h-4 w-4" />
          إضافة مقال
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] glass-panel border-primary/20 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل المقال" : "إضافة مقال جديد"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="titleAr" render={({ field }) => (
                  <FormItem><FormLabel>العنوان</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>الرابط (Slug)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="categoryAr" render={({ field }) => (
                  <FormItem><FormLabel>الفئة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>التاريخ</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="authorName" render={({ field }) => (
                  <FormItem><FormLabel>الكاتب</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="readingMinutes" render={({ field }) => (
                  <FormItem><FormLabel>دقائق القراءة</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="coverImage" render={({ field }) => (
                <FormItem><FormLabel>صورة الغلاف (رابط)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="excerpt" render={({ field }) => (
                <FormItem><FormLabel>مقتطف (ملخص)</FormLabel><FormControl><Textarea {...field} className="resize-none" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contentAr" render={({ field }) => (
                <FormItem><FormLabel>المحتوى</FormLabel><FormControl><Textarea {...field} className="min-h-[200px]" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel>مقال مميز</FormLabel>
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
          ) : posts && posts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">المقال</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img src={post.coverImage} alt={post.titleAr} className="w-12 h-8 object-cover rounded bg-background/50 border border-primary/20" />
                          <div>
                            <div className="font-bold">{post.titleAr}</div>
                            <div className="text-xs text-muted-foreground" dir="ltr">{post.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{post.categoryAr}</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {format(new Date(post.date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(post)} className="h-8 w-8 hover:text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <p>لا توجد مقالات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
