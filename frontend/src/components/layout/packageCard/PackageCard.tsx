"use client";

import { SwiperSlide } from "swiper/react";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import { useDeviceSize } from "@/Hook/UseDevice";
import InnerCarousel from "../bestPackage/carousel/InnerCarousel";
import location from "@/assets/icons/location.svg";
import star from "@/assets/icons/Star.svg";
import { Heart } from "lucide-react";
import dateIcon from "@/assets/icons/date.svg";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog/DeleteConfirmDialog";
import { useState } from "react";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { DeleteCurrentPackage } from "@/api/admin/auth.api";
import { UpdateLikePackage } from "@/api/user/api";
import { useQueryClient } from "@tanstack/react-query";
import { WANumber } from "@/lib/utils";

interface Package {
    _id: string;
    images: string[];
    location: string;
    daysAndNights: string;
    rating: string | number;
    price: number;
    offerPrice: number;
    userLiked: boolean;
    isActive?: boolean;
    status?: string;
}

interface PackageCardProps {
    filterList: Package[];
    isAdmin: boolean;
    setEditPackageId: (id: string) => void;
    setActive: (active: string) => void;
    refetch?: () => void | any;
    handleLikeUpdate?: (id: string, liked: boolean) => void;
}

type LikePayload = {
    id: string;
    liked: boolean;
    userId: string | null;
};

export default function PackageCard({
    filterList = [],
    isAdmin,
    setEditPackageId,
    setActive,
    refetch,
    handleLikeUpdate = () => { }
}: PackageCardProps) {
    useDeviceSize();

    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { mutate: DeleteMutate } = useMutationAPIQuery(DeleteCurrentPackage, {
        onSuccess: () => {
            refetch?.();
        },
    });


    const { mutate: updateLikeMutate } = useMutationAPIQuery<
        unknown,
        any,
        LikePayload
    >(
        UpdateLikePackage,
        {
            onSuccess: (_data, variables) => {
                handleLikeUpdate?.(variables.id, variables.liked);
                queryClient.invalidateQueries({ queryKey: ["likePackage"] });
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
        updateLikeMutate({ id: packageId, liked, userId: localStorage.getItem("userId") });
    }

    const handleSendToWhatsApp = (currPackage: any) => {
        const phoneNumber = WANumber

        const message = `Hi! I am interested in ${currPackage?.packageName}. Please share the details. Thanks!`;


        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");
    };



    return (
        <div className={isAdmin ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
            <AnimatePresence mode="popLayout">
                {filterList.map((offer) => {
                    const details = getOfferDetailsConfig(offer);
                    return (
                        <motion.div
                            key={offer._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -25 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-col w-full"
                        >
                            <div className={`sm:p-2 ${isAdmin ? "group" : ""}`}>
                                <SwiperSlide>
                                    <div className="relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl text-gray-900">
                                        {isAdmin && (
                                            <div className="absolute top-0 right-4 opacity-0 scale-90 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 flex gap-4 z-30">
                                                <Pencil
                                                    className="w-6 h-6 text-gray-700 cursor-pointer hover:text-blue-600"
                                                    onClick={() => {
                                                        setEditPackageId(offer._id);
                                                        setActive("CreatePackage");
                                                    }}
                                                />
                                                <Trash2
                                                    className="w-6 h-6 text-gray-700 cursor-pointer hover:text-red-600"
                                                    onClick={() => {
                                                        setOpen(true);
                                                        setDeleteId(offer._id);
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Carousel */}
                                        <div className="">
                                            <InnerCarousel images={offer.images} offerId={offer._id} />

                                            {/* Discount Ribbon */}
                                            <div className="absolute top-0 right-0">
                                                <div className="absolute top-5 -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max">
                                                    50 % OFF
                                                </div>
                                                <div className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"></div>
                                            </div>

                                            {/* Status Badge (Admin Only) */}
                                            {isAdmin && (
                                                <div className={`absolute top-16 right-4 z-20 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md ${offer.status === 'Inactive' ? 'bg-red-500/80' : 'bg-emerald-500/80'}`}>
                                                    {offer.status || 'Active'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-col justify-center gap-3 p-2">
                                            <Row>
                                                <IconText icon={location} text={offer.location} />
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
                                                    className="p-2 cursor-pointer"
                                                >
                                                    <Heart
                                                        className={`${offer?.userLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                                                            } transition-all duration-300`}
                                                        size={24}
                                                    />
                                                </motion.button>
                                            </Row>

                                            {details.map((d, i) => (
                                                <IconText key={i} icon={d.icon} text={d.label} />
                                            ))}

                                            {/* Pricing */}
                                            <div className="mt-2 flex flex-col gap-3">
                                                <Row>
                                                    <span className="font-semibold">From</span>
                                                    <PriceStrike original={Number(offer?.price)} final={offer.offerPrice} />
                                                </Row>

                                                <Divider />

                                                <Row className="flex-col sm:flex-row gap-4 mt-2">
                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                                                        <img src={whatsappIcon} alt="whatsapp" className="w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleSendToWhatsApp(offer)} />
                                                        <span className="sm:hidden text-white font-medium">WhatsApp Us</span>
                                                    </div>
                                                    <AnimatedButton
                                                        buttonText="CONTACT US"
                                                        className="w-full sm:w-3/4 hover:bg-custom-black"
                                                        borderButtonColor="bg-white"
                                                        textColor="text-white"
                                                        bgColor="bg-custom-black"
                                                    />
                                                </Row>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </div>

                            {open && (
                                <DeleteConfirmDialog
                                    open={open}
                                    onOpenChange={setOpen}
                                    onConfirm={handleDelete}
                                    title="Delete Package?"
                                    description="Are you sure you want to delete this package permanently?"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

function getOfferDetailsConfig(offer: Package) {
    return [
        { icon: dateIcon, label: offer.daysAndNights },
        { icon: star, label: offer.rating },
    ];
}

function Row({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return <div className={`flex items-center justify-between gap-4 ${className}`}>{children}</div>;
}

function Divider() {
    return <div className="w-full h-[2px] bg-gray-300" />;
}

function IconText({ icon, text }: { icon: string; text: string | any }) {
    return (
        <div className="flex items-center gap-3">
            <img src={icon} alt="" />
            <h3>{text}</h3>
        </div>
    );
}

function PriceStrike({ original, final }: { original: number | string; final: number | string }) {
    return (
        <span className="flex items-center text-lg">
            <span className="relative inline-block text-base mr-2">
                {original}
                <span className="absolute top-1/2 right-0 w-full h-[3px] bg-red-500 rotate-[10deg]" />
            </span>
            <span className="sm:text-lg font-semibold">{final}</span>
        </span>
    );
}
