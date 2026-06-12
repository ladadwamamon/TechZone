import { useRef, useState } from "react";
import { 
  useAdminListMedia, 
  getAdminListMediaQueryKey,
  useAdminCreateMedia,
  useAdminDeleteMedia,
  useAdminUpdateMedia
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Plus, Trash2, ExternalLink, Edit, Upload } from "lucide-react";
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
import { format } from "date-fns";

const mediaSchema = z.object({
  url: z.string().url("رابط غير صالح"),
  filename: z.string().min(1, "اسم الملف مطلوب"),
  folder: z.string().optional(),
  altText: z.string().optional(),
});

export default function Media() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: mediaItems, isLoading } = useAdminListMedia(undefined, {
    query: { queryKey: getAdminListMediaQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useAdminCreateMedia();
  const updateMutation = useAdminUpdateMedia();
  const deleteMutation = useAdminDeleteMedia();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useUpload({
    onError: () => toast({ title: "فشل رفع الملف", variant: "destructive" }),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const uploaded = await uploadFile(file);
    if (!uploaded) return;
    createMutation.mutate(
      {
        data: {
          url: `/api/storage${uploaded.objectPath}`,
          filename: file.name,
          folder: "general",
          altText: "",
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم رفع الملف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListMediaQueryKey() });
        },
        onError: () => toast({ title: "فشل تسجيل الملف", variant: "destructive" }),
      },
    );
  };

  const form = useForm<z.infer<typeof mediaSchema>>({
    resolver: zodResolver(mediaSchema),
    defaultValues: { url: "", filename: "", folder: "general", altText: "" }
  });

  const onSubmit = (data: z.infer<typeof mediaSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "تم تحديث الوسائط بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListMediaQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل تحديث الوسائط", variant: "destructive" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "تمت إضافة الوسائط بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListMediaQueryKey() });
          setIsDialogOpen(false);
        },
        onError: () => {
          toast({ title: "فشل إضافة الوسائط", variant: "destructive" });
        }
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    form.reset({
      url: item.url,
      filename: item.filename,
      folder: item.folder || "general",
      altText: item.altText || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الملف؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListMediaQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingId(null);
    form.reset({ url: "", filename: "", folder: "general", altText: "" });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <ImageIcon className="w-8 h-8" />
          الوسائط
        </h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="glow-hover clip-corner-sm gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "جاري الرفع..." : "رفع من الجهاز"}
          </Button>
          <Button onClick={handleOpenDialog} variant="outline" className="clip-corner-sm gap-2">
            <Plus className="h-4 w-4" />
            إضافة وسائط (رابط)
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-panel border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text">
              {editingId ? "تعديل الملف" : "إضافة ملف جديد"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem><FormLabel>الرابط (URL)</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="filename" render={({ field }) => (
                <FormItem><FormLabel>اسم الملف</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="folder" render={({ field }) => (
                <FormItem><FormLabel>المجلد</FormLabel><FormControl><Input {...field} dir="ltr" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="altText" render={({ field }) => (
                <FormItem><FormLabel>النص البديل (Alt)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-md bg-primary/20" />
          ))}
        </div>
      ) : mediaItems && mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <Card key={item.id} className="glass-panel border-primary/20 overflow-hidden group">
              <div className="aspect-square relative bg-background/50 flex items-center justify-center p-2">
                <img src={item.url} alt={item.altText || item.filename} className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleEdit(item)} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-destructive/20 text-destructive rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <CardContent className="p-3 text-xs border-t border-primary/10">
                <div className="truncate font-mono" dir="ltr" title={item.filename}>{item.filename}</div>
                <div className="flex justify-between items-center mt-1 text-muted-foreground">
                  <span>{item.folder}</span>
                  <span dir="ltr">{format(new Date(item.createdAt), "MM/dd")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-panel border-primary/20 hud-frame">
          <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <ImageIcon className="w-16 h-16 opacity-20" />
            <p>لا توجد وسائط بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
