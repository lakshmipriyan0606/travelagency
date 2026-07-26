import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, Crown } from "lucide-react";
import { useState } from "react";
import { RANK_OPTIONS } from "@/config/rankConfig";
import { Package } from "./types";

import { useRouter } from "next/navigation";

interface AdminControlsProps {
    offer: Package;
    setEditPackageId?: (id: string) => void;
    setActive?: (active: string) => void;
    setOpen: (open: boolean) => void;
    setDeleteId: (id: string) => void;
    updateRankMutate: (payload: { id: string, bestRank: string | null }) => void;
    toggleStatusMutate: (id: string) => void;
    takenRanks: { rank: number; packageId: string; packageName: string; isActivity?: boolean }[];
    isActivity: boolean;
}

export function PackageCardAdminControls({
    offer,
    setEditPackageId,
    setActive,
    setOpen,
    setDeleteId,
    updateRankMutate,
    toggleStatusMutate,
    takenRanks,
    isActivity
}: AdminControlsProps) {
    const [showRankPicker, setShowRankPicker] = useState(false);
    const router = useRouter();

    const availableRanks = RANK_OPTIONS.filter(rank => {
        const taken = (takenRanks || []).find((t: any) => 
            String(t.rank) === String(rank) && !!t.isActivity === isActivity
        );
        return !taken || taken.packageId === offer._id;
    });

    return (
        <>
            <div className="absolute top-3 left-3 flex gap-2 z-40">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Next.js App Router navigation
                        router.push(`/admin/${isActivity ? 'activities' : 'packages'}/${offer._id}`);
                    }}
                    className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-700 shadow-xl hover:bg-neutral-800 hover:text-white transition-all transform active:scale-95 border border-white"
                    title="Edit Package"
                >
                    <Pencil size={12} strokeWidth={3} />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(true);
                        setDeleteId(offer._id);
                    }}
                    className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-700 shadow-xl hover:bg-red-500 hover:text-white transition-all transform active:scale-95 border border-white"
                    title="Delete Package"
                >
                    <Trash2 size={12} strokeWidth={3} />
                </button>
            </div>

            <div className="absolute top-2 left-25 z-40">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowRankPicker(!showRankPicker);
                    }}
                    className="relative group cursor-pointer"
                    title={offer.bestRank ? `Rank ${offer.bestRank}` : 'Set Rank'}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-lg border-2 transition-all active:scale-90 ${offer.isBestPackage && offer.bestRank
                        ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-amber-600/40 text-amber-900'
                        : 'bg-white/90 backdrop-blur-md border-neutral-200 text-neutral-400 hover:border-amber-300'
                        }`}>
                        {offer.isBestPackage && offer.bestRank ? offer.bestRank : <Crown size={15} />}
                    </div>
                </button>

                <AnimatePresence>
                    {showRankPicker && (
                        <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.9 }}
                            className="absolute top-12 right-0 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2 flex flex-col gap-1.5 min-w-[44px] z-50"
                        >
                            {availableRanks.map((rank) => (
                                <button
                                    key={rank}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateRankMutate({ id: offer._id, bestRank: String(rank) });
                                        setShowRankPicker(false);
                                    }}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all hover:scale-110 cursor-pointer ${String(offer.bestRank) === String(rank)
                                        ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-md ring-2 ring-amber-400/30'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-amber-100 hover:text-amber-700'
                                        }`}
                                >
                                    {rank}
                                </button>
                            ))}
                            {offer.isBestPackage && offer.bestRank && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateRankMutate({ id: offer._id, bestRank: null });
                                        setShowRankPicker(false);
                                    }}
                                    className="w-9 h-9 rounded-xl text-[9px] font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
                                    title="Remove Rank"
                                >
                                    ✕
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleStatusMutate(offer._id);
                }}
                title={`Click to ${offer.status === 'Inactive' ? 'Activate' : 'Deactivate'}`}
                className={`absolute top-16 right-3 z-30 text-white text-[9px] uppercase font-black px-3 py-1 rounded-full shadow-xl backdrop-blur-md border border-white/20 cursor-pointer transition-all hover:scale-105 active:scale-95 ${offer.status === 'Inactive' ? 'bg-rose-500/90 hover:bg-rose-600' : 'bg-emerald-500/90 hover:bg-emerald-600'
                    } tracking-tighter`}
            >
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full bg-white ${offer.status !== 'Inactive' ? 'animate-pulse' : ''}`} />
                    {offer.status || 'Active'}
                </div>
            </button>
        </>
    );
}
