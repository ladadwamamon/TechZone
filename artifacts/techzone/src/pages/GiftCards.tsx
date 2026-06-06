import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useRedeemGiftCard } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Gift, KeyRound, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GiftCardsPage() {
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const redeem = useRedeemGiftCard();

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast({ title: "الرمز مطلوب", variant: "destructive" });
      return;
    }
    try {
      const result = await redeem.mutateAsync({ data: { code: trimmed } });
      toast({
        title: "تم تفعيل البطاقة بنجاح",
        description: `قيمة البطاقة: ${result.amount} ₪`,
      });
      setCode("");
    } catch {
      toast({ title: "فشل في تفعيل البطاقة", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3 neon-text">بطاقات الهدايا</h1>
          <p className="text-muted-foreground">أدخل رمز بطاقة الهدايا للتحصل على رصيد في حسابك</p>
        </div>

        <Card className="border-primary/10">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <KeyRound className="w-4 h-4" />
              <span>البطاقات الفعّالة تتم اضافتها مباشرة لحسابك</span>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="XXXX-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                dir="ltr"
                className="font-mono text-center uppercase tracking-widest border-primary/10"
                maxLength={16}
                onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
              />
              <Button
                onClick={handleRedeem}
                disabled={redeem.isPending}
                className="bg-primary hover:bg-primary/90 whitespace-nowrap"
              >
                {redeem.isPending ? "جاري..." : "تفعيل"}
              </Button>
            </div>

            <div className="rounded border border-primary/10 bg-background/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>البطاقات التي تم تفعيلها لا يمكن استخدامها مرة أخرى</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-lime" />
                <span>يتم إضافة الرصيد لحسابك مباشرة للاستخدام في الشراء</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
