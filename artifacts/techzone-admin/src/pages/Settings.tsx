import { useState, useEffect } from "react";
import {
  useAdminGetSettings,
  getAdminGetSettingsQueryKey,
  useAdminUpdateSettings,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPicker } from "@/components/MediaPicker";

interface AnnouncementBar {
  enabled: boolean;
  text: string;
  link: string;
}
interface Hero {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}
interface Contact {
  phone: string;
  email: string;
  address: string;
  hours: string;
}
interface Social {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
}
interface Feature {
  title: string;
  description: string;
  icon: string;
}
interface HeroSlide {
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  tone: string;
  stat: string;
}

const TONE_OPTIONS: { value: string; label: string }[] = [
  { value: "primary", label: "سماوي" },
  { value: "secondary", label: "وردي" },
  { value: "lime", label: "أخضر" },
  { value: "destructive", label: "أحمر" },
];

const EMPTY_SLIDE: HeroSlide = {
  eyebrow: "",
  title: "",
  accent: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  image: "",
  tone: "primary",
  stat: "",
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    eyebrow: "وحدة المعالجة الرسومية",
    title: "قوة الجرافيكس",
    accent: "بلا حدود",
    subtitle: "كروت RTX 40 وRadeon RX لأداء فائق بدقة 4K مع تتبع الأشعة.",
    ctaText: "تصفح كروت الشاشة",
    ctaLink: "/categories/graphics-cards",
    image: "/catalog/graphics-cards-1.jpg",
    tone: "primary",
    stat: "حتى 24GB GDDR6X",
  },
  {
    eyebrow: "الجيل الجديد",
    title: "كونسولات الجيل القادم",
    accent: "",
    subtitle: "PlayStation 5 وXbox Series X وNintendo Switch بين يديك الآن.",
    ctaText: "اكتشف الكونسولات",
    ctaLink: "/categories/playstation",
    image: "/catalog/playstation-1.jpg",
    tone: "secondary",
    stat: "تجربة 4K بسلاسة",
  },
  {
    eyebrow: "محطة القتال",
    title: "اصنع عرش اللعب",
    accent: "",
    subtitle: "كراسي جيمنج مريحة وشاشات بمعدل تحديث عالٍ لتجربة لا تُنسى.",
    ctaText: "جهّز ركنك",
    ctaLink: "/categories/gaming-chairs",
    image: "/catalog/gaming-chairs-1.jpg",
    tone: "lime",
    stat: "راحة طوال اليوم",
  },
  {
    eyebrow: "بروتوكول الحرق",
    title: "عروض الحرق",
    accent: "",
    subtitle: "خصومات تصل إلى 30% على نخبة المنتجات لفترة محدودة جداً.",
    ctaText: "شاهد العروض",
    ctaLink: "/deals",
    image: "/catalog/laptops-1.jpg",
    tone: "destructive",
    stat: "خصومات حتى 30%",
  },
];

const DEFAULT_ANNOUNCEMENT: AnnouncementBar = { enabled: false, text: "", link: "" };
const DEFAULT_HERO: Hero = { title: "", subtitle: "", ctaText: "", ctaLink: "", image: "" };
const DEFAULT_CONTACT: Contact = { phone: "", email: "", address: "", hours: "" };
const DEFAULT_SOCIAL: Social = {
  facebook: "",
  instagram: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  whatsapp: "",
};

function asObject<T>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...fallback, ...(value as Record<string, unknown>) } as T;
  }
  return fallback;
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export default function Settings() {
  const { data: settings, isLoading } = useAdminGetSettings({
    query: { queryKey: getAdminGetSettingsQueryKey() },
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateMutation = useAdminUpdateSettings();

  const [announcement, setAnnouncement] = useState<AnnouncementBar>(DEFAULT_ANNOUNCEMENT);
  const [hero, setHero] = useState<Hero>(DEFAULT_HERO);
  const [contact, setContact] = useState<Contact>(DEFAULT_CONTACT);
  const [social, setSocial] = useState<Social>(DEFAULT_SOCIAL);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    if (!settings) return;
    const s = settings as Record<string, unknown>;
    setAnnouncement(asObject(s.announcementBar, DEFAULT_ANNOUNCEMENT));
    setHero(asObject(s.hero, DEFAULT_HERO));
    setContact(asObject(s.contact, DEFAULT_CONTACT));
    setSocial(asObject(s.social, DEFAULT_SOCIAL));
    setFeatures(Array.isArray(s.features) ? (s.features as Feature[]) : []);
    setHeroSlides(Array.isArray(s.heroSlides) ? (s.heroSlides as HeroSlide[]) : []);
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        data: {
          announcementBar: announcement,
          hero,
          heroSlides,
          contact,
          social,
          features,
        } as unknown as Record<string, unknown>,
      },
      {
        onSuccess: () => {
          toast({ title: "تم حفظ الإعدادات بنجاح" });
          queryClient.invalidateQueries({ queryKey: getAdminGetSettingsQueryKey() });
        },
        onError: () => toast({ title: "فشل حفظ الإعدادات", variant: "destructive" }),
      },
    );
  };

  const addFeature = () => setFeatures([...features, { title: "", description: "", icon: "" }]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, patch: Partial<Feature>) =>
    setFeatures(features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const addSlide = () => setHeroSlides([...heroSlides, { ...EMPTY_SLIDE }]);
  const removeSlide = (i: number) => setHeroSlides(heroSlides.filter((_, idx) => idx !== i));
  const updateSlide = (i: number, patch: Partial<HeroSlide>) =>
    setHeroSlides(heroSlides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const moveSlide = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= heroSlides.length) return;
    const next = [...heroSlides];
    [next[i], next[j]] = [next[j], next[i]];
    setHeroSlides(next);
  };
  const importDefaultSlides = () => setHeroSlides(DEFAULT_SLIDES.map((s) => ({ ...s })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono text-primary neon-text flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          إعدادات المتجر
        </h1>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || isLoading}
          className="glow-hover clip-corner-sm gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-4xl">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full bg-primary/20" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="announcement" dir="rtl" className="max-w-4xl">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="announcement">شريط الإعلان</TabsTrigger>
            <TabsTrigger value="hero">شرائح السلايدر</TabsTrigger>
            <TabsTrigger value="contact">معلومات التواصل</TabsTrigger>
            <TabsTrigger value="social">التواصل الاجتماعي</TabsTrigger>
            <TabsTrigger value="features">مزايا الثقة</TabsTrigger>
          </TabsList>

          <TabsContent value="announcement">
            <Card className="glass-panel border-primary/20 hud-frame">
              <CardHeader>
                <CardTitle>شريط الإعلان العلوي</CardTitle>
                <CardDescription>شريط يظهر أعلى المتجر للعروض والإعلانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded border border-primary/10 p-3 bg-background/40">
                  <span className="text-sm">تفعيل شريط الإعلان</span>
                  <Switch
                    checked={announcement.enabled}
                    onCheckedChange={(v) => setAnnouncement({ ...announcement, enabled: v })}
                  />
                </div>
                <Labeled label="نص الإعلان">
                  <Input
                    value={announcement.text}
                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                    placeholder="شحن مجاني للطلبات فوق 500 شيكل"
                  />
                </Labeled>
                <Labeled label="رابط الإعلان (اختياري)">
                  <Input
                    value={announcement.link}
                    onChange={(e) => setAnnouncement({ ...announcement, link: e.target.value })}
                    dir="ltr"
                    placeholder="/deals"
                  />
                </Labeled>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hero">
            <Card className="glass-panel border-primary/20 hud-frame">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>شرائح السلايدر الرئيسي</CardTitle>
                    <CardDescription>
                      تحكّم كامل بشرائح الصفحة الرئيسية: أضف صوراً ونصوصاً وروابط، وأعد ترتيبها. تظهر الشرائح بالترتيب من الأعلى للأسفل.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={importDefaultSlides}
                      className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      استيراد الشرائح الافتراضية
                    </Button>
                    <Button
                      type="button"
                      onClick={addSlide}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" /> إضافة شريحة
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {heroSlides.length === 0 && (
                  <div className="rounded border border-dashed border-primary/20 p-8 text-center text-sm text-muted-foreground">
                    لا توجد شرائح مخصّصة. سيعرض المتجر الشرائح الافتراضية. اضغط "إضافة شريحة" أو "استيراد الشرائح الافتراضية" للبدء بالتعديل.
                  </div>
                )}
                {heroSlides.map((slide, i) => (
                  <div key={i} className="rounded border border-primary/15 bg-background/40 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">
                        {`SLIDE_${String(i + 1).padStart(2, "0")}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={i === 0}
                          onClick={() => moveSlide(i, -1)}
                          aria-label="تحريك لأعلى"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={i === heroSlides.length - 1}
                          onClick={() => moveSlide(i, 1)}
                          aria-label="تحريك لأسفل"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlide(i)}
                          aria-label="حذف الشريحة"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Labeled label="النص العلوي الصغير">
                        <Input
                          value={slide.eyebrow}
                          onChange={(e) => updateSlide(i, { eyebrow: e.target.value })}
                          placeholder="وحدة المعالجة الرسومية"
                        />
                      </Labeled>
                      <Labeled label="اللون">
                        <select
                          value={slide.tone}
                          onChange={(e) => updateSlide(i, { tone: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {TONE_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </Labeled>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Labeled label="العنوان الرئيسي">
                        <Input
                          value={slide.title}
                          onChange={(e) => updateSlide(i, { title: e.target.value })}
                          placeholder="قوة الجرافيكس"
                        />
                      </Labeled>
                      <Labeled label="كلمة مميّزة (اختياري)">
                        <Input
                          value={slide.accent}
                          onChange={(e) => updateSlide(i, { accent: e.target.value })}
                          placeholder="بلا حدود"
                        />
                      </Labeled>
                    </div>

                    <Labeled label="الوصف">
                      <Textarea
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(i, { subtitle: e.target.value })}
                        className="resize-none"
                      />
                    </Labeled>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Labeled label="نص الزر">
                        <Input
                          value={slide.ctaText}
                          onChange={(e) => updateSlide(i, { ctaText: e.target.value })}
                          placeholder="تصفح الآن"
                        />
                      </Labeled>
                      <Labeled label="رابط الزر">
                        <Input
                          value={slide.ctaLink}
                          onChange={(e) => updateSlide(i, { ctaLink: e.target.value })}
                          dir="ltr"
                          placeholder="/categories/graphics-cards"
                        />
                      </Labeled>
                      <Labeled label="شارة إحصائية (اختياري)">
                        <Input
                          value={slide.stat}
                          onChange={(e) => updateSlide(i, { stat: e.target.value })}
                          placeholder="حتى 24GB GDDR6X"
                        />
                      </Labeled>
                    </div>

                    <Labeled label="صورة الخلفية">
                      <MediaPicker value={slide.image} onChange={(url) => updateSlide(i, { image: url })} />
                    </Labeled>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card className="glass-panel border-primary/20 hud-frame">
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
                <CardDescription>تظهر في تذييل المتجر وصفحة التواصل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Labeled label="رقم الهاتف">
                    <Input
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      dir="ltr"
                    />
                  </Labeled>
                  <Labeled label="البريد الإلكتروني">
                    <Input
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      dir="ltr"
                    />
                  </Labeled>
                </div>
                <Labeled label="العنوان">
                  <Input
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  />
                </Labeled>
                <Labeled label="ساعات العمل">
                  <Input value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
                </Labeled>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="glass-panel border-primary/20 hud-frame">
              <CardHeader>
                <CardTitle>روابط التواصل الاجتماعي</CardTitle>
                <CardDescription>اترك الحقل فارغاً لإخفاء المنصة</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Labeled label="فيسبوك">
                  <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} dir="ltr" />
                </Labeled>
                <Labeled label="إنستغرام">
                  <Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} dir="ltr" />
                </Labeled>
                <Labeled label="تويتر / X">
                  <Input value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} dir="ltr" />
                </Labeled>
                <Labeled label="تيك توك">
                  <Input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} dir="ltr" />
                </Labeled>
                <Labeled label="يوتيوب">
                  <Input value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} dir="ltr" />
                </Labeled>
                <Labeled label="واتساب (رقم)">
                  <Input value={social.whatsapp} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} dir="ltr" placeholder="+9665xxxxxxxx" />
                </Labeled>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="glass-panel border-primary/20 hud-frame">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>مزايا الثقة</CardTitle>
                  <CardDescription>شارات الميزات مثل الشحن المجاني والضمان</CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={addFeature} className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4" /> إضافة ميزة
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">لا توجد مزايا. أضف واحدة.</div>
                ) : (
                  features.map((f, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_auto] gap-2 items-end rounded border border-primary/10 p-3 bg-background/40"
                    >
                      <Labeled label="العنوان">
                        <Input value={f.title} onChange={(e) => updateFeature(i, { title: e.target.value })} />
                      </Labeled>
                      <Labeled label="الوصف">
                        <Input value={f.description} onChange={(e) => updateFeature(i, { description: e.target.value })} />
                      </Labeled>
                      <Labeled label="الأيقونة (اسم)">
                        <Input value={f.icon} onChange={(e) => updateFeature(i, { icon: e.target.value })} dir="ltr" placeholder="truck" />
                      </Labeled>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(i)}
                        className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
