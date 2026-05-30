import { useGetPublicSettings } from "@workspace/api-client-react";
import {
  ShieldCheck,
  Zap,
  Monitor,
  Truck,
  RotateCcw,
  Headphones,
  Clock,
  CreditCard,
  Package,
  Award,
  Heart,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export interface AnnouncementSetting {
  enabled: boolean;
  text: string;
  link: string;
}
export interface HeroSetting {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}
export interface ContactSetting {
  phone: string;
  email: string;
  address: string;
  hours: string;
}
export interface SocialSetting {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
}
export interface FeatureSetting {
  title: string;
  description: string;
  icon: string;
}

export const DEFAULT_ANNOUNCEMENT_TEXT =
  "شحن مجاني للطلبات فوق 500 شيكل | استخدم كود GAMING10 للحصول على خصم 10%";

const DEFAULT_ANNOUNCEMENT: AnnouncementSetting = {
  enabled: true,
  text: "",
  link: "",
};
const DEFAULT_HERO: HeroSetting = {
  title: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  image: "",
};
const DEFAULT_CONTACT: ContactSetting = {
  phone: "",
  email: "",
  address: "",
  hours: "",
};
const DEFAULT_SOCIAL: SocialSetting = {
  facebook: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  whatsapp: "",
};

export const DEFAULT_FEATURES: FeatureSetting[] = [
  { title: "ضمان حقيقي", description: "تغطية شاملة لجميع المنتجات", icon: "shield" },
  { title: "شحن فائق السرعة", description: "توصيل لجميع مناطق المملكة", icon: "zap" },
  { title: "دعم فني متخصص", description: "فريق خبراء لخدمتك 24/7", icon: "monitor" },
];

const FEATURE_ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  zap: Zap,
  monitor: Monitor,
  truck: Truck,
  shipping: Truck,
  returns: RotateCcw,
  rotate: RotateCcw,
  support: Headphones,
  headphones: Headphones,
  clock: Clock,
  payment: CreditCard,
  creditcard: CreditCard,
  package: Package,
  award: Award,
  heart: Heart,
  star: Star,
};

export function getFeatureIcon(name: string): LucideIcon {
  return FEATURE_ICONS[name.trim().toLowerCase()] ?? ShieldCheck;
}

const SOCIAL_ICONS: Record<keyof SocialSetting, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  tiktok: Music2,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...fallback, ...(value as Record<string, unknown>) } as T;
  }
  return fallback;
}

export interface SocialLink {
  key: keyof SocialSetting;
  url: string;
  icon: LucideIcon;
}

/**
 * Normalize a social value into a usable href. WhatsApp values are treated as
 * phone numbers and turned into a wa.me link; everything else is assumed to be
 * a URL (a bare value gets an https:// prefix).
 */
function toSocialHref(key: keyof SocialSetting, value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (key === "whatsapp") {
    const digits = v.replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : "";
  }
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export function getSocialLinks(social: SocialSetting): SocialLink[] {
  const order: (keyof SocialSetting)[] = [
    "facebook",
    "instagram",
    "twitter",
    "tiktok",
    "youtube",
    "whatsapp",
  ];
  const links: SocialLink[] = [];
  for (const key of order) {
    const url = toSocialHref(key, social[key]);
    if (url) links.push({ key, url, icon: SOCIAL_ICONS[key] });
  }
  return links;
}

export interface SiteSettings {
  announcement: AnnouncementSetting;
  hero: HeroSetting;
  contact: ContactSetting;
  social: SocialSetting;
  features: FeatureSetting[];
  isLoading: boolean;
}

export function useSiteSettings(): SiteSettings {
  const { data, isLoading } = useGetPublicSettings();
  const s = (data ?? {}) as Record<string, unknown>;
  const features = Array.isArray(s.features) ? (s.features as FeatureSetting[]) : [];
  return {
    announcement: asObject(s.announcementBar, DEFAULT_ANNOUNCEMENT),
    hero: asObject(s.hero, DEFAULT_HERO),
    contact: asObject(s.contact, DEFAULT_CONTACT),
    social: asObject(s.social, DEFAULT_SOCIAL),
    features: features.length > 0 ? features : DEFAULT_FEATURES,
    isLoading,
  };
}
