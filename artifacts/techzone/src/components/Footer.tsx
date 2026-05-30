import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Monitor } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Monitor className="text-primary h-8 w-8" />
              <span className="text-2xl font-black tracking-wider text-foreground neon-text uppercase">
                TechZone
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              متجر TechZone هو وجهتك الأولى لكل ما يخص عالم الجيمنج والإلكترونيات. نوفر لك أفضل القطع وأحدث التجميعات بأسعار تنافسية.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6 relative inline-block">
              روابط سريعة
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">اتصل بنا</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">المدونة</Link></li>
              <li><Link href="/track-order" className="hover:text-primary transition-colors">تتبع طلبك</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6 relative inline-block">
              الأقسام
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/categories/components" className="hover:text-primary transition-colors">قطع الكمبيوتر</Link></li>
              <li><Link href="/categories/laptops" className="hover:text-primary transition-colors">لابتوبات جيمنج</Link></li>
              <li><Link href="/categories/peripherals" className="hover:text-primary transition-colors">إكسسوارات وملحقات</Link></li>
              <li><Link href="/categories/monitors" className="hover:text-primary transition-colors">شاشات</Link></li>
              <li><Link href="/categories/consoles" className="hover:text-primary transition-colors">أجهزة كونسول</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6 relative inline-block">
              النشرة البريدية
              <span className="absolute -bottom-2 right-0 w-1/2 h-0.5 bg-primary"></span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              اشترك في نشرتنا البريدية للحصول على أحدث العروض والخصومات.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="bg-white/5 border border-white/10 rounded-md px-4 py-2 text-sm flex-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-bold hover:bg-primary/90 transition-colors">
                اشترك
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TechZone. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
