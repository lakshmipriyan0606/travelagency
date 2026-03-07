import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
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
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 sm:bottom-8 right-6 z-[60] group cursor-pointer"
                    aria-label="Back to top"
                >
                    {/* Main circle */}
                    <div className="relative w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-100 transition-transform duration-300 group-hover:scale-110">
                        <ChevronUp className="w-6 h-6 text-yellow-500 transition-transform duration-300 group-hover:-translate-y-1" strokeWidth={3} />

                        {/* Animated outer ring effect similar to design but simplified */}
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20 animate-ping opacity-0 group-hover:opacity-100" />
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
