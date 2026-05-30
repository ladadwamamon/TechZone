import { Layout } from "@/components/Layout";
import { useGetBrand, useListProducts } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link, useParams } from "wouter";
import { Globe, PackageOpen } from "lucide-react";
import { useState } from "react";

export default function BrandDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: brand, isLoading: brandLoading } = useGetBrand(slug || "");
  const [sort, setSort] = useState("newest");

  const { data: productsData, isLoading: productsLoading } = useListProducts({
    brand: slug,
    sort: sort as any,
    limit: 24
  });

  return (
    <Layout>
      <div className="border-b border-primary/30 relative overflow-hidden glass-panel min-h-[300px] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        {/* Abstract background logo pattern */}
        {brand?.logo && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-5 pointer-events-none select-none blur-sm">
            <img src={brand.logo} alt="" className="w-full h-full object-contain mix-blend-screen" />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-8 uppercase">
            <Link href="/" className="hover:text-secondary transition-colors">ROOT</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/brands" className="hover:text-secondary transition-colors">BRANDS</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{brand?.slug || "LOADING..."}</span>
          </div>

          {brandLoading ? (
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 bg-primary/10 clip-corner animate-pulse" />
              <div className="space-y-4">
                <div className="w-64 h-10 bg-primary/20 clip-corner animate-pulse" />
                <div className="w-48 h-4 bg-primary/10 clip-corner animate-pulse" />
              </div>
            </div>
          ) : brand ? (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-48 h-48 shrink-0 bg-background/50 border border-primary/30 clip-corner p-6 flex items-center justify-center hud-frame glow-hover">
                <img 
                  src={brand.logo} 
                  alt={brand.nameEn} 
                  className="max-w-full max-h-full object-contain mix-blend-screen filter drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                />
              </div>
              <div className="flex-1 text-center md:text-right flex flex-col md:items-start h-full justify-center">
                <h1 className="text-4xl md:text-6xl font-black font-mono uppercase neon-text mb-4 text-primary">
                  {brand.nameEn}
                </h1>
                {brand.descriptionAr && (
                  <p className="text-muted-foreground mb-6 max-w-2xl leading-relaxed text-sm md:text-base">
                    {brand.descriptionAr}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-auto">
                  <div className="bg-primary/10 border border-primary/30 clip-corner-sm px-4 py-2 font-mono text-xs flex items-center gap-2 text-primary uppercase">
                    <PackageOpen size={14} />
                    {brand.productCount} PRODUCTS_AVAILABLE
                  </div>
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noreferrer" className="bg-background border border-primary/30 hover:border-primary clip-corner-sm px-4 py-2 font-mono text-xs flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors uppercase">
                      <Globe size={14} />
                      OFFICIAL_SITE
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-destructive font-mono text-xl">{"// ERR_BRAND_NOT_FOUND"}</div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-primary/20 pb-4">
          <h2 className="text-2xl font-mono uppercase text-foreground">
            <span className="text-primary neon-text mr-2">{">"}</span> 
            HARDWARE_ARCHIVE
          </h2>
          <select 
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-card glass-panel clip-corner-sm border border-primary/30 px-4 py-2 text-sm focus:border-primary focus:outline-none font-mono text-foreground appearance-none uppercase"
          >
            <option value="newest">SORT: NEWEST</option>
            <option value="price_asc">SORT: LOWEST_PRICE</option>
            <option value="price_desc">SORT: HIGHEST_PRICE</option>
            <option value="rating">SORT: HIGHEST_RATED</option>
          </select>
        </div>

        {productsLoading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : productsData?.products && productsData.products.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productsData.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-muted-foreground font-mono flex flex-col items-center">
            <PackageOpen size={48} className="text-primary/30 mb-4" />
            <div className="text-lg mb-2 text-foreground">{"// NO_PRODUCTS_FOUND"}</div>
            <p>لا توجد منتجات متاحة حالياً لهذه الماركة.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}