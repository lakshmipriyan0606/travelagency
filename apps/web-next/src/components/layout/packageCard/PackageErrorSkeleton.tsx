// @ts-nocheck
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import noDataImg from "@/assets/image/no-data-clean.png";

interface PackageErrorSkeletonProps {
    message?: string;
    onRetry?: () => void;
}

const PackageErrorSkeleton = ({
    message = "Failed to load packages",
    onRetry
}: PackageErrorSkeletonProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center max-w-md w-full text-center"
            >
                {/* Visual Illustration */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full" />
                    <img
                        src={noDataImg}
                        alt="Error"
                        className="w-48 h-auto relative z-10 grayscale-[0.2]"
                    />
                </motion.div>

                {/* Error Message */}
                <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
                    Oops! Something went wrong
                </h3>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                    {message}. Please check your connection or try again.
                </p>

                {/* Retry Button */}
                {onRetry && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary/80 transition-all shadow-xl cursor-pointer"
                    >
                        <RefreshCcw size={18} className="animate-spin-slow" />
                        Try Again
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

export default PackageErrorSkeleton;

