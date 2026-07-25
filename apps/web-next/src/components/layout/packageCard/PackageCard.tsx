import { AnimatePresence, motion } from "framer-motion";
import { SinglePackageCard } from "./SinglePackageCard";
import { PackageGridProps } from "./types";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetTakenRanks } from "@/api/admin/auth.api";

export { SinglePackageCard };
export * from "./types";

export default function PackageCard({
    filterList = [],
    isAdmin,
    setEditPackageId,
    setActive,
    refetch,
    handleLikeUpdate = () => { },
    isAllPackagePage = false
}: PackageGridProps) {
    const { data: takenRanksData } = UseFetchAPIQuery({
        key: ["takenRanks"],
        queryFn: GetTakenRanks,
        options: { enabled: isAdmin },
    });

    const takenRanks = takenRanksData?.takenRanks || [];

    return (
        <div className={isAdmin ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
            <AnimatePresence mode="popLayout">
                {filterList.map((offer) => (
                    <motion.div
                        key={offer._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: -25 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="flex flex-col w-full"
                    >
                        <div className={`sm:p-2 ${isAdmin ? "group" : ""}`}>
                            <SinglePackageCard
                                offer={offer}
                                isAdmin={isAdmin}
                                setEditPackageId={setEditPackageId}
                                setActive={setActive}
                                refetch={refetch}
                                handleLikeUpdate={handleLikeUpdate}
                                isAllPackagePage={isAllPackagePage}
                                className="shadow-xl border border-white"
                                takenRanks={takenRanks}
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
