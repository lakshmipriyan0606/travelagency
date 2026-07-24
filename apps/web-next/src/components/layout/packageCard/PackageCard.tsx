"use client";

import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import InnerCarousel from "../bestPackage/carousel/InnerCarousel";
import locationIcon from "@/assets/icons/location.svg";
import { Heart, Pencil, Trash2, Crown, Clock } from "lucide-react";
import dateIcon from "@/assets/icons/date.svg";
import starIcon from "@/assets/icons/Star.svg";

import { AnimatePresence, motion } from "framer-motion";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog/DeleteConfirmDialog";
import { useState } from "react";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { DeleteCurrentPackage, UpdatePackageRank, TogglePackageStatus, GetTakenRanks } from "@/api/admin/auth.api";
import { UpdateLikePackage } from "@/api/user/api";
import { useQueryClient } from "@tanstack/react-query";
import { WANumber, CurrencySymbol } from "@/lib/utils";
import { toast } from "react-toastify";
import EnquiryModal from "../herosection/EnquiryModal";
import { RANK_OPTIONS } from "@/config/rankConfig";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";

const calculateDiscountPercentage = (price: number, offerPrice: number) => {
    if (!price || !offerPrice || price <= offerPrice) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
};

export interface Package {
    _id: string;
    type?: "package" | "activity";
    packageName: string;
    images: { url: string; alt: string }[];
    location: string;
    daysAndNights: string;
    hotelName: string;
    price: number;
    offerPrice: number;
    userLiked: boolean;
    isActive?: boolean;
    status?: string;
    isBestPackage?: boolean;
    bestRank?: number | string | null;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
    };
    activityCategory?: string;
}


interface PackageCardProps {
    offer: Package;
    isAdmin: boolean;
    setEditPackageId: (id: string) => void;
    setActive: (active: string) => void;
    refetch?: () => void | any;
    handleLikeUpdate?: (id: string, liked: boolean) => void;
    isAllPackagePage?: boolean;
    className?: string;
    takenRanks?: { rank: number; packageId: string; packageName: string }[];
}

type LikePayload = {
    id: string;
    liked: boolean;
    userId: string | null;
};

export function SinglePackageCard({
    offer,
    isAdmin,
    setEditPackageId,
    setActive,
    refetch,
    handleLikeUpdate = () => { },
    isAllPackagePage = false,
    className = "",
    takenRanks = []
}: PackageCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showRankPicker, setShowRankPicker] = useState(false);
    const queryClient = useQueryClient();

    const isActivity =
        offer.type === "activity" ||
        (!!(offer.activityCategory && offer.activityCategory !== "" && offer.activityCategory !== "none"));

    const availableRanks = RANK_OPTIONS.filter(rank => {
        const taken = (takenRanks || []).find((t: any) => 
            String(t.rank) === String(rank) && !!t.isActivity === isActivity
        );
        // Show if: not taken, OR taken by THIS package (so it stays highlighted)
        return !taken || taken.packageId === offer._id;
    });

    const { mutate: DeleteMutate } = useMutationAPIQuery(DeleteCurrentPackage, {
        onSuccess: () => {
            toast.success("Package deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            refetch?.();
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete package");
        }
    });

    const { mutate: updateLikeMutate } = useMutationAPIQuery<unknown, any, LikePayload>(
        UpdateLikePackage,
        {
            onSuccess: (_data, variables) => {
                handleLikeUpdate?.(variables.id, variables.liked);
                queryClient.invalidateQueries({ queryKey: ["likePackage"] });
                queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
            },
        }
    );

    const { mutate: updateRankMutate } = useMutationAPIQuery(UpdatePackageRank, {
        onSuccess: () => {
            toast.success("Rank updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
            queryClient.invalidateQueries({ queryKey: ["takenRanks"] });
            refetch?.();
            setShowRankPicker(false);
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update rank");
        },
    });

    const { mutate: toggleStatusMutate } = useMutationAPIQuery(TogglePackageStatus, {
        onSuccess: (data: any) => {
            toast.success(data?.message || "Status updated!");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            refetch?.();
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to toggle status");
        },
    });

    const handleDelete = () => {
        if (deleteId) {
            DeleteMutate(deleteId);
            setOpen(false);
            setDeleteId(null);
        }
    };

    const handleToggleLike = (packageId: string, liked: boolean) => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast.warn("Please login to like this package");
            return;
        }
        updateLikeMutate({ id: packageId, liked, userId: userId });
    }

    const handleSendToWhatsApp = (currPackage: any) => {
        const phoneNumber = WANumber;
        const message = `Hi! I am interested in ${currPackage?.packageName}. Please share the details. Thanks!`;
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <div className={`relative flex flex-col bg-white rounded-lg text-gray-900 h-full ${className}`}>
            {isAdmin && (
                <div className="absolute top-3 left-3 flex gap-2 z-40">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditPackageId(offer._id);
                            setActive("CreatePackage");
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
            )}

            {/* Quick Rank Medal Badge (Admin Only) */}
            {isAdmin && (
                <div className="absolute top-2 left-25 z-40">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowRankPicker(!showRankPicker);
                        }}
                        className="relative group cursor-pointer"
                        title={offer.bestRank ? `Rank ${offer.bestRank}` : 'Set Rank'}
                    >
                        {/* Medal Body */}
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
            )}

            {/* Carousel */}
            <div className="relative">
                <InnerCarousel
                    images={offer.images}
                    offerId={offer._id}
                    packageName={offer.packageName}
                    isActivity={isActivity}
                />

                {/* Discount Ribbon */}
                {!isActivity && (
                    <div className="absolute top-0 right-0">
                        <div className="absolute top-5 -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max">
                            <em className="relative z-10">{calculateDiscountPercentage(offer?.price, offer?.offerPrice)}% OFF</em>
                        </div>
                        <div className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"></div>
                    </div>
                )}

                {/* Status Toggle Badge (Admin Only) */}
                {isAdmin && (
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
                )}
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 gap-2 p-4">
                <div className="flex items-center gap-2">
                    <img src={starIcon} alt="Best Package" className="w-4 h-4" />
                    <h2 className="text-gray-900 line-clamp-1 pl-1">
                        {offer.packageName}
                    </h2>
                </div>

                <div className="flex flex-col gap-2">
                    <Row>
                        <IconText icon={locationIcon} text={offer.location} />
                        <motion.button
                            onClick={() => handleToggleLike(offer._id, !offer.userLiked)}
                            whileTap={{ scale: 0.75 }}
                            animate={{
                                scale: offer.userLiked ? [1, 1.4, 1] : 1,
                                rotate: offer.userLiked ? [0, -8, 8, -5, 5, 0] : 0,
                            }}
                            transition={{
                                duration: 0.35,
                                ease: "easeInOut",
                                type: "tween"
                            }}
                            className="p-1 cursor-pointer"
                        >
                            <Heart
                                className={`${offer?.userLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                                    } transition-all duration-300`}
                                size={22}
                            />
                        </motion.button>
                    </Row>

                    <IconText icon={isActivity ? <Clock size={18} className="text-gray-500" /> : dateIcon} text={offer.daysAndNights} />
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2">
                    {/* Pricing */}
                    {!isActivity && (
                        <>
                            <Row>
                                <span className="font-semibold">From</span>
                                <PriceStrike original={Number(offer?.price)} final={offer.offerPrice} />
                            </Row>
                            <Divider />
                        </>
                    )}

                    <Row className="gap-3 mt-1">
                        <img
                            src={whatsappIcon}
                            alt="whatsapp"
                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform active:scale-95"
                            onClick={() => handleSendToWhatsApp(offer)}
                        />
                        <AnimatedButton
                            buttonText={isActivity ? "EXPLORE ACTIVITY" : (isAllPackagePage ? "EXPLORE PACKAGE" : "EXPLORE PACKAGE")}
                            className="flex-1 hover:bg-custom-black py-2.5"
                            borderButtonColor="bg-white"
                            textColor="text-white"
                            bgColor="bg-custom-black"
                            to={`${isActivity ? "/activity" : "/package"}/${offer.packageName
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "")}`}
                        />
                    </Row>
                </div>
            </div>

            <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {open && (
                <DeleteConfirmDialog
                    open={open}
                    onOpenChange={setOpen}
                    onConfirm={handleDelete}
                    title="Delete Package?"
                    description="Are you sure you want to delete this package permanently?"
                />
            )}
        </div>
    );
}

interface PackageGridProps {
    filterList: Package[];
    isAdmin: boolean;
    setEditPackageId: (id: string) => void;
    setActive: (active: string) => void;
    refetch?: () => void | any;
    handleLikeUpdate?: (id: string, liked: boolean) => void;
    isAllPackagePage?: boolean;
}

export default function PackageCard({
    filterList = [],
    isAdmin,
    setEditPackageId,
    setActive,
    refetch,
    handleLikeUpdate = () => { },
    isAllPackagePage = false
}: PackageGridProps) {
    // Fetch taken ranks once for the entire grid (admin only)
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

function Row({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex items-center justify-between gap-4 ${className}`}>{children}</div>;
}

function Divider() {
    return <div className="w-full h-[2px] bg-gray-300" />;
}

function IconText({ icon, text }: { icon: any; text: string | any }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            {typeof icon === 'string' ? <img src={icon} alt="" className="w-5 h-5" /> : icon}
            <h3 className="line-clamp-1">{text}</h3>
        </div>
    );
}

function PriceStrike({ original, final }: { original: number | string; final: number | string }) {
    return (
        <span className="flex items-center text-lg">
            <span className="relative inline-block text-base mr-2">
                {CurrencySymbol} {original}
                <span className="absolute top-1/2 right-0 w-full h-[3px] bg-red-500 rotate-[10deg]" />
            </span>
            <span className="text-xl font-bold text-gray-900">{CurrencySymbol} {final}</span>
        </span>
    );
}
