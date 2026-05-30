import { Layout } from "@/components/Layout";
import { useGetFlashDeals, useListProducts } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Timer, Zap, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Deals() {
  const { data: flashDeals, isLoading: dealsLoading } = useGetFlashDeals();
  const { data: moreDeals, isLoading: moreLoading } = useListProducts({ limit: 12 });
  
  const [timeLeft, setTimeLeft] = useState<{ hours: string, minutes: string, seconds: string } | null>(null);

  useEffect(() => {
    if (!flashDeals?.endsAt) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(flashDeals.endsAt).getTime() - new Date().getTime();
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      } else {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [flashDeals?.endsAt]);

  return (
    <Layout>
      <div className="border-b border-destructive/30 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-destructive/10 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-destructive font-mono mb-4">
              <Link href="/" className="hover:text-primary transition-colors uppercase">ROOT</Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground truncate uppercase text-destructive">FLASH_DEALS</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black neon-text-magenta text-secondary uppercase flex items-center gap-4">
              <Flame size={40} className="text-destructive animate-pulse" />
              عروض فلاش
            </h1>
            <p className="mt-2 text-muted-foreground font-mono text-sm max-w-xl">
              {"// "} خصومات هائلة لفترة محدودة. اغتنم الفرصة قبل انتهاء الوقت!
            </p>
          </div>

          {timeLeft && (
            <div className="glass-panel border-destructive/50 clip-corner p-4 flex flex-col items-center min-w-[280px]">
              <div className="flex items-center gap-2 text-destructive font-mono font-bold mb-2 uppercase text-sm">
                <Timer size={16} /> [ TIME_REMAINING ]
              </div>
              <div className="flex items-center gap-4 text-3xl font-black font-mono neon-text-lime text-lime" dir="ltr">
                <div className="flex flex-col items-center">
                  <span>{timeLeft.hours}</span>
                  <span className="text-[10px] text-lime/50 uppercase">HRS</span>
                </div>
                <span className="text-destructive animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.minutes}</span>
                  <span className="text-[10px] text-lime/50 uppercase">MIN</span>
                </div>
                <span className="text-destructive animate-pulse">:</span>
                <div className="flex flex-col items-center">
                  <span>{timeLeft.seconds}</span>
                  <span className="text-[10px] text-lime/50 uppercase">SEC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-3 border-b border-destructive/20 pb-4">
          <Zap className="text-secondary" />
          <h2 className="text-2xl font-bold font-mono uppercase text-secondary neon-text-magenta">
            {">"} BURNING_DEALS
          </h2>
        </div>
        
        {dealsLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : flashDeals?.products && flashDeals.products.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {flashDeals.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-muted-foreground font-mono">
            {"// "} NO_ACTIVE_FLASH_DEALS
          </div>
        )}

        <div className="mt-16 mb-8 flex items-center gap-3 border-b border-primary/20 pb-4">
          <h2 className="text-2xl font-bold font-mono uppercase text-primary neon-text">
            {">"} MORE_DISCOUNTS
          </h2>
        </div>

        {moreLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : moreDeals?.products && moreDeals.products.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {moreDeals.products.filter(p => p.originalPrice).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-muted-foreground font-mono">
            {"// "} MORE_DEALS_LOADING_ERR
          </div>
        )}
      </div>
    </Layout>
  );
}