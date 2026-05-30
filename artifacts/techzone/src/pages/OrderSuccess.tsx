import { Layout } from "@/components/Layout";
import { Link, useSearch } from "wouter";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("id") || "ORD-XXXX-XXXX";

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Colors: Cyan and Purple to match brand
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#00f0ff', '#8a2be2'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#00f0ff', '#8a2be2'] });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-card border border-primary/20 rounded-2xl p-8 md:p-12 text-center glass-panel relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-4">تم تأكيد طلبك بنجاح!</h1>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              شكراً لتسوقك من TechZone. سنتواصل معك قريباً لتأكيد تفاصيل التوصيل.
            </p>
            
            <div className="bg-background/50 border border-white/10 rounded-lg p-6 w-full mb-8 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground mb-1">رقم الطلب الخاص بك</div>
              <div className="text-2xl font-mono font-bold tracking-widest text-primary neon-text">{orderId}</div>
              <div className="text-xs text-muted-foreground mt-4">
                يرجى الاحتفاظ برقم الطلب لتتمكن من تتبعه لاحقاً
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href={`/track-order?id=${orderId}`} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center gap-2">
                <Package size={20} />
                تتبع الطلب
              </Link>
              <Link href="/" className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-3 rounded-md font-bold transition-colors flex items-center justify-center gap-2">
                <Home size={20} />
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
