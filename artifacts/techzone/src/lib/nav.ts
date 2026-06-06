import { useListNavItems } from "@workspace/api-client-react";

export interface NavLink {
  href: string;
  label: string;
  opensNewTab?: boolean;
}

export const DEFAULT_HEADER_LINKS: NavLink[] = [
  { href: "/deals", label: "عروض الحرق" },
  { href: "/pc-builder", label: "تجميعة PC" },
  { href: "/brands", label: "الماركات" },
  { href: "/blog", label: "المدونة" },
  { href: "/track-order", label: "تتبع الطلب" },
  { href: "/gift-cards", label: "بطاقات الهدايا" },
  { href: "/subscriptions", label: "الاشتراكات" },
];

export const DEFAULT_FOOTER_LINKS: NavLink[] = [
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/blog", label: "المدونة" },
  { href: "/track-order", label: "تتبع طلبك" },
  { href: "/gift-cards", label: "بطاقات الهدايا" },
  { href: "/subscriptions", label: "الاشتراكات" },
];

export function useNavLinks(location: "header" | "footer"): NavLink[] {
  const { data } = useListNavItems({ location });
  const defaults = location === "header" ? DEFAULT_HEADER_LINKS : DEFAULT_FOOTER_LINKS;
  if (!data || data.length === 0) return defaults;
  const visible = data
    .filter((i) => i.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((i) => ({ href: i.href, label: i.label, opensNewTab: i.opensNewTab }));
  return visible.length > 0 ? visible : defaults;
}
