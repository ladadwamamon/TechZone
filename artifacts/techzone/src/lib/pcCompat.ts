import type { Product } from "@workspace/api-client-react";

export type Platform = "intel" | "amd" | "unknown";

export interface CompatIssue {
  level: "error" | "warning";
  message: string;
}

export interface CompatResult {
  issues: CompatIssue[];
  ok: boolean;
}

function haystack(product?: Product): string {
  if (!product) return "";
  return [product.nameAr, product.nameEn, product.brandSlug, product.sku]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function detectCpuPlatform(cpu?: Product): Platform {
  const h = haystack(cpu);
  if (!h) return "unknown";
  if (/\b(ryzen|threadripper|athlon|amd)\b/.test(h) || /\bam[45]\b/.test(h)) return "amd";
  if (/\b(intel|core\s*i[3579]|pentium|celeron|lga)\b/.test(h)) return "intel";
  return "unknown";
}

export function detectMotherboardPlatform(mb?: Product): Platform {
  const h = haystack(mb);
  if (!h) return "unknown";
  if (/\b(am[45]|a[0-9]{2,3}|b[0-9]{3}|x[0-9]{3})\b/.test(h) && /\b(amd|ryzen)\b/.test(h)) return "amd";
  if (/\b(am[45])\b/.test(h)) return "amd";
  if (/\b(lga|z[0-9]{3}|h[0-9]{3}|b[0-9]{3}|intel)\b/.test(h) && /\bintel\b/.test(h)) return "intel";
  if (/\b(lga[0-9]{3,4})\b/.test(h)) return "intel";
  if (/\bintel\b/.test(h)) return "intel";
  if (/\b(amd|ryzen)\b/.test(h)) return "amd";
  return "unknown";
}

const PLATFORM_LABEL: Record<Platform, string> = {
  intel: "Intel",
  amd: "AMD",
  unknown: "غير محدد",
};

export function checkBuildCompatibility(components: Record<string, Product | undefined>): CompatResult {
  const issues: CompatIssue[] = [];

  const cpu = components["processors"];
  const mb = components["motherboards"];
  const gpu = components["graphics-cards"];
  const psu = components["power-supply"];

  if (cpu && mb) {
    const cpuPlatform = detectCpuPlatform(cpu);
    const mbPlatform = detectMotherboardPlatform(mb);
    if (cpuPlatform !== "unknown" && mbPlatform !== "unknown" && cpuPlatform !== mbPlatform) {
      issues.push({
        level: "error",
        message: `المعالج (${PLATFORM_LABEL[cpuPlatform]}) واللوحة الأم (${PLATFORM_LABEL[mbPlatform]}) غير متوافقين في المنصّة.`,
      });
    }
  }

  if (gpu && !psu) {
    issues.push({
      level: "warning",
      message: "اخترت كرت شاشة دون مزوّد طاقة. ننصح بإضافة PSU مناسب لتشغيل الكرت.",
    });
  }

  if (cpu && !mb) {
    issues.push({
      level: "warning",
      message: "اخترت معالجاً دون لوحة أم. أضف لوحة أم متوافقة مع منصّة المعالج.",
    });
  }

  return { issues, ok: issues.every((i) => i.level !== "error") };
}
