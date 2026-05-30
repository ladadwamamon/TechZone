import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Copyright, 
  MessageSquare, 
  FileText, 
  ShoppingCart, 
  Mail, 
  Image as ImageIcon, 
  Users, 
  Settings, 
  Activity
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { hasPermission, admin } = useAuth();

  const navItems = [
    { href: "/", label: "لوحة القيادة", icon: LayoutDashboard, perm: "analytics:read" },
    { href: "/orders", label: "الطلبات", icon: ShoppingCart, perm: "orders:write" },
    { href: "/products", label: "المنتجات", icon: Package, perm: "products:write" },
    { href: "/categories", label: "الفئات", icon: Tags, perm: "categories:write" },
    { href: "/brands", label: "العلامات التجارية", icon: Copyright, perm: "brands:write" },
    { href: "/reviews", label: "التقييمات", icon: MessageSquare, perm: "reviews:write" },
    { href: "/blog", label: "المدونة", icon: FileText, perm: "blog:write" },
    { href: "/media", label: "الوسائط", icon: ImageIcon, perm: "media:write" },
    { href: "/newsletter", label: "النشرة الإخبارية", icon: Mail, perm: "newsletter:read" },
    { href: "/accounts", label: "الحسابات", icon: Users, perm: "admins:manage" },
    { href: "/settings", label: "الإعدادات", icon: Settings, perm: "settings:write" },
    { href: "/audit", label: "سجل التدقيق", icon: Activity, perm: "audit:read" },
  ];

  return (
    <SidebarComponent className="border-l border-primary/20 bg-background/95 glass-panel z-20 font-sans">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-primary/20">
        <div className="font-mono font-bold text-xl tracking-wider text-primary neon-text flex items-center gap-2">
          <span>TECHZONE</span>
          <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded clip-corner-sm">OS</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            if (!hasPermission(item.perm)) return null;
            
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild
                  isActive={isActive}
                  className={`
                    flex items-center gap-3 px-4 py-2 my-1 transition-all duration-200
                    ${isActive ? "bg-primary/15 text-primary border-r-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:border-r-2 hover:border-primary/50"}
                  `}
                >
                  <Link href={item.href} data-testid={`nav-${item.href.replace("/", "") || "home"}`}>
                    <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
            <span className="font-mono text-primary font-bold text-xs uppercase">
              {admin?.username.substring(0, 2)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{admin?.fullName}</span>
            <span className="text-xs text-muted-foreground font-mono">{admin?.role.replace('_', ' ')}</span>
          </div>
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
}
