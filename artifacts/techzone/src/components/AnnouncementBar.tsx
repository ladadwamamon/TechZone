import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useSiteSettings, DEFAULT_ANNOUNCEMENT_TEXT } from "@/lib/settings";

export function AnnouncementBar() {
  const { announcement } = useSiteSettings();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("nexus-announcement-dismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nexus-announcement-dismissed", "true");
  };

  const text = announcement.text.trim() || DEFAULT_ANNOUNCEMENT_TEXT;
  const show = isVisible && announcement.enabled;

  const marquee = (
    <div className="animate-marquee inline-block text-sm font-mono font-bold tracking-widest neon-text-magenta">
      {text}
    </div>
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-secondary/20 border-b border-secondary neon-border-magenta overflow-hidden text-secondary"
        >
          <div className="container mx-auto px-4 py-1.5 flex items-center justify-between relative">
            <div className="flex-1 overflow-hidden whitespace-nowrap relative flex items-center gap-4">
              <span className="text-xs font-mono font-bold shrink-0 animate-pulse text-secondary">{"[ SYSTEM_ALERT ]"}</span>
              {announcement.link.trim() ? (
                <Link href={announcement.link} className="overflow-hidden">
                  {marquee}
                </Link>
              ) : (
                marquee
              )}
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
