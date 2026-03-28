import { useNavigate } from "react-router-dom";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetActivityCategories } from "@/api/user/api";
import { motion } from "framer-motion";
import { GLOBAL_CONFIG } from "@/config/globalConfig";

const ActivityCardSkeleton = () => (
    <div className="h-72 rounded-[32px] bg-neutral-100 animate-pulse border border-neutral-200" />
);

const ActivitySection = () => {
    const navigate = useNavigate();
    const { data, isLoading } = UseFetchAPIQuery({
        key: ["activityCategories"],
        queryFn: GetActivityCategories,
    });

    const categories: string[] = data?.data || [];
    console.log(categories);
    // Fallback to global config if API returns nothing or only one (ensure UI is rich)
    const displayCategories = !categories.length
        ? categories
        : GLOBAL_CONFIG.activityCategories.map(c => c.value);

    if (!isLoading && displayCategories.length === 0) return null;

    return (
        <section className="bg-white main__container_space border-b border-neutral-100 py-16">
            <div className="main__container_space_nextContainer">
                {/* Section Header */}
                <div className="flex justify-between gap-5 items-center pb-10 ">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl leading-tight">
                        Explore by  <span className="text-yellow-400">Experience</span>
                    </h2>
                    <button
                        onClick={() => navigate("/activities")}
                        className="hidden sm:flex items-center gap-2 text-[10px] font-black text-neutral-400 hover:text-primary transition-all uppercase tracking-widest group cursor-pointer"
                    >
                        View All
                        <span className="group-hover:translate-x-1 transition-transform text-primary">→</span>
                    </button>
                </div>

                {/* Trendy Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {isLoading
                        ? [1, 2, 3, 4, 5].map((n) => <ActivityCardSkeleton key={n} />)
                        : displayCategories.map((categoryValue, idx) => {
                            const configMatch = GLOBAL_CONFIG.activityCategories.find(c => c.value === categoryValue);
                            const emoji = configMatch?.emoji || "🌍";
                            const description = configMatch?.description || "Discover amazing adventures";

                            // Dynamic Unsplash images for a trendy look (Updated for reliability)
                            const imageUrl = `https://images.unsplash.com/photo-${categoryValue === "Hiking" ? "1501555088652-ca21fb3f0581" :
                                categoryValue === "Snorkeling" ? "1544551763-47a0159f37c3" :
                                    categoryValue === "Relaxing" ? "1507525428034-b723cf961d3e" :
                                        categoryValue === "Boating" ? "1544111308-412702a4501a" :
                                            categoryValue === "Sightseeing" ? "1518391846015-55a9cc003b25" :
                                                categoryValue === "Water Sports" ? "1520116468816-95b69f847357" :
                                                    categoryValue === "Shopping" ? "1567401893414-76b7b1e5a7a5" :
                                                        categoryValue === "Safari" ? "1475066312211-f9e4c19ed8f2" :
                                                            categoryValue === "Adventure" ? "1533240332313-0db49b459ad6" :
                                                                categoryValue === "Diving" ? "1544552866-d3ed42536cfd" :
                                                                    categoryValue === "Cycling" ? "1471506480208-35d32e18b86d" :
                                                                        categoryValue === "Skiing" ? "1551698618-102151046741" :
                                                                            categoryValue === "Cultural" ? "1467269204044-83717d07c39b" :
                                                                                "1469474968028-56623f02e42e"
                                }?auto=format&fit=crop&w=600&q=80`;

                            return (
                                <motion.div
                                    key={categoryValue}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className="group relative h-80 rounded-[32px] overflow-hidden cursor-pointer shadow-2xl shadow-neutral-200/50"
                                    onClick={() => navigate(`/activities?type=${encodeURIComponent(categoryValue)}`)}
                                >
                                    {/* Image Background */}
                                    <img
                                        src={imageUrl}
                                        alt={categoryValue}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Glass Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                                    {/* Floating Badge (Emoji) */}
                                    <div className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/30 group-hover:scale-110 transition-transform">
                                        {emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 transform transition-transform duration-500 group-hover:-translate-y-2">
                                        <h3 className="text-xl text-white mb-1">
                                            {categoryValue}
                                        </h3>
                                        <p className="text-[10px] text-white/70 uppercase mb-4">
                                            {description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                </div>

                {/* Mobile View All */}
                <div className="text-center mt-8 sm:hidden px-4">
                    <button
                        onClick={() => navigate("/activities")}
                        className="w-full py-4 rounded-2xl bg-neutral-100 text-neutral-800 text-xs font-black uppercase tracking-widest active:scale-95 transition-all border border-neutral-200"
                    >
                        View All Activities →
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ActivitySection;
