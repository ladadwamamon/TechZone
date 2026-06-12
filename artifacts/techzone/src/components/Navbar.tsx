import { Link, useLocation } from "wouter";
import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  User,
  Monitor,
  X,
  Terminal,
  ChevronDown,
  Zap,
  Cpu,
  Tag,
  Newspaper,
  PackageSearch,
  LogOut,
  Package,
  UserPlus,
  LogIn,
  Gift,
  Crown,
} from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useListCategories, useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_GROUPS, CATEGORY_NAMES_AR, getCategoryIcon } from "@/lib/categoryMeta";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useNavLinks } from "@/lib/nav";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface CategoryLite {
  id: string;
  slug: string;
  nameAr: string;
  productCount: number;
}

const LINK_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "/deals": { icon: Zap, tone: "text-destructive" },
  "/pc-builder": { icon: Cpu, tone: "text-secondary" },
  "/brands": { icon: Tag, tone: "text-foreground" },
  "/blog": { icon: Newspaper, tone: "text-foreground" },
  "/track-order": { icon: PackageSearch, tone: "text-foreground" },
  "/gift-cards": { icon: Gift, tone: "text-foreground" },
  "/subscriptions": { icon: Crown, tone: "text-foreground" },
};

function linkMeta(href: string) {
  return LINK_META[href] ?? { icon: Terminal, tone: "text-foreground" };
}

export function Navbar() {
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.productIds.length);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [, navigate] = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const quickLinks = useNavLinks("header");

  const cartControls = useAnimationControls();
  const [cartBurst, setCartBurst] = useState(0);

  useEffect(() => {
    const onBump = () => {
      void cartControls.start({
        scale: [1, 1.45, 0.88, 1.18, 1],
        transition: { duration: 0.6, ease: "easeInOut" },
      });
      setCartBurst((b) => b + 1);
    };
    window.addEventListener("cart-bump", onBump);
    return () => window.removeEventListener("cart-bump", onBump);
  }, [cartControls]);

  const openAccount = () => {
    if (accountTimer.current) clearTimeout(accountTimer.current);
    setAccountOpen(true);
  };
  const closeAccount = () => {
    accountTimer.current = setTimeout(() => setAccountOpen(false), 120);
  };
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("تم تسجيل الخروج");
      navigate("/");
    } catch {
      toast.error("تعذر تسجيل الخروج");
    }
    setAccountOpen(false);
    setIsMobileMenuOpen(false);
  };

  const { data: categories } = useListCategories();
  const catMap = new Map<string, CategoryLite>();
  (categories as CategoryLite[] | undefined)?.forEach((c) => catMap.set(c.slug, c));

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchValue.trim()), 250);
    return () => clearTimeout(t);
  }, [searchValue]);

  const suggestParams = { search: debouncedSearch, limit: 6 };
  const { data: suggestData } = useListProducts(suggestParams, {
    query: { queryKey: getListProductsQueryKey(suggestParams), enabled: debouncedSearch.length >= 2 },
  });
  const suggestions = debouncedSearch.length >= 2 ? suggestData?.products ?? [] : [];
  const showSuggestions = searchFocused && suggestions.length > 0;

  const goToProduct = (id: string) => {
    setSearchFocused(false);
    setSearchValue("");
    navigate(`/products/${id}`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    setSearchFocused(false);
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-primary/20 neon-border">
      {/* Top bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          className="md:hidden p-2 -ml-2 text-primary hover:text-primary transition-colors animate-pulse-glow"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="القائمة"
        >
          <Menu size={24} />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Monitor className="text-primary h-8 w-8 group-hover:animate-flicker" />
          <span className="text-xl font-black tracking-wider text-primary neon-text uppercase glitch" data-text="NEXUS">
            NEXUS
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={submitSearch} className="hidden lg:flex flex-1 max-w-md relative clip-corner-sm group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-primary">
            <Terminal size={16} />
            <span className="ml-1 font-mono text-primary animate-pulse">{">"}</span>
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="ابحث في قاعدة البيانات..."
            className="w-full h-10 bg-background/50 border border-primary/30 pl-4 pr-12 text-sm font-mono text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-primary/30"
          />
          <button type="submit" aria-label="بحث" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 group-hover:text-primary transition-colors">
            <Search size={18} />
          </button>

          {showSuggestions && (
            <div className="absolute top-full mt-2 right-0 left-0 z-50 glass-panel border border-primary/30 neon-border clip-corner-sm max-h-96 overflow-auto">
              <div className="px-3 py-2 text-[10px] font-mono text-primary/40 uppercase border-b border-primary/15">
                {"//"} نتائج_مطابقة
              </div>
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToProduct(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-right hover:bg-primary/10 transition-colors border-b border-primary/10 last:border-0"
                >
                  <img src={p.image} alt={p.nameAr} className="w-10 h-10 object-cover border border-primary/20 shrink-0" loading="lazy" />
                  <span className="flex-1 text-xs text-foreground/90 line-clamp-2">{p.nameAr}</span>
                  <span className="text-xs font-mono text-primary shrink-0">{formatPrice(p.price)}</span>
                </button>
              ))}
              <button
                type="submit"
                className="w-full px-3 py-2 text-center text-[11px] font-mono text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors uppercase"
              >
                عرض كل النتائج {">"}
              </button>
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/search" className="lg:hidden p-2 text-primary hover:text-primary/80 transition-colors" aria-label="بحث">
            <Search size={20} />
          </Link>

          <Link href="/wishlist" className="p-2 text-foreground hover:text-secondary transition-colors relative group" aria-label="المفضلة">
            <Heart size={20} className="group-hover:fill-secondary/20 group-hover:text-secondary" />
            {wishlistItemsCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-mono font-bold rounded-sm clip-corner-sm flex items-center justify-center animate-pulse-glow">
                {wishlistItemsCount}
              </span>
            )}
          </Link>

          <Link id="nav-cart-icon" href="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative group" aria-label="السلة">
            <motion.span animate={cartControls} className="inline-block">
              <ShoppingCart size={20} className="group-hover:text-primary" />
            </motion.span>
            <AnimatePresence>
              {cartBurst > 0 && (
                <motion.span
                  key={cartBurst}
                  initial={{ scale: 0.4, opacity: 0.85 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-1 rounded-sm border border-primary pointer-events-none"
                  style={{ boxShadow: "0 0 14px var(--cyan)" }}
                />
              )}
            </AnimatePresence>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-mono font-bold rounded-sm clip-corner-sm flex items-center justify-center animate-pulse-glow">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block w-px h-6 bg-primary/20 mx-1" />

          <div className="hidden sm:block relative" onMouseEnter={openAccount} onMouseLeave={closeAccount}>
            <button
              className={`flex items-center gap-1.5 p-2 transition-colors ${accountOpen ? "text-primary" : "text-foreground hover:text-primary"}`}
              aria-label="الحساب"
              aria-expanded={accountOpen}
              onClick={() => {
                if (isAuthenticated) {
                  setAccountOpen((v) => !v);
                } else {
                  navigate("/login");
                }
              }}
            >
              <User size={20} />
              {isAuthenticated && (
                <span className="hidden lg:inline max-w-[100px] truncate text-sm font-bold">{customer?.fullName}</span>
              )}
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 mt-1 w-56 glass-panel border border-primary/30 neon-border shadow-2xl z-50 font-mono"
                >
                  {isAuthenticated ? (
                    <div className="flex flex-col">
                      <div className="px-4 py-3 border-b border-primary/15">
                        <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-1">// USER</div>
                        <div className="text-sm font-bold text-foreground truncate">{customer?.fullName}</div>
                        <div className="text-xs text-muted-foreground truncate" dir="ltr">{customer?.email}</div>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground/90 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <User size={16} />
                        حسابي
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground/90 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Package size={16} />
                        طلباتي
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors border-t border-primary/15 text-right"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground/90 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <LogIn size={16} />
                        تسجيل الدخول
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground/90 hover:bg-secondary/10 hover:text-secondary transition-colors border-t border-primary/15"
                      >
                        <UserPlus size={16} />
                        إنشاء حساب
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom nav row (desktop) */}
      <div className="hidden md:block border-t border-primary/10 bg-background/40">
        <div className="container mx-auto px-4 h-11 flex items-center gap-1 font-mono text-sm">
          {/* All categories trigger */}
          <div className="relative h-full" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button
              className={`h-full flex items-center gap-2 px-4 font-bold uppercase tracking-widest border-x border-primary/20 transition-colors ${
                megaOpen ? "bg-primary text-background" : "text-primary hover:bg-primary/10"
              }`}
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
            >
              <Menu size={16} />
              كل الأقسام
              <ChevronDown size={14} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full right-0 mt-px w-[min(92vw,1100px)] glass-panel border border-primary/30 neon-border shadow-2xl z-50"
                >
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-primary/10">
                    {CATEGORY_GROUPS.map((group) => (
                      <div key={group.code} className="bg-background/95 p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                          <h3 className="font-bold text-base text-foreground">{group.title}</h3>
                          <span className="font-mono text-xs text-primary/40">{group.code}</span>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {group.slugs.map((slug) => {
                            const Icon = getCategoryIcon(slug);
                            const cat = catMap.get(slug);
                            const count = cat?.productCount ?? 0;
                            return (
                              <li key={slug}>
                                <Link
                                  href={`/categories/${slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="group flex items-center gap-2.5 px-2 py-2 hover:bg-primary/10 transition-colors clip-corner-sm"
                                >
                                  <span className="w-9 h-9 flex items-center justify-center text-primary/70 group-hover:text-primary border border-primary/20 group-hover:border-primary/50 transition-colors shrink-0">
                                    <Icon size={18} />
                                  </span>
                                  <span className="text-sm text-foreground/90 group-hover:text-primary transition-colors flex-1">
                                    {cat?.nameAr ?? CATEGORY_NAMES_AR[slug] ?? slug}
                                  </span>
                                  {count > 0 && (
                                    <span className="font-mono text-xs text-muted-foreground/60">{count}</span>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 border-t border-primary/15 bg-background/95">
                    <span className="font-mono text-[10px] text-primary/50">// {catMap.size} MODULES_ONLINE</span>
                    <Link href="/categories" onClick={() => setMegaOpen(false)} className="font-mono text-xs text-primary hover:neon-text">
                      [ عرض كل الأقسام ]
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick links */}
          <nav className="flex items-center gap-1 px-2">
            {quickLinks.map((link) => {
              const { icon: Icon, tone } = linkMeta(link.href);
              const external = link.opensNewTab || /^https?:\/\//.test(link.href);
              const cls = `flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider text-xs font-bold hover:bg-white/5 transition-colors ${tone} hover:text-primary`;
              return external ? (
                <a key={link.href} href={link.href} target={link.opensNewTab ? "_blank" : undefined} rel="noreferrer" className={cls}>
                  <Icon size={14} />
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={cls}>
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mr-auto flex items-center gap-2 font-mono text-[10px] text-lime/70">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse-glow" />
            SYSTEM_ONLINE
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay — portaled to body to escape the header's backdrop-filter containing block */}
      {createPortal(
        <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-sm glass-panel border-l border-primary/20 z-50 md:hidden flex flex-col font-mono overflow-y-auto"
            >
              <div className="p-4 border-b border-primary/20 flex items-center justify-between sticky top-0 bg-background/95 z-10">
                <span className="text-xl font-black tracking-wider text-primary neon-text uppercase glitch" data-text="NEXUS">
                  NEXUS
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-primary hover:text-secondary transition-colors" aria-label="إغلاق">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={submitSearch} className="p-4 border-b border-primary/15">
                <div className="relative">
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="ابحث..."
                    className="w-full h-10 bg-background/50 border border-primary/30 px-3 text-sm text-primary focus:outline-none focus:border-primary"
                  />
                  <button type="submit" aria-label="بحث" className="absolute left-2 top-1/2 -translate-y-1/2 text-primary/60">
                    <Search size={18} />
                  </button>
                </div>
              </form>

              <div className="p-4 flex flex-col gap-2 text-sm font-bold border-b border-primary/15">
                {isAuthenticated ? (
                  <>
                    <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-1">// {customer?.fullName}</div>
                    <Link
                      href="/account"
                      className="text-primary hover:text-secondary transition-colors py-1 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User size={16} /> حسابي
                    </Link>
                    <Link
                      href="/account"
                      className="text-primary hover:text-secondary transition-colors py-1 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Package size={16} /> طلباتي
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-destructive hover:text-destructive/80 transition-colors py-1 flex items-center gap-2 text-right"
                    >
                      <LogOut size={16} /> تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-primary hover:text-secondary transition-colors py-1 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn size={16} /> تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      className="text-secondary hover:text-primary transition-colors py-1 flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus size={16} /> إنشاء حساب
                    </Link>
                  </>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2 text-sm font-bold border-b border-primary/15">
                {quickLinks.map((link) => {
                  const { tone } = linkMeta(link.href);
                  const external = link.opensNewTab || /^https?:\/\//.test(link.href);
                  const cls = `${tone} hover:text-primary transition-colors py-1`;
                  return external ? (
                    <a key={link.href} href={link.href} target={link.opensNewTab ? "_blank" : undefined} rel="noreferrer" className={cls} onClick={() => setIsMobileMenuOpen(false)}>
                      {"> "}
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.href} href={link.href} className={cls} onClick={() => setIsMobileMenuOpen(false)}>
                      {"> "}
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 flex flex-col gap-4">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.code}>
                    <h3 className="text-xs uppercase tracking-widest text-primary/60 mb-2">{group.title}</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {group.slugs.map((slug) => {
                        const Icon = getCategoryIcon(slug);
                        const cat = catMap.get(slug);
                        return (
                          <Link
                            key={slug}
                            href={`/categories/${slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-2 py-2 text-xs text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Icon size={14} className="text-primary/60 shrink-0" />
                            <span className="truncate">{cat?.nameAr ?? CATEGORY_NAMES_AR[slug] ?? slug}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto p-4 border-t border-primary/20 text-xs text-primary/50">
                // SYSTEM_STATUS: ONLINE
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </header>
  );
}
