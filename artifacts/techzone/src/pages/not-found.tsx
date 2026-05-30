import { Link } from "wouter";
import { Terminal, ShieldAlert } from "lucide-react";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] w-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="glass-panel border-destructive/40 hud-corners p-8 md:p-12 max-w-lg w-full text-center relative z-10">
          <div className="absolute top-2 left-4 text-xs font-mono text-destructive/50">// ERROR_CODE: 404</div>
          
          <div className="w-24 h-24 mx-auto bg-destructive/10 border border-destructive/50 clip-corner flex items-center justify-center text-destructive mb-8 relative shadow-[0_0_30px_rgba(245,41,63,0.3)]">
            <div className="absolute inset-0 bg-destructive/20 animate-pulse"></div>
            <ShieldAlert size={48} className="relative z-10 animate-pulse-glow" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-destructive glitch uppercase tracking-widest" data-text="SIGNAL LOST">
            SIGNAL LOST
          </h1>
          
          <div className="neon-divider my-6 bg-gradient-to-r from-transparent via-destructive to-transparent"></div>
          
          <p className="text-muted-foreground mb-2 font-mono">
            // الوجهة المطلوبة غير موجودة في النظام.
          </p>
          <p className="text-muted-foreground/70 mb-8 text-sm font-mono">
            [ قد يكون الرابط خاطئاً أو تم نقل الصفحة ]
          </p>

          <Link href="/" className="inline-flex bg-background border border-primary/50 text-primary hover:bg-primary/10 px-8 py-4 clip-corner font-bold transition-all items-center justify-center gap-2 glow-hover uppercase tracking-widest font-mono">
            <Terminal size={18} />
            RETURN_TO_BASE
          </Link>
        </div>
      </div>
    </Layout>
  );
}
