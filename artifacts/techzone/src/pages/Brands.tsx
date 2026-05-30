import { Layout } from "@/components/Layout";
import { useListBrands } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Brands() {
  const { data: brands, isLoading } = useListBrands();

  return (
    <Layout>
      <div className="border-b border-primary/30 py-12 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-6 uppercase">
            <Link href="/" className="hover:text-secondary transition-colors">ROOT</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">MANUFACTURERS</span>
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-primary/10 border border-primary clip-corner hud-frame text-primary">
            <ShieldAlert size={40} className="animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black neon-text text-primary glitch uppercase mb-4" data-text="الماركات العالمية">
            الماركات العالمية
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl text-sm">
            {"// "} استكشف أحدث التقنيات والعتاد من أفضل المصنعين في العالم. عتاد أصلي بضمان معتمد.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-square glass-panel border border-primary/20 clip-corner animate-pulse bg-primary/5" />
            ))}
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map((brand, i) => (
              <motion.div 
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/brands/${brand.slug}`} className="block h-full">
                  <div className="glass-panel border border-primary/20 clip-corner-sm h-full flex flex-col items-center p-6 glow-hover group relative overflow-hidden bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-full aspect-video flex items-center justify-center mb-4 relative z-10">
                      <img 
                        src={brand.logo} 
                        alt={brand.nameEn} 
                        className="max-w-[80%] max-h-[80%] object-contain mix-blend-screen opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                      />
                    </div>
                    
                    <div className="mt-auto w-full text-center relative z-10 border-t border-primary/10 pt-4">
                      <h3 className="font-bold text-lg font-mono uppercase group-hover:text-primary transition-colors neon-text">{brand.nameEn}</h3>
                      <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground font-mono">
                        <Cpu size={12} />
                        <span>{brand.productCount} ITEM(S)</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground font-mono py-12">
            {"// "} NO_BRANDS_FOUND
          </div>
        )}
      </div>
    </Layout>
  );
}