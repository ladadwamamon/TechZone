import { Layout } from "@/components/Layout";
import { useGetStoreSummary } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Terminal, Cpu, Zap, Shield, Globe, Users, Trophy } from "lucide-react";

export default function About() {
  const { data: summary } = useGetStoreSummary();

  const stats = [
    { label: "منتجات", value: summary?.totalProducts || 0, icon: Cpu },
    { label: "ماركات عالمية", value: summary?.totalBrands || 0, icon: Globe },
    { label: "طلبات ناجحة", value: summary?.totalOrders || 0, icon: Trophy },
    { label: "أقسام", value: summary?.totalCategories || 0, icon: Zap },
  ];

  return (
    <Layout>
      <div className="border-b border-primary/20 py-16 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute inset-0 cyber-grid-perspective opacity-30 pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-primary/10 border border-primary/30 clip-corner text-primary"
          >
            <Terminal size={40} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black neon-text text-primary glitch uppercase mb-4" data-text="TechZone_OS">
            TechZone_OS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-primary/80 font-mono max-w-2xl mx-auto uppercase tracking-widest">
            {"// "} THE_ULTIMATE_GAMING_DESTINATION
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        
        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-block px-3 py-1 bg-secondary/20 border border-secondary text-secondary font-mono text-sm clip-corner-sm uppercase shadow-[0_0_10px_var(--magenta)]">
              INIT_SEQUENCE
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-sans">تأسيس النظام الأساسي</h2>
            <p className="text-muted-foreground leading-relaxed text-lg font-sans">
              بدأت TechZone كفكرة بسيطة في غرفة مظلمة تضيئها شاشات الكمبيوتر. كنا مجموعة من اللاعبين الشغوفين، نبحث دائماً عن أفضل أداء، أعلى معدل إطارات، وأحدث التقنيات. لكننا واجهنا دائماً مشكلة واحدة: صعوبة العثور على قطع الهاردوير الاحترافية في منطقتنا.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg font-sans">
              لذلك، قررنا بناء نظامنا الخاص. وجهة واحدة متكاملة تجمع أفضل العلامات التجارية، أحدث المنتجات، وأقوى العتاد. نحن لا نبيع مجرد قطع إلكترونية، نحن نبيع تجربة لعب متكاملة، ونساعدك في بناء جهاز أحلامك.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video glass-panel clip-corner-lg hud-frame border-primary/30 p-2 overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 pointer-events-none group-hover:opacity-0 transition-opacity duration-500"></div>
              <img src="/catalog/prebuilt-pc-1.jpg" alt="Gaming Setup" className="w-full h-full object-cover filter contrast-125 saturate-150 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 scanlines opacity-50 pointer-events-none z-20"></div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel border-primary/20 clip-corner p-6 text-center group hover:border-primary/50 transition-colors hud-corners"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 text-primary flex items-center justify-center clip-corner-sm group-hover:bg-primary group-hover:text-background transition-colors shadow-[0_0_15px_var(--cyan)]">
                <stat.icon size={24} />
              </div>
              <div className="text-3xl font-black font-mono neon-text text-primary mb-2">
                {stat.value}
                <span className="text-sm">+</span>
              </div>
              <div className="text-sm text-muted-foreground font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Core Values */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-sans mb-4">بروتوكولات النظام</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">القيم والمبادئ التي تحكم كل عملية داخل TechZone.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel border-lime/30 clip-corner p-8 hover:bg-lime/5 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={100} className="text-lime" />
            </div>
            <h3 className="text-xl font-bold text-lime neon-text-lime mb-4 flex items-center gap-2 font-mono uppercase">
              <Zap size={20} /> SPEED_MAX
            </h3>
            <p className="text-muted-foreground font-sans relative z-10">
              سرعة في تلبية الطلبات، سرعة في الشحن، وسرعة في الدعم الفني. نعرف أن اللاعب لا يحب الانتظار.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel border-primary/30 clip-corner p-8 hover:bg-primary/5 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield size={100} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary neon-text mb-4 flex items-center gap-2 font-mono uppercase">
              <Shield size={20} /> AUTHENTICITY
            </h3>
            <p className="text-muted-foreground font-sans relative z-10">
              جميع منتجاتنا أصلية 100% ومضمونة من الوكلاء الرسميين. لا مجال للتقليد في أنظمتنا.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel border-secondary/30 clip-corner p-8 hover:bg-secondary/5 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users size={100} className="text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-secondary neon-text-magenta mb-4 flex items-center gap-2 font-mono uppercase">
              <Users size={20} /> COMMUNITY
            </h3>
            <p className="text-muted-foreground font-sans relative z-10">
              نحن جزء من مجتمع اللاعبين. نستمع إليكم، نشارككم الشغف، ونعمل دائماً على توفير ما تحتاجونه للتفوق.
            </p>
          </motion.div>
        </div>

      </div>
    </Layout>
  );
}
