"use client";

import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import { useDeviceSize } from "@/Hook/UseDevice";
import InnerCarousel from "../bestPackage/carousel/InnerCarousel";
import locationIcon from "@/assets/icons/location.svg";
import { Heart, Pencil, Trash2 } from "lucide-react";
import dateIcon from "@/assets/icons/date.svg";
import starIcon from "@/assets/icons/Star.svg";

import { AnimatePresence, motion } from "framer-motion";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog/DeleteConfirmDialog";
import { useState } from "react";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { DeleteCurrentPackage } from "@/api/admin/auth.api";
import { UpdateLikePackage } from "@/api/user/api";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { WANumber, CurrencySymbol } from "@/lib/utils";
import { toast } from "react-toastify";
import EnquiryModal from "../herosection/EnquiryModal";

const calculateDiscountPercentage = (price: number, offerPrice: number) => {
    if (!price || !offerPrice || price <= offerPrice) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
};

export interface Package {
    _id: string;
    packageName: string;
    images: string[];
    location: string;
    daysAndNights: string;
    hotelName: string;
    price: number;
    offerPrice: number;
    userLiked: boolean;
    isActive?: boolean;
    status?: string;
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
    className = ""
}: PackageCardProps) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const queryClient = useQueryClient();

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

            {/* Carousel */}
            <div className="relative">
                <InnerCarousel
                    images={offer.images}
                    offerId={offer._id}
                    packageName={offer.packageName}
                />

                {/* Discount Ribbon */}
                <div className="absolute top-0 right-0">
                    <div className="absolute top-5 -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max">
                        <em className="relative z-10">{calculateDiscountPercentage(offer?.price, offer?.offerPrice)}% OFF</em>
                    </div>
                    <div className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"></div>
                </div>

                {/* Status Badge (Admin Only) */}
                {isAdmin && (
                    <div className={`absolute top-16 right-3 z-30 text-white text-[9px] uppercase font-black px-3 py-1 rounded-full shadow-xl backdrop-blur-md border border-white/20 ${offer.status === 'Inactive' ? 'bg-rose-500/90' : 'bg-emerald-500/90'} tracking-tighter`}>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full bg-white ${offer.status !== 'Inactive' ? 'animate-pulse' : ''}`} />
                            {offer.status || 'Active'}
                        </div>
                    </div>
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

                    <IconText icon={dateIcon} text={offer.daysAndNights} />
                </div>

                {/* Pricing */}
                <div className="mt-auto flex flex-col gap-3 pt-2">
                    <Row>
                        <span className="font-semibold">From</span>
                        <PriceStrike original={Number(offer?.price)} final={offer.offerPrice} />
                    </Row>

                    <Divider />

                    <Row className="gap-3 mt-1">
                        <img
                            src={whatsappIcon}
                            alt="whatsapp"
                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform active:scale-95"
                            onClick={() => handleSendToWhatsApp(offer)}
                        />
                        <AnimatedButton
                            buttonText={isAllPackagePage ? "EXPLORE PACKAGE" : "CONTACT US"}
                            className="flex-1 hover:bg-custom-black py-2.5"
                            borderButtonColor="bg-white"
                            textColor="text-white"
                            bgColor="bg-custom-black"
                            onClick={() => {
                                const slug = offer.packageName
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");
                                navigate(`/package/${slug}?id=${offer._id}`);
                            }}
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
    useDeviceSize();

    return (
        <div className={isAdmin ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
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
