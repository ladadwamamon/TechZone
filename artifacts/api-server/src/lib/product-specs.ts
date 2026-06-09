export type ProductSpec = { labelAr: string; value: string };

/**
 * Product `specs` is an untyped jsonb column. Older/seeded rows store it as an
 * object map ({ "النوع": "ميكانيكي" }) while the app expects an array of
 * { labelAr, value }. This normalizes either shape into the array form.
 */
export function normalizeSpecs(raw: unknown): ProductSpec[] {
  if (Array.isArray(raw)) {
    return raw
      .filter(
        (s): s is ProductSpec =>
          !!s && typeof s === "object" && "labelAr" in s && "value" in s,
      )
      .map((s) => ({ labelAr: String(s.labelAr), value: String(s.value) }));
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>).map(([labelAr, value]) => ({
      labelAr,
      value: String(value),
    }));
  }
  return [];
}
