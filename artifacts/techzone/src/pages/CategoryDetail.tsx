import { Layout } from "@/components/Layout";
import { useListProducts, useGetCategory } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link, useParams } from "wouter";
import { ChevronLeft, SlidersHorizontal, LayoutGrid, List, Monitor } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useGetCategory(slug || "");
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("newest");
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStock, setInStock] = useState(false);

  const applyPriceRange = () => {
    const min = draftMin.trim() === "" ? undefined : Number(draftMin);
    const max = draftMax.trim() === "" ? undefined : Number(draftMax);
    setMinPrice(min !== undefined && !Number.isNaN(min) ? min : undefined);
    setMaxPrice(max !== undefined && !Number.isNaN(max) ? max : undefined);
  };

  const resetFilters = () => {
    setSort("newest");
    setDraftMin("");
    setDraftMax("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStock(false);
  };

  const { data: productsData, isLoading: productsLoading } = useListProducts({
    category: slug,
    sort: sort as any,
    limit: 20,
    minPrice,
    maxPrice,
    inStock: inStock || undefined,
  });

  const helmetTitle = category?.metaTitle || category?.nameAr || "نكسس";
  const helmetDesc = category?.metaDescription || category?.descriptionAr || "منتجات إلكترونيات وقطع كمبيوتر وألعاب من Nexus Store";
  const helmetKeywords = category?.metaKeywords || "نكسس, إلكترونيات, كمبيوتر, ألعاب";

  return (
    <Layout>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={helmetDesc} />
        <meta name="keywords" content={helmetKeywords} />
        <meta property="og:title" content={helmetTitle} />
        <meta property="og:description" content={helmetDesc} />
      </Helmet>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-secondary transition-colors uppercase">CATEGORIES</Link>
            <span>/</span>
            <span className="text-foreground truncate uppercase">{category?.slug || "LOADING..."}</span>
          </div>
          
          {categoryLoading ? (
            <div className="h-10 w-48 bg-primary/20 clip-corner animate-pulse"></div>
          ) : (
            <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text={category?.nameAr}>{category?.nameAr}</h1>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className={`w-full lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass-panel clip-corner hud-frame p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-primary/30 pb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-primary neon-text font-mono uppercase">
                  <SlidersHorizontal size={18} /> // FILTERS
                </h3>
                <button 
                  className="lg:hidden text-muted-foreground hover:text-destructive font-mono text-sm uppercase"
                  onClick={() => setShowFilters(false)}
                >
                  [ CLOSE ]
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-sm font-mono text-foreground uppercase">{">"} PRICE_RANGE</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="MIN" 
                      value={draftMin}
                      onChange={(e) => setDraftMin(e.target.value)}
                      className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors"
                    />
                    <input 
                      type="number" 
                      placeholder="MAX" 
                      value={draftMax}
                      onChange={(e) => setDraftMax(e.target.value)}
                      className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <button onClick={applyPriceRange} className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary clip-corner py-2 text-sm font-bold font-mono transition-all uppercase tracking-widest glow-hover">
                    Apply_Range
                  </button>
                </div>
              </div>

              {/* In Stock */}
              <div className="mb-8 p-4 border border-lime/30 bg-lime/5 clip-corner-sm">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                    <div className="w-5 h-5 border-2 border-lime/50 rounded-none peer-checked:bg-lime peer-checked:border-lime transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-mono text-lime group-hover:text-lime-foreground transition-colors uppercase">[ IN_STOCK_ONLY ]</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="glass-panel clip-corner border-primary/20 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <button 
                className="lg:hidden flex items-center gap-2 border border-primary/40 rounded-none clip-corner-sm px-4 py-2 text-sm font-mono text-primary hover:bg-primary/20 transition-colors uppercase"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> [ FILTERS ]
              </button>

              <div className="text-sm font-mono text-primary uppercase">
                SYS.MATCH: {productsData?.products.length || 0} / {productsData?.total || 0}
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <select 
                  className="bg-card glass-panel clip-corner-sm border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono text-foreground appearance-none uppercase"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">SORT: NEWEST</option>
                  <option value="price_asc">SORT: PRICE ASC</option>
                  <option value="price_desc">SORT: PRICE DESC</option>
                  <option value="rating">SORT: TOP RATED</option>
                </select>

                <div className="hidden sm:flex items-center glass-panel clip-corner-sm border border-primary/30 overflow-hidden">
                  <button 
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/20'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/20'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {productsLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : productsData?.products.length === 0 ? (
              <div className="glass-panel clip-corner hud-frame p-12 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-primary/10 clip-corner flex items-center justify-center text-primary mb-4 neon-border">
                  <Monitor size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2 font-mono uppercase neon-text">{">"} NO_RESULTS_FOUND</h3>
                <p className="text-muted-foreground mb-6 font-mono text-sm">// لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.</p>
                <button 
                  onClick={resetFilters}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 px-6 transition-all glow-hover uppercase tracking-wide font-mono text-sm"
                >
                  [ RESET_FILTERS ]
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                <AnimatePresence>
                  {productsData?.products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={viewMode === 'list' ? 'sm:col-span-2 lg:col-span-3' : ''}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
