import { Layout } from "@/components/Layout";
import { useListProducts, useListCategories, useListBrands } from "@workspace/api-client-react";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Link, useLocation, useSearch } from "wouter";
import { Search as SearchIcon, SlidersHorizontal, Terminal } from "lucide-react";
import { useState, useEffect } from "react";

export default function Search() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const q = searchParams.get("q") || "";
  
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState(q);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  
  const [showFilters, setShowFilters] = useState(false);

  const { data: productsData, isLoading } = useListProducts({
    search: q,
    category: category || undefined,
    brand: brand || undefined,
    sort: sort as any,
    inStock: inStock ? true : undefined,
    limit: 24
  });

  const { data: categories } = useListCategories();
  const { data: brands } = useListBrands();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("q", searchInput);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (inStock) params.set("inStock", "true");
    
    setLocation(`/search?${params.toString()}`);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (searchInput) params.set("q", searchInput);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (inStock) params.set("inStock", "true");
    
    setLocation(`/search?${params.toString()}`);
  };

  // Rehydrate local state from the URL (e.g. browser back/forward or external navigation)
  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "");
    setBrand(searchParams.get("brand") || "");
    setSort(searchParams.get("sort") || "newest");
    setInStock(searchParams.get("inStock") === "true");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchString]);

  // Push filter changes back to the URL, but only if they differ from it
  useEffect(() => {
    if (category !== (searchParams.get("category") || "") ||
        brand !== (searchParams.get("brand") || "") ||
        sort !== (searchParams.get("sort") || "newest") ||
        inStock !== (searchParams.get("inStock") === "true")) {
      handleFilterChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, brand, sort, inStock]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 relative">
        <form onSubmit={handleSearch} className="mb-8 relative z-10 max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
              <SearchIcon size={20} />
            </div>
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="SEARCH_QUERY..."
              className="w-full bg-background/80 border-2 border-primary/50 text-foreground py-4 pl-12 pr-4 clip-corner focus:outline-none focus:border-primary focus:shadow-[0_0_15px_var(--cyan)] transition-all font-mono placeholder:text-muted-foreground/50 text-lg"
              dir="auto"
            />
            <button 
              type="submit"
              className="absolute inset-y-2 right-2 bg-primary/20 hover:bg-primary text-primary hover:text-background border border-primary px-6 clip-corner-sm font-bold font-mono transition-colors uppercase text-sm flex items-center gap-2"
            >
              [ EXECUTE ]
            </button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <aside className={`w-full lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass-panel clip-corner hud-frame p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-primary/30 pb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-primary neon-text font-mono uppercase">
                  <SlidersHorizontal size={18} /> // FILTERS
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-sm uppercase text-muted-foreground mb-2">{">"} CATEGORY</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">ALL_CATEGORIES</option>
                    {categories?.map(c => (
                      <option key={c.slug} value={c.slug}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-sm uppercase text-muted-foreground mb-2">{">"} BRAND</label>
                  <select 
                    value={brand} 
                    onChange={e => setBrand(e.target.value)}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">ALL_BRANDS</option>
                    {brands?.map(b => (
                      <option key={b.slug} value={b.slug}>{b.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 border border-lime/30 bg-lime/5 clip-corner-sm mt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={inStock}
                        onChange={e => setInStock(e.target.checked)}
                        className="peer sr-only" 
                      />
                      <div className="w-5 h-5 border-2 border-lime/50 rounded-none peer-checked:bg-lime peer-checked:border-lime transition-colors"></div>
                      <svg className="absolute w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-mono text-lime group-hover:text-lime-foreground transition-colors uppercase">[ IN_STOCK_ONLY ]</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6 glass-panel border border-primary/20 p-4 clip-corner-sm">
              <button 
                className="lg:hidden flex items-center gap-2 border border-primary/40 rounded-none clip-corner-sm px-4 py-2 text-sm font-mono text-primary hover:bg-primary/20 transition-colors uppercase"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> [ FILTERS ]
              </button>
              
              <div className="font-mono text-sm text-primary uppercase flex items-center gap-2">
                <Terminal size={16} /> 
                {isLoading ? "SCANNING..." : `FOUND: ${productsData?.total || 0} MATCHES`}
              </div>

              <select 
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-card glass-panel clip-corner-sm border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono text-foreground appearance-none uppercase"
              >
                <option value="newest">SORT: NEWEST</option>
                <option value="price_asc">SORT: PRICE_ASC</option>
                <option value="price_desc">SORT: PRICE_DESC</option>
                <option value="rating">SORT: TOP_RATED</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : productsData?.products && productsData.products.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {productsData.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass-panel hud-frame clip-corner p-16 flex flex-col items-center justify-center text-center border-dashed">
                <SearchIcon size={48} className="text-primary/30 mb-4" />
                <h2 className="text-2xl font-mono text-primary uppercase neon-text mb-2">0 RESULTS FOUND</h2>
                <p className="text-muted-foreground font-mono text-sm max-w-md">
                  {"// "} لم يتم العثور على أي منتجات تطابق بحثك. جرب استخدام كلمات مختلفة أو قم بإزالة بعض الفلاتر.
                </p>
                <button 
                  onClick={() => {
                    setCategory("");
                    setBrand("");
                    setSearchInput("");
                    setSort("newest");
                    setInStock(false);
                    setLocation("/search");
                  }}
                  className="mt-8 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-background font-mono px-6 py-2 clip-corner uppercase transition-all"
                >
                  [ CLEAR_FILTERS ]
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}