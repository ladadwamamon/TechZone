import { Layout } from "@/components/Layout";
import { Link, useSearch } from "wouter";
import { CheckCircle2, Package, Home, Terminal } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";

const NEON_COLORS = ["#00E5FF", "#FF2E97", "#9EFF00"];

function NeonConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.8,
        size: 5 + Math.random() * 7,
        color: NEON_COLORS[i % NEON_COLORS.length],
        drift: (Math.random() - 0.5) * 120,
        rotate: Math.random() * 720,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 2,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
          initial={{ y: "-10%", x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

export default function OrderSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const orderId = params.get("id") || "ORD-XXXX-XXXX";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center relative">
        <NeonConfetti />
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full glass-panel border-lime/30 hud-corners p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-lime/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute top-2 left-4 text-xs font-mono text-lime/50">// STATUS: ORDER_CONFIRMED</div>
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-lime/10 border border-lime/50 clip-corner text-lime flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(158,255,0,0.3)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-lime/20 animate-pulse"></div>
              <CheckCircle2 size={48} className="relative z-10 drop-shadow-[0_0_10px_rgba(158,255,0,0.8)]" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-4 glitch text-lime neon-text-lime uppercase tracking-wide" data-text="تم تأكيد طلبك بنجاح!">تم تأكيد طلبك بنجاح!</h1>
            
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              شكراً لتسوقك من TechZone. جاري معالجة الطلب في النظام وسنتواصل معك قريباً.
            </p>
            
            <div className="bg-background border border-primary/30 clip-corner-sm p-6 w-full mb-8 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              <div className="text-xs font-mono text-primary/70 mb-2 uppercase tracking-widest">// ORDER_ID</div>
              <div className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-primary neon-text break-all select-all">{orderId}</div>
              <div className="text-xs text-muted-foreground mt-4 font-mono">
                [ يرجى الاحتفاظ برقم الطلب لتتمكن من تتبعه لاحقاً ]
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href={`/track-order?id=${orderId}`} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 clip-corner font-bold transition-all glow-hover flex items-center justify-center gap-2 uppercase tracking-wide">
                <Terminal size={20} />
                تتبع الطلب
              </Link>
              <Link href="/" className="flex-1 bg-background border border-primary/30 hover:border-primary text-foreground hover:bg-primary/5 px-6 py-4 clip-corner font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-wide">
                <Home size={20} className="text-primary" />
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
