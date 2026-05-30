import {
  Keyboard,
  Mouse,
  MousePointer2,
  Headphones,
  Mic,
  Gamepad2,
  Gamepad,
  Joystick,
  Cable,
  Cpu,
  MemoryStick,
  HardDrive,
  CircuitBoard,
  Fan,
  Zap,
  Monitor,
  Laptop,
  Boxes,
  Armchair,
  Gift,
  Plug,
  PcCase,
  Server,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  keyboards: Keyboard,
  mice: Mouse,
  mousepads: MousePointer2,
  headsets: Headphones,
  microphones: Mic,
  controllers: Gamepad2,
  "gaming-chairs": Armchair,
  "laptop-stands": Laptop,
  monitors: Monitor,
  playstation: Gamepad,
  xbox: Joystick,
  nintendo: Gamepad2,
  "console-accessories": Cable,
  processors: Cpu,
  "graphics-cards": CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  motherboards: Server,
  cooling: Fan,
  "power-supply": Zap,
  "pc-cases": PcCase,
  laptops: Laptop,
  "prebuilt-pc": Boxes,
  "gift-cards": Gift,
  accessories: Plug,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Boxes;
}

export interface CategoryGroup {
  title: string;
  code: string;
  slugs: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    title: "عتاد اللاعبين",
    code: "GEAR",
    slugs: ["keyboards", "mice", "mousepads", "headsets", "microphones", "controllers"],
  },
  {
    title: "أجهزة الكونسول",
    code: "CONSOLE",
    slugs: ["playstation", "xbox", "nintendo", "console-accessories"],
  },
  {
    title: "مكوّنات الكمبيوتر",
    code: "COMPONENTS",
    slugs: ["processors", "graphics-cards", "ram", "storage", "motherboards", "cooling", "power-supply", "pc-cases"],
  },
  {
    title: "أجهزة وشاشات",
    code: "SYSTEMS",
    slugs: ["monitors", "laptops", "prebuilt-pc"],
  },
  {
    title: "ركن اللاعب والمزيد",
    code: "EXTRAS",
    slugs: ["gaming-chairs", "laptop-stands", "gift-cards", "accessories"],
  },
];

export const CATEGORY_NAMES_AR: Record<string, string> = {
  keyboards: "كيبوردات",
  mice: "ماوسات",
  mousepads: "ماوس باد",
  headsets: "سماعات",
  microphones: "مايكات",
  controllers: "أيادي تحكم",
  "gaming-chairs": "كراسي جيمنج",
  "laptop-stands": "ستاندات لابتوب",
  monitors: "شاشات",
  playstation: "بلايستيشن",
  xbox: "إكسبوكس",
  nintendo: "نينتندو",
  "console-accessories": "ملحقات الكونسول",
  processors: "معالجات",
  "graphics-cards": "كروت الشاشة",
  ram: "رامات",
  storage: "تخزين",
  motherboards: "لوحات أم",
  cooling: "تبريد",
  "power-supply": "مزودات الطاقة",
  "pc-cases": "كيسات",
  laptops: "لابتوبات",
  "prebuilt-pc": "أجهزة مجمّعة",
  "gift-cards": "بطاقات هدايا",
  accessories: "إكسسوارات",
};
