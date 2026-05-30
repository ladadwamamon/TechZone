import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Monitor, Terminal, Phone, Mail, MapPin } from "lucide-react";
import { useSiteSettings, getSocialLinks } from "@/lib/settings";

const DEFAULT_SOCIAL_ICONS = [Facebook, Twitter, Instagram, Youtube];

export function Footer() {
  const { social, contact } = useSiteSettings();
  const socialLinks = getSocialLinks(social);

  return (
    <footer className="glass-panel border-t border-primary/20 pt-16 pb-8 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 neon-divider"></div>
      <div className="container mx-auto px-4 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <Monitor className="text-primary h-8 w-8 group-hover:animate-flicker" />
              <span className="text-2xl font-black tracking-wider text-primary neon-text uppercase glitch" data-text="TECHZONE">
                TECHZONE
              </span>
            </Link>
            <p className="text-primary/70 text-sm leading-relaxed mb-6">
              متجر TechZone هو وجهتك الأولى لكل ما يخص عالم الجيمنج والإلكترونيات. نوفر لك أفضل القطع وأحدث التجميعات بأسعار تنافسية.
              <br /><br />
              <span className="text-secondary neon-text-magenta animate-pulse text-xs">{"//"} SYSTEM_INITIALIZED</span>
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.length > 0 ? (
                socialLinks.map(({ key, url, icon: Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="w-10 h-10 clip-corner bg-background/50 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 hover:neon-border transition-all glow-hover"
                  >
                    <Icon size={18} />
                  </a>
                ))
              ) : (
                DEFAULT_SOCIAL_ICONS.map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 clip-corner bg-background/50 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 hover:neon-border transition-all glow-hover">
                    <Icon size={18} />
                  </a>
                ))
              )}
            </div>

            {(contact.phone || contact.email || contact.address) && (
              <ul className="mt-6 space-y-2 text-sm text-primary/70">
                {contact.phone && (
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-primary shrink-0" />
                    <a href={`tel:${contact.phone}`} dir="ltr" className="hover:text-primary transition-colors">{contact.phone}</a>
                  </li>
                )}
                {contact.email && (
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-primary shrink-0" />
                    <a href={`mailto:${contact.email}`} dir="ltr" className="hover:text-primary transition-colors">{contact.email}</a>
                  </li>
                )}
                {contact.address && (
                  <li className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <span>{contact.address}</span>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-6 relative inline-block">
              {">"} روابط_سريعة
              <span className="absolute -bottom-2 right-0 w-full h-[1px] bg-primary/30"></span>
              <span className="absolute -bottom-2 right-0 w-1/3 h-[2px] bg-primary shadow-[0_0_8px_var(--cyan)]"></span>
            </h3>
            <ul className="space-y-3 text-sm text-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>من نحن<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>اتصل بنا<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>الأسئلة الشائعة<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>المدونة<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/track-order" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>تتبع طلبك<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-6 relative inline-block">
              {">"} الأقسام
              <span className="absolute -bottom-2 right-0 w-full h-[1px] bg-primary/30"></span>
              <span className="absolute -bottom-2 right-0 w-1/3 h-[2px] bg-primary shadow-[0_0_8px_var(--cyan)]"></span>
            </h3>
            <ul className="space-y-3 text-sm text-foreground">
              <li><Link href="/categories/components" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>قطع الكمبيوتر<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/categories/laptops" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>لابتوبات جيمنج<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/categories/peripherals" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>إكسسوارات وملحقات<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/categories/monitors" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>شاشات<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
              <li><Link href="/categories/consoles" className="hover:text-primary transition-colors flex items-center gap-2"><span className="text-primary/50 text-xs">{"["}</span>أجهزة كونسول<span className="text-primary/50 text-xs">{"]"}</span></Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-6 relative inline-block">
              {">"} النشرة_البريدية
              <span className="absolute -bottom-2 right-0 w-full h-[1px] bg-primary/30"></span>
              <span className="absolute -bottom-2 right-0 w-1/3 h-[2px] bg-primary shadow-[0_0_8px_var(--cyan)]"></span>
            </h3>
            <p className="text-sm text-primary/70 mb-4">
              اشترك في نشرتنا البريدية للحصول على أحدث العروض والخصومات.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1 clip-corner-sm">
                <Terminal className="absolute right-2 top-1/2 -translate-y-1/2 text-primary" size={14} />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="w-full bg-background/50 border border-primary/30 px-8 py-2 text-sm text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-primary/30 transition-all font-mono"
                />
              </div>
              <button type="submit" className="bg-primary/10 border border-primary text-primary px-4 py-2 clip-corner-sm text-sm font-bold hover:bg-primary hover:text-background hover:shadow-[0_0_15px_var(--cyan)] transition-all glow-hover">
                اشترك
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/20 text-center text-sm text-primary/50 flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} TECHZONE_OS. ALL_RIGHTS_RESERVED.</p>
          <p className="mt-2 md:mt-0 animate-pulse">{"//"} SYSTEM_STATUS: ONLINE</p>
        </div>
      </div>
    </footer>
  );
}
