import { Layout } from "@/components/Layout";
import { useGetFeaturedProducts, useGetBestSellers, useGetFlashDeals, useListCategories, useListBrands } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link } from "wouter";
import { ArrowLeft, Zap, Flame, Monitor, Cpu, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Countdown Timer Component (HUD Style)
function Countdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(endsAt) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="flex gap-2 text-center dir-ltr font-mono" dir="ltr">
      <div className="glass-panel hud-frame border-destructive/50 p-2 min-w-[60px] clip-corner-sm">
        <div className="text-2xl font-bold text-destructive neon-text">{timeLeft.hours.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase tracking-widest mt-1">HR</div>
      </div>
      <div className="text-2xl font-bold text-destructive/50 pt-2 animate-flicker">:</div>
      <div className="glass-panel hud-frame border-destructive/50 p-2 min-w-[60px] clip-corner-sm">
        <div className="text-2xl font-bold text-destructive neon-text">{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase tracking-widest mt-1">MIN</div>
      </div>
      <div className="text-2xl font-bold text-destructive/50 pt-2 animate-flicker">:</div>
      <div className="glass-panel hud-frame border-destructive/50 p-2 min-w-[60px] clip-corner-sm">
        <div className="text-2xl font-bold text-destructive neon-text">{timeLeft.seconds.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase tracking-widest mt-1">SEC</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: bestSellers, isLoading: bestSellersLoading } = useGetBestSellers({ limit: 8 });
  const { data: flashDeals, isLoading: flashDealsLoading } = useGetFlashDeals();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  const { data: brands, isLoading: brandsLoading } = useListBrands();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center py-10 md:py-0">
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-6">
          <div className="flex-1 text-center md:text-right mt-10 md:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse-glow"></span>
                <span className="font-mono text-lime text-xs tracking-widest uppercase">// SYSTEM_ONLINE</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                ارتقِ بمستوى <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text glitch" data-text="اللعب الخاص بك">
                  اللعب الخاص بك
                </span>
              </h1>
              
              <div className="glass-panel border-l-2 border-l-primary p-4 mb-8 max-w-xl mx-auto md:mx-0 inline-block text-right">
                <p className="text-muted-foreground text-base md:text-lg">
                  أقوى أجهزة الكمبيوتر، الشاشات، وملحقات الألعاب من أفضل الماركات العالمية في مكان واحد. 
                  <span className="text-primary font-mono ml-2">_READY</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/categories" className="clip-corner bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 font-bold text-lg transition-all glow-hover flex items-center justify-center gap-2 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">تسوق الآن <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 bg-primary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link href="/pc-builder" className="clip-corner bg-secondary/10 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4 font-bold text-lg transition-all glow-hover-magenta flex items-center justify-center gap-2 relative overflow-hidden group">
                  <span className="relative z-10 flex items-center gap-2">ابنِ جهازك <Cpu size={20} className="group-hover:rotate-180 transition-transform duration-500" /></span>
                  <div className="absolute inset-0 bg-secondary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 hidden md:flex relative justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 w-full h-full flex items-center justify-center hud-corners p-8"
            >
              {/* Decorative elements behind image */}
              <div className="absolute w-[80%] h-[80%] bg-primary/10 rounded-full blur-[80px] animate-pulse-glow"></div>
              
              <img 
                src="/src/assets/images/hero-1.png" 
                alt="Gaming Setup" 
                className="relative z-10 max-w-[110%] drop-shadow-[0_0_50px_rgba(0,255,255,0.4)] animate-[float_6s_ease-in-out_infinite]"
              />
              
              {/* Floating tech badges */}
              <div className="absolute top-10 right-10 glass-panel border border-primary/50 px-3 py-1 font-mono text-xs text-primary animate-flicker">RTX_4090_ENABLED</div>
              <div className="absolute bottom-20 left-10 glass-panel border border-secondary/50 px-3 py-1 font-mono text-xs text-secondary animate-pulse">240HZ_REFRESH</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 relative">
        <div className="neon-divider"></div>
        <div className="container mx-auto px-4 pt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="font-mono text-xs text-primary mb-2 tracking-widest">// DIRECTORY: MODULES</div>
              <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
                <Monitor className="text-primary" /> تسوق حسب القسم
              </h2>
            </div>
            <Link href="/categories" className="text-primary hover:text-primary/80 font-bold hidden sm:flex items-center gap-1 transition-colors font-mono uppercase tracking-widest text-sm">
              [ VIEW_ALL ] <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square glass-panel clip-corner rounded-none animate-pulse"></div>
              ))
            ) : categories?.slice(0, 6).map((category, index) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel border border-primary/20 clip-corner-sm p-6 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer h-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="w-16 h-16 clip-corner bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] transition-all relative z-10">
                    <Monitor size={28} />
                  </div>
                  <div className="text-center relative z-10">
                    <h3 className="font-bold text-sm md:text-base group-hover:text-primary group-hover:neon-text transition-all">{category.nameAr}</h3>
                    <span className="text-xs text-muted-foreground font-mono mt-1 block">{category.productCount} UNIT{category.productCount !== 1 ? 'S' : ''}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {(!flashDealsLoading && flashDeals && (flashDeals.products?.length ?? 0) > 0) && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-destructive/5 border-y border-destructive/20"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <div className="font-mono text-xs text-destructive mb-2 tracking-widest">// ACTIVE_PROTOCOL: BURNING_DEALS</div>
                <h2 className="text-3xl font-black text-destructive mb-2 flex items-center gap-2 glitch" data-text="عروض الحرق">
                  <Flame className="fill-current" /> عروض الحرق
                </h2>
                <p className="text-destructive/70 font-mono text-sm">خصومات هائلة لفترة محدودة، الحق قبل النفاذ!</p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm text-destructive uppercase tracking-widest font-mono hidden sm:inline-block">T-MINUS:</span>
                <Countdown endsAt={flashDeals.endsAt} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashDeals.products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link href="/deals" className="inline-flex items-center gap-2 border border-destructive bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-8 py-3 clip-corner font-bold transition-all glow-hover uppercase tracking-widest font-mono text-sm">
                [ LOAD_ALL_DEALS ] <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-20 relative">
        <div className="neon-divider"></div>
        <div className="container mx-auto px-4 pt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="font-mono text-xs text-secondary mb-2 tracking-widest">// TOP_TIER_EQUIPMENT</div>
              <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
                <Star className="text-secondary fill-current" /> الأكثر مبيعاً
              </h2>
              <p className="text-muted-foreground font-mono text-sm">المنتجات المفضلة لدى مجتمع اللاعبين</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellersLoading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : bestSellers?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="py-12 relative border-y border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-white/10">
            <div className="flex flex-col items-center text-center p-4">
              <ShieldCheck size={40} className="text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">ضمان حقيقي</h3>
              <p className="text-sm text-muted-foreground font-mono">تغطية شاملة لجميع المنتجات</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Zap size={40} className="text-secondary mb-4" />
              <h3 className="font-bold text-lg mb-2">شحن فائق السرعة</h3>
              <p className="text-sm text-muted-foreground font-mono">توصيل لجميع مناطق المملكة</p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <Monitor size={40} className="text-lime mb-4" />
              <h3 className="font-bold text-lg mb-2">دعم فني متخصص</h3>
              <p className="text-sm text-muted-foreground font-mono">فريق خبراء لخدمتك 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary/5 border-y border-secondary/20"></div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="font-mono text-xs text-secondary mb-4 tracking-widest">// CUSTOM_RIG_ASSEMBLY</div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              جمّع جهاز <span className="text-secondary neon-text-magenta glitch" data-text="أحلامك">أحلامك</span>
            </h2>
            
            <div className="glass-panel border-l-2 border-l-secondary p-6 mb-8 max-w-xl">
              <p className="text-lg text-muted-foreground leading-relaxed">
                استخدم أداة تجميع الكمبيوتر الذكية الخاصة بنا. تأكد من توافق القطع، احسب التكلفة، واحصل على جهازك مجمعاً وجاهزاً للعب.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/pc-builder" className="clip-corner bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 font-bold text-lg transition-all glow-hover-magenta flex items-center gap-2">
                [ INITIALIZE_BUILDER ] <Zap size={20} />
              </Link>
            </div>
          </div>
          <div className="flex-1 relative w-full flex justify-center">
            <div className="absolute w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse-glow"></div>
            <div className="hud-frame-magenta p-4 relative z-10">
              <img src="/src/assets/images/hero-2.png" alt="PC Build" className="w-full max-w-lg mx-auto border border-secondary/30 shadow-2xl mix-blend-screen" />
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
            // AUTHORIZED_VENDORS
          </h2>
        </div>
        
        <div className="relative flex overflow-x-hidden glass-panel border-y border-primary/20">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-8 px-8">
            {brandsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-32 h-12 bg-white/5 rounded-none animate-pulse inline-block mx-8 clip-corner-sm"></div>
              ))
            ) : brands?.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="inline-block mx-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300">
                <img src={brand.logo} alt={brand.nameEn} className="h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
              </Link>
            ))}
            {/* Duplicate for infinite effect */}
            {!brandsLoading && brands?.map((brand) => (
              <Link key={`${brand.id}-dup`} href={`/brands/${brand.slug}`} className="inline-block mx-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 transition-all duration-300">
                <img src={brand.logo} alt={brand.nameEn} className="h-12 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
