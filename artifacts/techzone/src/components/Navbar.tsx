import { Link } from "wouter";
import { ShoppingCart, Heart, Search, Menu, User, Monitor, X, Terminal } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.productIds.length);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-primary/20 neon-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 -ml-2 text-primary hover:text-primary transition-colors animate-pulse-glow"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Monitor className="text-primary h-8 w-8 group-hover:animate-flicker" />
          <span className="text-xl font-black tracking-wider text-primary neon-text uppercase glitch" data-text="TECHZONE">
            TECHZONE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold font-mono">
          <Link href="/categories" className="text-foreground hover:text-primary transition-colors hover:neon-text uppercase tracking-widest relative group">
            الأقسام
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/deals" className="text-secondary hover:text-secondary transition-colors neon-text-magenta uppercase tracking-widest relative group">
            عروض فلاش
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/pc-builder" className="text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-1 uppercase tracking-widest clip-tab bg-primary/10 px-3 py-1 border border-primary/30 glow-hover">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            تجميعة PC
          </Link>
          <Link href="/brands" className="text-foreground hover:text-primary transition-colors hover:neon-text uppercase tracking-widest relative group">
            الماركات
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/blog" className="text-foreground hover:text-primary transition-colors hover:neon-text uppercase tracking-widest relative group">
            المدونة
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-md relative clip-corner-sm group">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-primary">
            <Terminal size={16} />
            <span className="ml-1 font-mono text-primary animate-pulse">{">"}</span>
          </div>
          <input
            type="search"
            placeholder="ابحث في قاعدة البيانات..."
            className="w-full h-10 bg-background/50 border border-primary/30 pl-4 pr-12 text-sm font-mono text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-primary/30"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 group-hover:text-primary transition-colors" size={18} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/search" className="lg:hidden p-2 text-primary hover:text-primary/80 transition-colors">
            <Search size={20} />
          </Link>
          
          <Link href="/wishlist" className="p-2 text-foreground hover:text-secondary transition-colors relative group">
            <Heart size={20} className="group-hover:fill-secondary/20 group-hover:text-secondary" />
            {wishlistItemsCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-mono font-bold rounded-sm clip-corner-sm flex items-center justify-center animate-pulse-glow">
                {wishlistItemsCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="p-2 text-foreground hover:text-primary transition-colors relative group">
            <ShoppingCart size={20} className="group-hover:text-primary" />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-mono font-bold rounded-sm clip-corner-sm flex items-center justify-center animate-pulse-glow">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block w-px h-6 bg-primary/20 mx-1" />
          
          <button className="hidden sm:flex p-2 text-foreground hover:text-primary transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
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
              className="fixed top-0 right-0 h-full w-[80vw] max-w-sm glass-panel border-l border-primary/20 z-50 md:hidden flex flex-col font-mono"
            >
              <div className="p-4 border-b border-primary/20 flex items-center justify-between">
                <span className="text-xl font-black tracking-wider text-primary neon-text uppercase glitch" data-text="TECHZONE">
                  TECHZONE
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-primary hover:text-secondary transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-4 text-lg font-bold">
                <Link href="/" className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}الرئيسية</Link>
                <Link href="/categories" className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}الأقسام</Link>
                <Link href="/deals" className="text-secondary hover:neon-text-magenta transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}عروض فلاش</Link>
                <Link href="/pc-builder" className="text-primary hover:neon-text transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}تجميعة PC</Link>
                <Link href="/brands" className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}الماركات</Link>
                <Link href="/blog" className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}المدونة</Link>
                <Link href="/track-order" className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>{"> "}تتبع الطلب</Link>
              </div>
              <div className="mt-auto p-4 border-t border-primary/20 text-xs text-primary/50">
                // SYSTEM_STATUS: ONLINE
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
