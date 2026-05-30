import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import type { HeroSetting } from "@/lib/settings";

type Accent = "primary" | "secondary" | "lime" | "destructive";

interface Slide {
  code: string;
  eyebrow: string;
  title: string;
  accent: string;
  sub: string;
  href: string;
  cta: string;
  image: string;
  tone: Accent;
  stat: string;
}

const SLIDES: Slide[] = [
  {
    code: "GPU_CORE",
    eyebrow: "وحدة المعالجة الرسومية",
    title: "قوة الجرافيكس",
    accent: "بلا حدود",
    sub: "كروت RTX 40 وRadeon RX لأداء فائق بدقة 4K مع تتبع الأشعة.",
    href: "/categories/graphics-cards",
    cta: "تصفح كروت الشاشة",
    image: "/catalog/graphics-cards-1.jpg",
    tone: "primary",
    stat: "حتى 24GB GDDR6X",
  },
  {
    code: "NEXT_GEN",
    eyebrow: "الجيل الجديد",
    title: "كونسولات",
    accent: "الجيل القادم",
    sub: "PlayStation 5 وXbox Series X وNintendo Switch بين يديك الآن.",
    href: "/categories/playstation",
    cta: "اكتشف الكونسولات",
    image: "/catalog/playstation-1.jpg",
    tone: "secondary",
    stat: "تجربة 4K بسلاسة",
  },
  {
    code: "BATTLESTATION",
    eyebrow: "محطة القتال",
    title: "اصنع",
    accent: "عرش اللعب",
    sub: "كراسي جيمنج مريحة وشاشات بمعدل تحديث عالٍ لتجربة لا تُنسى.",
    href: "/categories/gaming-chairs",
    cta: "جهّز ركنك",
    image: "/catalog/gaming-chairs-1.jpg",
    tone: "lime",
    stat: "راحة طوال اليوم",
  },
  {
    code: "OVERCLOCK",
    eyebrow: "بروتوكول الحرق",
    title: "عروض",
    accent: "الحرق",
    sub: "خصومات تصل إلى 30% على نخبة المنتجات لفترة محدودة جداً.",
    href: "/deals",
    cta: "شاهد العروض",
    image: "/catalog/laptops-1.jpg",
    tone: "destructive",
    stat: "خصومات حتى 30%",
  },
];

const TONE: Record<Accent, { text: string; border: string; bg: string; ring: string; grad: string; shadow: string }> = {
  primary: {
    text: "text-primary",
    border: "border-primary",
    bg: "bg-primary",
    ring: "bg-primary",
    grad: "from-primary/30",
    shadow: "drop-shadow-[0_0_45px_rgba(0,229,255,0.45)]",
  },
  secondary: {
    text: "text-secondary",
    border: "border-secondary",
    bg: "bg-secondary",
    ring: "bg-secondary",
    grad: "from-secondary/30",
    shadow: "drop-shadow-[0_0_45px_rgba(255,46,151,0.45)]",
  },
  lime: {
    text: "text-lime",
    border: "border-lime",
    bg: "bg-lime",
    ring: "bg-lime",
    grad: "from-lime/30",
    shadow: "drop-shadow-[0_0_45px_rgba(158,255,0,0.45)]",
  },
  destructive: {
    text: "text-destructive",
    border: "border-destructive",
    bg: "bg-destructive",
    ring: "bg-destructive",
    grad: "from-destructive/30",
    shadow: "drop-shadow-[0_0_45px_rgba(255,60,60,0.45)]",
  },
};

const DURATION = 6500;

export function HeroSlider({ heroOverride }: { heroOverride?: HeroSetting }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When the CMS hero is configured (title set), it replaces the first slide.
  const slides = useMemo<Slide[]>(() => {
    if (!heroOverride || !heroOverride.title.trim()) return SLIDES;
    const base = SLIDES[0];
    return [
      {
        ...base,
        title: heroOverride.title,
        accent: "",
        sub: heroOverride.subtitle.trim() || base.sub,
        href: heroOverride.ctaLink.trim() || base.href,
        cta: heroOverride.ctaText.trim() || base.cta,
        image: heroOverride.image.trim() || base.image,
      },
      ...SLIDES.slice(1),
    ];
  }, [heroOverride]);

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setCurrent((prev) => {
      const total = slides.length;
      return ((next % total) + total) % total;
    });
  }, [slides.length]);

  const next = useCallback(() => go(current + 1, 1), [current, go]);
  const prev = useCallback(() => go(current - 1, -1), [current, go]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => go(current + 1, 1), DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, go]);

  const slide = slides[current];
  const tone = TONE[slide.tone];

  return (
    <section
      className="relative w-full overflow-hidden border-b border-primary/15"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="عروض رئيسية"
    >
      <div className="relative h-[560px] sm:h-[600px] md:h-[660px]">
        {/* Animated image layer */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.code}
            custom={direction}
            initial={{ opacity: 0, scale: 1.12, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, scale: 1.05, clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-background/30" />
            <div className={`absolute inset-0 bg-gradient-to-t ${tone.grad} to-transparent opacity-60`} />
            <div className="absolute inset-0 cyber-grid opacity-30" />
            <div className="absolute inset-0 pointer-events-none scanlines opacity-20" />
          </motion.div>
        </AnimatePresence>

        {/* Giant watermark index */}
        <div className="absolute bottom-[-3rem] left-4 md:left-12 z-10 pointer-events-none select-none">
          <span className={`font-mono font-black text-[12rem] md:text-[18rem] leading-none ${tone.text} opacity-[0.07]`}>
            {String(current + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 h-full relative z-20">
          <div className="h-full flex items-center">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.code}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`h-px w-10 ${tone.bg}`} />
                    <span className={`font-mono text-xs tracking-[0.3em] uppercase ${tone.text}`}>
                      {`// MODULE_${String(current + 1).padStart(2, "0")} :: ${slide.code}`}
                    </span>
                  </div>

                  <div className={`inline-flex items-center gap-2 glass-panel ${tone.border} border px-3 py-1 mb-5 clip-corner-sm`}>
                    <span className={`w-2 h-2 rounded-full ${tone.bg} animate-pulse-glow`} />
                    <span className="font-mono text-xs text-foreground/80">{slide.eyebrow}</span>
                  </div>

                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6">
                    <span className="block text-foreground">{slide.title}</span>
                    {slide.accent && (
                      <span
                        className={`block ${tone.text} neon-text glitch`}
                        data-text={slide.accent}
                      >
                        {slide.accent}
                      </span>
                    )}
                  </h1>

                  <p className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                    {slide.sub}
                  </p>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={slide.href}
                      className={`clip-corner ${tone.bg} text-background hover:opacity-90 px-8 py-4 font-bold text-base md:text-lg transition-all flex items-center gap-2 group`}
                    >
                      <span>{slide.cta}</span>
                      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className={`glass-panel ${tone.border} border-l-2 px-4 py-3 font-mono text-sm ${tone.text}`}>
                      {slide.stat}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Vertical progress rail */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-30 hidden sm:flex flex-col gap-4">
          {slides.map((s, i) => {
            const active = i === current;
            const itone = TONE[s.tone];
            return (
              <button
                key={s.code}
                onClick={() => go(i, i > current ? 1 : -1)}
                className="group flex items-center gap-3 justify-end"
                aria-label={`الشريحة ${i + 1}`}
                aria-current={active}
              >
                <span className={`font-mono text-xs transition-colors ${active ? itone.text : "text-muted-foreground/50"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative h-12 w-1 bg-white/10 overflow-hidden clip-corner-sm">
                  {active && (
                    <motion.span
                      key={`fill-${current}`}
                      className={`absolute top-0 left-0 w-full ${itone.ring}`}
                      initial={{ height: "0%" }}
                      animate={{ height: paused ? "30%" : "100%" }}
                      transition={{ duration: paused ? 0.3 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 bg-white/5 group-hover:bg-white/20 transition-colors" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prev / Next controls (RTL: chevron-right = previous) */}
        <div className="absolute bottom-6 left-4 md:left-12 z-30 flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="السابق"
            className="glass-panel border border-primary/30 p-3 text-primary hover:bg-primary hover:text-background transition-all clip-corner-sm"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={next}
            aria-label="التالي"
            className="glass-panel border border-primary/30 p-3 text-primary hover:bg-primary hover:text-background transition-all clip-corner-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="ml-2 font-mono text-xs text-muted-foreground">
            <span className={tone.text}>{String(current + 1).padStart(2, "0")}</span>
            {` / ${String(slides.length).padStart(2, "0")}`}
          </div>
        </div>
      </div>
    </section>
  );
}
