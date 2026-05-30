import { Layout } from "@/components/Layout";
import { useListProducts, useGetCategory } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link, useParams } from "wouter";
import { ChevronLeft, SlidersHorizontal, LayoutGrid, List, Monitor } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useGetCategory(slug || "");
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { data: productsData, isLoading: productsLoading } = useListProducts({
    category: slug,
    sort: sort as any,
    limit: 20
  });

  return (
    <Layout>
      <div className="bg-card border-b border-white/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ChevronLeft size={14} />
            <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
            <ChevronLeft size={14} />
            <span className="text-foreground">{category?.nameAr || "جاري التحميل..."}</span>
          </div>
          
          {categoryLoading ? (
            <div className="h-10 w-48 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-black neon-text text-primary">{category?.nameAr}</h1>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className={`w-full lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-white/5 rounded-xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary" /> الفلاتر
                </h3>
                <button 
                  className="lg:hidden text-muted-foreground"
                  onClick={() => setShowFilters(false)}
                >
                  إغلاق
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="font-semibold mb-4 text-sm">نطاق السعر</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="من" 
                      className="w-full bg-background border border-white/10 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="إلى" 
                      className="w-full bg-background border border-white/10 rounded px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <button className="w-full bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded py-1 text-sm transition-colors">
                    تطبيق السعر
                  </button>
                </div>
              </div>

              {/* In Stock */}
              <div className="mb-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:text-primary transition-colors">متوفر في المخزن فقط</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-card border border-white/5 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <button 
                className="lg:hidden flex items-center gap-2 border border-white/10 rounded px-4 py-2 text-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> فلاتر
              </button>

              <div className="text-sm text-muted-foreground">
                عرض {productsData?.products.length || 0} من {productsData?.total || 0} منتج
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <select 
                  className="bg-background border border-white/10 rounded px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً</option>
                </select>

                <div className="hidden sm:flex items-center bg-background border border-white/10 rounded overflow-hidden">
                  <button 
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
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
              <div className="bg-card border border-white/5 rounded-xl p-12 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-muted-foreground mb-4">
                  <Monitor size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                <p className="text-muted-foreground mb-6">لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.</p>
                <button 
                  onClick={() => { setSort("newest"); }}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-bold"
                >
                  إعادة ضبط الفلاتر
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
