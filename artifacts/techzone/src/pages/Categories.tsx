import { Layout } from "@/components/Layout";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Monitor, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <Layout>
      <div className="bg-card border-b border-white/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <span className="text-foreground">الأقسام</span>
          </div>
          <h1 className="text-4xl font-black neon-text text-primary">جميع الأقسام</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            تصفح جميع أقسام متجرنا للوصول إلى المنتجات التي تبحث عنها بسهولة وسرعة.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-card border border-white/5 rounded-xl animate-pulse"></div>
            ))
          ) : (
            categories?.map((category, index) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all group h-full glass-panel"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
                    <Monitor size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{category.nameAr}</h3>
                    <p className="text-sm text-muted-foreground">{category.descriptionAr || "تصفح أحدث المنتجات في هذا القسم"}</p>
                  </div>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/5 text-xs font-medium border border-white/10 group-hover:border-primary/30 text-muted-foreground group-hover:text-foreground">
                      {category.productCount} منتج
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
