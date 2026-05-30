import { Layout } from "@/components/Layout";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Monitor, Cpu, ChevronLeft, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <Layout>
      <div className="border-b border-primary/20 py-12 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary mb-4 font-mono tracking-wider">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <span className="text-foreground uppercase">CATEGORIES</span>
          </div>
          <h1 className="text-4xl font-black neon-text text-primary glitch uppercase" data-text="فهرس الأقسام">فهرس الأقسام</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl font-mono text-sm border-r-2 border-primary pr-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4 uppercase">
            // تصفح قاعدة بيانات الأقسام للوصول إلى المنتجات والعتاد بسهولة.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] glass-panel clip-corner animate-pulse border-primary/20"></div>
            ))
          ) : (
            categories?.map((category, index) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel clip-corner glow-hover hud-frame p-8 flex flex-col items-center justify-center text-center gap-4 group h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-primary/20 px-2 py-1 font-mono text-[10px] text-primary clip-corner-sm border-b border-l border-primary/30">
                    IDX_{index.toString().padStart(2, '0')}
                  </div>
                  
                  <div className="w-20 h-20 rounded-none clip-corner bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 group-hover:text-secondary transition-all duration-300 neon-border">
                    <Database size={32} />
                  </div>
                  <div className="z-10 mt-2">
                    <h3 className="text-xl font-black mb-2 group-hover:text-primary transition-colors uppercase tracking-wider">{category.nameAr}</h3>
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-2">
                      {category.descriptionAr || "// تصفح أحدث العتاد"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 w-full border-t border-primary/20 relative">
                    <div className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary group-hover:bg-secondary transition-colors" />
                    <span className="inline-flex items-center justify-center font-mono text-xs text-primary group-hover:text-secondary transition-colors tracking-widest">
                      [ ITEMS: {category.productCount.toString().padStart(3, '0')} ]
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
