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
          className="bg-primary text-primary-foreground overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-between relative">
            <div className="flex-1 overflow-hidden whitespace-nowrap relative">
              <div className="animate-marquee inline-block text-sm font-semibold tracking-wide">
                شحن مجاني للطلبات فوق 500 شيكل | استخدم كود GAMING10 للحصول على خصم 10%
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors shrink-0"
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
