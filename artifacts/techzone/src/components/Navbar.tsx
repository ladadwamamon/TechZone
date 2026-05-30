import { Link } from "wouter";
import { ShoppingCart, Heart, Search, Menu, User, Monitor } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.productIds.length);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Monitor className="text-primary h-8 w-8" />
          <span className="text-xl font-black tracking-wider text-foreground neon-text uppercase">
            TechZone
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">الأقسام</Link>
          <Link href="/deals" className="text-muted-foreground hover:text-primary transition-colors">عروض فلاش</Link>
          <Link href="/pc-builder" className="text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            تجميعة PC
          </Link>
          <Link href="/brands" className="text-muted-foreground hover:text-primary transition-colors">الماركات</Link>
          <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">المدونة</Link>
        </nav>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-md relative">
          <input
            type="search"
            placeholder="ابحث عن منتجات، ماركات..."
            className="w-full h-10 bg-white/5 border border-white/10 rounded-full pl-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/search" className="lg:hidden p-2 text-muted-foreground hover:text-primary transition-colors">
            <Search size={20} />
          </Link>
          
          <Link href="/wishlist" className="p-2 text-muted-foreground hover:text-primary transition-colors relative">
            <Heart size={20} />
            {wishlistItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistItemsCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="p-2 text-muted-foreground hover:text-primary transition-colors relative">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block w-px h-6 bg-white/10 mx-1" />
          
          <button className="hidden sm:flex p-2 text-muted-foreground hover:text-primary transition-colors">
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
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80vw] max-w-sm bg-background border-l border-white/10 z-50 md:hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-xl font-black tracking-wider text-foreground neon-text uppercase">
                  TechZone
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-4 text-lg font-medium">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>الرئيسية</Link>
                <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)}>الأقسام</Link>
                <Link href="/deals" className="text-secondary" onClick={() => setIsMobileMenuOpen(false)}>عروض فلاش</Link>
                <Link href="/pc-builder" className="text-primary" onClick={() => setIsMobileMenuOpen(false)}>تجميعة PC</Link>
                <Link href="/brands" onClick={() => setIsMobileMenuOpen(false)}>الماركات</Link>
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>المدونة</Link>
                <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)}>تتبع الطلب</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

// Need to add X to imports if missing
import { X } from "lucide-react";