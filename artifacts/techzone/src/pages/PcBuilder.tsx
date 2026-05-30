import { Layout } from "@/components/Layout";
import { usePCBuilderStore, useCartStore } from "@/lib/store";
import { useListProducts, Product } from "@workspace/api-client-react";
import { CATEGORY_ICONS } from "@/lib/categoryMeta";
import { formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Trash2, Cpu, HardDrive, Zap, CircuitBoard, Monitor, Plus, Check, ShoppingCart, Info, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const BUILDER_SLOTS = [
  { id: "processors", name: "المعالج", code: "CPU" },
  { id: "motherboards", name: "اللوحة الأم", code: "MB" },
  { id: "ram", name: "الذاكرة العشوائية", code: "RAM" },
  { id: "graphics-cards", name: "كرت الشاشة", code: "GPU" },
  { id: "storage", name: "التخزين", code: "SSD/HDD" },
  { id: "power-supply", name: "مزود الطاقة", code: "PSU" },
  { id: "cooling", name: "التبريد", code: "COOLER" },
  { id: "pc-cases", name: "الكيس", code: "CASE" },
];

export default function PcBuilder() {
  const { components, setComponent, removeComponent, clearBuilder, getTotalPrice } = usePCBuilderStore();
  const { addItem } = useCartStore();
  
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const { data: processorsData, isLoading: isLoadingProcessors } = useListProducts({ category: "processors", limit: 50 });
  const { data: motherboardsData, isLoading: isLoadingMotherboards } = useListProducts({ category: "motherboards", limit: 50 });
  const { data: ramData, isLoading: isLoadingRam } = useListProducts({ category: "ram", limit: 50 });
  const { data: gpuData, isLoading: isLoadingGpu } = useListProducts({ category: "graphics-cards", limit: 50 });
  const { data: storageData, isLoading: isLoadingStorage } = useListProducts({ category: "storage", limit: 50 });
  const { data: psuData, isLoading: isLoadingPsu } = useListProducts({ category: "power-supply", limit: 50 });
  const { data: coolingData, isLoading: isLoadingCooling } = useListProducts({ category: "cooling", limit: 50 });
  const { data: casesData, isLoading: isLoadingCases } = useListProducts({ category: "pc-cases", limit: 50 });

  const slotDataMap: Record<string, { data?: { products: Product[] }, isLoading: boolean }> = {
    "processors": { data: processorsData, isLoading: isLoadingProcessors },
    "motherboards": { data: motherboardsData, isLoading: isLoadingMotherboards },
    "ram": { data: ramData, isLoading: isLoadingRam },
    "graphics-cards": { data: gpuData, isLoading: isLoadingGpu },
    "storage": { data: storageData, isLoading: isLoadingStorage },
    "power-supply": { data: psuData, isLoading: isLoadingPsu },
    "cooling": { data: coolingData, isLoading: isLoadingCooling },
    "pc-cases": { data: casesData, isLoading: isLoadingCases },
  };

  const handleSelectProduct = (slotId: string, product: Product) => {
    setComponent(slotId, product);
    setActiveSlot(null);
    toast.success("تم التحديد بنجاح", {
      description: `تم إضافة ${product.nameAr} إلى التجميعة.`
    });
  };

  const handleAddBuildToCart = () => {
    const parts = Object.values(components) as Product[];
    if (parts.length === 0) return;

    parts.forEach(part => {
      addItem({
        productId: part.id,
        nameAr: part.nameAr,
        price: part.price,
        quantity: 1,
        image: part.image,
      });
    });

    toast.success("تم إضافة التجميعة للسلة", {
      description: "تمت إضافة جميع القطع المحددة بنجاح.",
      icon: <ShoppingCart className="h-4 w-4" />
    });
  };

  const completedCount = Object.keys(components).length;
  const isComplete = completedCount === BUILDER_SLOTS.length;

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <span className="text-foreground truncate uppercase">PC_BUILDER</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text="تجميعة PC">
            تجميعة PC
          </h1>
          <p className="mt-4 text-primary/70 font-mono text-sm max-w-2xl">
            {"// "} قم ببناء جهاز الأحلام الخاص بك. اختر القطع المتوافقة وسيتم تحديث السعر تلقائياً.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Builder Slots */}
          <div className="flex-1 space-y-4">
            <div className="glass-panel clip-corner border-primary/20 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-mono text-primary uppercase flex items-center gap-2">
                <CircuitBoard size={18} className="text-primary" />
                SYS.MODULES: {completedCount}/{BUILDER_SLOTS.length}
              </div>
              <button 
                onClick={clearBuilder}
                className="text-xs font-mono text-destructive hover:text-destructive/80 uppercase flex items-center gap-1"
                disabled={completedCount === 0}
              >
                <RotateCcw size={14} /> [ RESET_BUILD ]
              </button>
            </div>

            {BUILDER_SLOTS.map((slot) => {
              const Icon = CATEGORY_ICONS[slot.id] || Cpu;
              const selectedProduct = components[slot.id] as Product | undefined;

              return (
                <div key={slot.id} className={`glass-panel clip-corner transition-all duration-300 hud-frame ${selectedProduct ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className={`w-12 h-12 flex items-center justify-center clip-corner-sm transition-colors ${selectedProduct ? 'bg-primary text-primary-foreground shadow-[0_0_10px_var(--cyan)]' : 'bg-background/80 border border-primary/30 text-primary/50'}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-primary/50 uppercase mb-1">REQ_{slot.code}</div>
                        <div className="font-bold font-sans">{slot.name}</div>
                      </div>
                    </div>

                    <div className="flex-1 w-full border-t sm:border-t-0 sm:border-r border-primary/10 pt-4 sm:pt-0 sm:pr-6 rtl:sm:border-r-0 rtl:sm:border-l rtl:sm:pl-6 min-h-[60px] flex items-center">
                      {selectedProduct ? (
                        <div className="flex items-center gap-4 w-full">
                          <img src={selectedProduct.image} alt={selectedProduct.nameAr} className="w-16 h-16 object-contain mix-blend-screen drop-shadow-md" />
                          <div className="flex-1">
                            <Link href={`/products/${selectedProduct.id}`} className="font-sans text-sm font-bold hover:text-primary transition-colors line-clamp-1">
                              {selectedProduct.nameAr}
                            </Link>
                            <div className="text-primary font-mono font-bold mt-1 neon-text text-sm">
                              {formatPrice(selectedProduct.price)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-mono text-muted-foreground w-full text-center sm:text-start">
                          {"//"} لم يتم تحديد قطعة
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 justify-end">
                      {selectedProduct && (
                        <button 
                          onClick={() => removeComponent(slot.id)}
                          className="bg-background border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground p-2 clip-corner-sm transition-colors"
                          title="إزالة القطعة"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => setActiveSlot(slot.id)}
                        className={`px-4 py-2 clip-corner-sm font-mono text-sm font-bold flex items-center gap-2 transition-all ${selectedProduct ? 'bg-background border border-primary text-primary hover:bg-primary/20' : 'bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_10px_var(--cyan)]'}`}
                      >
                        {selectedProduct ? (
                          <><RotateCcw size={16} /> CHANGE</>
                        ) : (
                          <><Plus size={16} /> SELECT</>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Summary */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="glass-panel clip-corner hud-frame p-6 sticky top-24 border-secondary/30 bg-secondary/5">
              <h3 className="font-bold text-lg mb-6 text-secondary neon-text-magenta font-mono uppercase border-b border-secondary/20 pb-4">
                {">"} BUILD_SUMMARY
              </h3>

              <div className="space-y-4 mb-6 font-mono text-sm">
                {BUILDER_SLOTS.map((slot) => {
                  const comp = components[slot.id] as Product | undefined;
                  if (!comp) return null;
                  return (
                    <div key={slot.id} className="flex justify-between items-start gap-2 border-b border-secondary/10 pb-2">
                      <span className="text-muted-foreground uppercase">{slot.code}</span>
                      <span className="text-foreground font-bold text-left">{formatPrice(comp.price)}</span>
                    </div>
                  );
                })}
                {completedCount === 0 && (
                  <div className="text-muted-foreground text-center py-4 text-xs">
                    // لا يوجد قطع محددة
                  </div>
                )}
              </div>

              <div className="border-t border-secondary/30 pt-4 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-mono text-secondary uppercase">TOTAL_COST</span>
                  <span className="text-2xl font-bold font-mono text-secondary neon-text-magenta">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleAddBuildToCart}
                disabled={completedCount === 0}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 clip-corner font-bold py-4 px-6 transition-all shadow-[0_0_15px_var(--magenta)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wide font-mono flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                [ ADD_TO_CART ]
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* Select Component Modal */}
      <Dialog open={!!activeSlot} onOpenChange={(open) => !open && setActiveSlot(null)}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col glass-panel border-primary clip-corner-lg shadow-[0_0_30px_var(--cyan)] p-0 gap-0 font-sans overflow-hidden">
          <DialogHeader className="p-6 border-b border-primary/20 shrink-0 bg-background/80">
            <DialogTitle className="text-xl font-bold font-mono text-primary neon-text uppercase">
              {">"} SELECT_{BUILDER_SLOTS.find(s => s.id === activeSlot)?.code}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeSlot && slotDataMap[activeSlot]?.isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeSlot && slotDataMap[activeSlot]?.data?.products.length === 0 ? (
              <div className="text-center text-muted-foreground font-mono py-12">
                // لا يوجد قطع متاحة في هذا القسم
              </div>
            ) : (
              activeSlot && slotDataMap[activeSlot]?.data?.products.map((product) => (
                <div key={product.id} className="glass-panel border-primary/20 p-4 flex gap-4 items-center hover:border-primary/50 transition-colors clip-corner-sm">
                  <div className="w-16 h-16 bg-background/50 flex items-center justify-center shrink-0 border border-primary/10 clip-corner-sm">
                    <img src={product.image} alt={product.nameAr} className="max-w-full max-h-full object-contain mix-blend-screen" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{product.nameAr}</h4>
                    <div className="text-primary font-mono font-bold mt-1 text-sm">{formatPrice(product.price)}</div>
                  </div>
                  <button 
                    onClick={() => handleSelectProduct(activeSlot, product)}
                    className="shrink-0 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 clip-corner-sm font-mono text-sm font-bold uppercase transition-colors"
                  >
                    SELECT
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
