import { useAdminListNewsletter, getAdminListNewsletterQueryKey, useAdminDeleteNewsletterSubscriber } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Newsletter() {
  const { data: subscribers, isLoading } = useAdminListNewsletter({
    query: { queryKey: getAdminListNewsletterQueryKey() }
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteMutation = useAdminDeleteNewsletterSubscriber();

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المشترك؟")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "تم الحذف بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminListNewsletterQueryKey() });
        },
        onError: () => {
          toast({ title: "فشل الحذف", variant: "destructive" });
        }
      });
    }
  };

  const handleExportCSV = () => {
    if (!subscribers || subscribers.length === 0) return;
    
    const headers = ["ID", "Email", "Date Subscribed"];
    const csvContent = [
      headers.join(","),
      ...subscribers.map(sub => `"${sub.id}","${sub.email}","${format(new Date(sub.createdAt), "yyyy-MM-dd HH:mm:ss")}"`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <Mail className="w-8 h-8" />
          النشرة الإخبارية
        </h1>
        <Button onClick={handleExportCSV} disabled={!subscribers || subscribers.length === 0} className="glow-hover clip-corner-sm gap-2">
          <Download className="h-4 w-4" />
          تصدير CSV
        </Button>
      </div>

      <Card className="glass-panel border-primary/20 hud-frame">
        <CardHeader>
          <CardTitle>قائمة المشتركين ({subscribers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full bg-primary/20" />)}
            </div>
          ) : subscribers && subscribers.length > 0 ? (
            <div className="rounded-md border border-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20 hover:bg-transparent">
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">تاريخ الاشتراك</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub) => (
                    <TableRow key={sub.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="font-mono" dir="ltr">{sub.email}</TableCell>
                      <TableCell className="font-mono text-sm" dir="ltr">
                        {format(new Date(sub.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
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
              <Mail className="w-16 h-16 opacity-20" />
              <p>لا يوجد مشتركون في النشرة الإخبارية بعد</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
