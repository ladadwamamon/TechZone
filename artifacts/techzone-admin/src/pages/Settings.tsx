import { useState, useEffect } from "react";
import {
  useAdminGetSettings,
  getAdminGetSettingsQueryKey,
  useAdminUpdateSettings,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings as SettingsIcon, Save, Plus, Trash2 } from "lucide-react";
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

  useEffect(() => {
    if (!settings) return;
    const s = settings as Record<string, unknown>;
    setAnnouncement(asObject(s.announcementBar, DEFAULT_ANNOUNCEMENT));
    setHero(asObject(s.hero, DEFAULT_HERO));
    setContact(asObject(s.contact, DEFAULT_CONTACT));
    setSocial(asObject(s.social, DEFAULT_SOCIAL));
    setFeatures(Array.isArray(s.features) ? (s.features as Feature[]) : []);
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        data: {
          announcementBar: announcement,
          hero,
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
            <TabsTrigger value="hero">الواجهة الرئيسية</TabsTrigger>
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
                    placeholder="شحن مجاني للطلبات فوق 500 ريال"
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
                <CardTitle>قسم الواجهة الرئيسية</CardTitle>
                <CardDescription>العنوان والنصوص الترويجية في أعلى الصفحة الرئيسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Labeled label="العنوان الرئيسي">
                  <Input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
                </Labeled>
                <Labeled label="العنوان الفرعي">
                  <Textarea
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    className="resize-none"
                  />
                </Labeled>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Labeled label="نص زر الإجراء">
                    <Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} />
                  </Labeled>
                  <Labeled label="رابط زر الإجراء">
                    <Input
                      value={hero.ctaLink}
                      onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                      dir="ltr"
                    />
                  </Labeled>
                </div>
                <Labeled label="صورة الخلفية">
                  <MediaPicker value={hero.image} onChange={(url) => setHero({ ...hero, image: url })} />
                </Labeled>
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
