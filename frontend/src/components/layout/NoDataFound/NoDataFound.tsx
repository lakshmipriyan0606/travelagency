import { SearchX } from "lucide-react";
import { motion } from "framer-motion";

interface NoDataFoundProps {
    message?: string;
    subMessage?: string;
}

const NoDataFound = ({
    message = "No Packages Found",
    subMessage = "We couldn't find any packages matching your current filters. Try adjusting your search or clearing the filters."
}: NoDataFoundProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-12 text-center w-full min-h-[400px] bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200"
        >
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
                <div className="relative bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <SearchX className="w-12 h-12 text-neutral-400" />
                </div>
            </div>
            
            <h3 className="text-2xl font-bold text-neutral-800 mb-3 tracking-tight">
                {message}
            </h3>
            <p className="text-neutral-500 max-w-sm leading-relaxed text-sm">
                {subMessage}
            </p>
            
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
                className="mt-8 px-6 py-2.5 bg-white text-neutral-800 text-sm font-semibold rounded-full border border-neutral-200 shadow-sm hover:bg-neutral-50 transition-colors"
            >
                Reset Search
            </motion.button>
        </motion.div>
    );
};

export default NoDataFound;
