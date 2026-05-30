import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("techzone-announcement-dismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("techzone-announcement-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-secondary/20 border-b border-secondary neon-border-magenta overflow-hidden text-secondary"
        >
          <div className="container mx-auto px-4 py-1.5 flex items-center justify-between relative">
            <div className="flex-1 overflow-hidden whitespace-nowrap relative flex items-center gap-4">
              <span className="text-xs font-mono font-bold shrink-0 animate-pulse text-secondary">{"[ SYSTEM_ALERT ]"}</span>
              <div className="animate-marquee inline-block text-sm font-mono font-bold tracking-widest neon-text-magenta">
                شحن مجاني للطلبات فوق 500 شيكل | استخدم كود GAMING10 للحصول على خصم 10%
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 p-1 text-secondary hover:text-white hover:bg-secondary/20 clip-corner-sm transition-colors shrink-0"
              aria-label="إغلاق الإعلان"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
