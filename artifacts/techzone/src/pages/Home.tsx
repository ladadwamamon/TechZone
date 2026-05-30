import { Layout } from "@/components/Layout";
import { useGetFeaturedProducts, useGetBestSellers, useGetFlashDeals, useListCategories, useListBrands } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link } from "wouter";
import { ArrowLeft, Timer, Zap, Flame, Monitor, Cpu, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Countdown Timer Component
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
    <div className="flex gap-2 text-center dir-ltr" dir="ltr">
      <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-2 min-w-[60px]">
        <div className="text-xl font-bold text-destructive neon-text">{timeLeft.hours.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase">Hours</div>
      </div>
      <div className="text-2xl font-bold text-destructive/50 pt-1">:</div>
      <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-2 min-w-[60px]">
        <div className="text-xl font-bold text-destructive neon-text">{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase">Mins</div>
      </div>
      <div className="text-2xl font-bold text-destructive/50 pt-1">:</div>
      <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-2 min-w-[60px]">
        <div className="text-xl font-bold text-destructive neon-text">{timeLeft.seconds.toString().padStart(2, '0')}</div>
        <div className="text-[10px] text-destructive/80 uppercase">Secs</div>
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
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen opacity-50"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 h-full relative z-10 flex flex-col md:flex-row items-center justify-center pt-10">
          <div className="flex-1 text-center md:text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4">
                خصومات الصيف بدأت الآن ⚡️
              </span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                ارتقِ بمستوى <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary neon-text">
                  اللعب الخاص بك
                </span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-xl mx-auto md:mx-0">
                أقوى أجهزة الكمبيوتر، الشاشات، وملحقات الألعاب من أفضل الماركات العالمية في مكان واحد.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/categories" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-md font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 flex items-center justify-center gap-2">
                  تسوق الآن <ArrowLeft size={20} />
                </Link>
                <Link href="/pc-builder" className="bg-white/5 border border-white/10 hover:border-primary/50 text-foreground px-8 py-4 rounded-md font-bold text-lg transition-all hover:bg-white/10 flex items-center justify-center gap-2">
                  ابنِ جهازك <Cpu size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="flex-1 hidden md:block relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              {/* Fallback to our generated hero image */}
              <img 
                src="/src/assets/images/hero-1.png" 
                alt="Gaming Setup" 
                className="max-w-[120%] -mr-[10%] drop-shadow-[0_0_50px_rgba(0,255,255,0.3)] animate-[float_6s_ease-in-out_infinite]"
                style={{ filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.5))" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
                <Monitor className="text-primary" /> تسوق حسب القسم
              </h2>
              <p className="text-muted-foreground">اكتشف مجموعتنا الواسعة من منتجات الجيمنج</p>
            </div>
            <Link href="/categories" className="text-primary hover:text-primary/80 font-bold hidden sm:flex items-center gap-1 transition-colors">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-card border border-white/5 rounded-xl animate-pulse"></div>
              ))
            ) : categories?.slice(0, 6).map((category, index) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                    {/* Just using a generic icon based on name or generic if not mapped */}
                    <Monitor size={32} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-sm md:text-base group-hover:text-primary transition-colors">{category.nameAr}</h3>
                    <span className="text-xs text-muted-foreground">{category.productCount} منتج</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      {(!flashDealsLoading && flashDeals?.products?.length > 0) && (
        <section className="py-20 bg-card border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive to-transparent opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-black text-destructive mb-2 flex items-center gap-2 neon-text">
                  <Flame className="fill-current" /> عروض الحرق
                </h2>
                <p className="text-muted-foreground">خصومات هائلة لفترة محدودة، الحق قبل النفاذ!</p>
              </div>
              
              <div className="bg-background/50 backdrop-blur-sm border border-destructive/20 rounded-xl p-4 flex items-center gap-4">
                <span className="font-bold text-sm">ينتهي العرض خلال:</span>
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
              <Link href="/deals" className="inline-flex items-center gap-2 border border-destructive text-destructive hover:bg-destructive hover:text-white px-8 py-3 rounded-md font-bold transition-all">
                عرض جميع الخصومات <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-2">
                <Star className="text-secondary fill-current" /> الأكثر مبيعاً
              </h2>
              <p className="text-muted-foreground">المنتجات المفضلة لدى مجتمع اللاعبين</p>
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

      {/* Brands Marquee */}
      <section className="py-12 bg-white/5 border-y border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-widest">
            وكلاء معتمدون لأفضل الماركات
          </h2>
        </div>
        
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 py-4 px-8">
            {brandsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-32 h-12 bg-white/10 rounded animate-pulse inline-block mx-8"></div>
              ))
            ) : brands?.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="inline-block mx-8 grayscale hover:grayscale-0 hover:scale-110 transition-all opacity-50 hover:opacity-100">
                <img src={brand.logo} alt={brand.nameEn} className="h-12 object-contain" />
              </Link>
            ))}
            {/* Duplicate for infinite effect */}
            {!brandsLoading && brands?.map((brand) => (
              <Link key={`${brand.id}-dup`} href={`/brands/${brand.slug}`} className="inline-block mx-8 grayscale hover:grayscale-0 hover:scale-110 transition-all opacity-50 hover:opacity-100">
                <img src={brand.logo} alt={brand.nameEn} className="h-12 object-contain" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-background to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              جمّع جهاز <span className="text-primary neon-text">أحلامك</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              استخدم أداة تجميع الكمبيوتر الذكية الخاصة بنا. تأكد من توافق القطع، احسب التكلفة، واحصل على جهازك مجمعاً وجاهزاً للعب.
            </p>
            <Link href="/pc-builder" className="inline-flex bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-md font-bold text-lg transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] items-center gap-2">
              ابدأ التجميع الآن <Zap size={20} />
            </Link>
          </div>
          <div className="flex-1">
            {/* Fallback generated image */}
            <img src="/src/assets/images/hero-2.png" alt="PC Build" className="w-full max-w-lg mx-auto rounded-2xl border border-white/10 shadow-2xl mix-blend-screen" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
