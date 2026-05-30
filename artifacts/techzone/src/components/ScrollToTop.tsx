import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-background border border-primary text-primary clip-corner shadow-[0_0_15px_var(--cyan)] hover:bg-primary hover:text-background transition-all glow-hover group"
          aria-label="العودة للأعلى"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          <span className="absolute -top-6 right-1/2 translate-x-1/2 text-[10px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">TOP</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
