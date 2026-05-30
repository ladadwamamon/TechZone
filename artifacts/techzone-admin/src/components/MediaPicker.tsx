import { useState } from "react";
import {
  useAdminListMedia,
  getAdminListMediaQueryKey,
  useAdminCreateMedia,
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Library, Check, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface MediaPickerProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function MediaPicker({ value, onChange, placeholder }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");

  const { data: mediaItems, isLoading } = useAdminListMedia(undefined, {
    query: { queryKey: getAdminListMediaQueryKey() },
  });
  const createMutation = useAdminCreateMedia();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRegister = () => {
    const url = newUrl.trim();
    if (!url) return;
    const filename = newName.trim() || url.split("/").pop() || "image";
    createMutation.mutate(
      { data: { url, filename, folder: "general", altText: "" } },
      {
        onSuccess: (created) => {
          toast({ title: "تمت إضافة الصورة للمكتبة" });
          queryClient.invalidateQueries({ queryKey: getAdminListMediaQueryKey() });
          onChange(created?.url ?? url);
          setNewUrl("");
          setNewName("");
          setOpen(false);
        },
        onError: () => toast({ title: "فشل إضافة الصورة", variant: "destructive" }),
      },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          placeholder={placeholder ?? "رابط الصورة"}
          className="flex-1 font-mono text-xs"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="shrink-0 gap-2 border-primary/40 text-primary hover:bg-primary/10"
        >
          <Library className="h-4 w-4" /> المكتبة
        </Button>
      </div>
      {value ? (
        <div className="w-16 h-16 rounded border border-primary/20 bg-background/50 overflow-hidden flex items-center justify-center">
          <img src={value} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[640px] glass-panel border-primary/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-primary neon-text">مكتبة الوسائط</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 items-end pb-4 border-b border-primary/10">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">رابط صورة جديد</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                dir="ltr"
                placeholder="https://..."
                className="font-mono text-xs"
              />
            </div>
            <div className="w-28 space-y-1">
              <label className="text-xs text-muted-foreground">الاسم</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                dir="ltr"
                className="font-mono text-xs"
              />
            </div>
            <Button
              type="button"
              onClick={handleRegister}
              disabled={createMutation.isPending}
              className="shrink-0 gap-1"
            >
              <Plus className="h-4 w-4" /> أضف
            </Button>
          </div>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : mediaItems && mediaItems.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {mediaItems.map((item) => {
                const selected = item.url === value;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className={`relative aspect-square rounded border bg-background/50 overflow-hidden flex items-center justify-center p-1 transition-colors ${
                      selected
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-primary/20 hover:border-primary/60"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      className="max-w-full max-h-full object-contain"
                    />
                    {selected && (
                      <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <ImageIcon className="w-12 h-12 opacity-20" />
              <p>لا توجد وسائط. أضف صورة برابط أعلاه.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
