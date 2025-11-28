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

interface Package {
    _id: string;
    images: string[];
    location: string;
    daysAndNights: string;
    rating: string | number;
    price: number;
    offerPrice: number;
    userLiked: boolean;
}

interface PackageCardProps {
    filterList: Package[];
    isAdmin: boolean;
    setEditPackageId: (id: string) => void;
    setActive: (active: string) => void;
    refetch?: () => void | any;
}

export default function PackageCard({
    filterList = [],
    isAdmin,
    setEditPackageId,
    setActive,
    refetch
}: PackageCardProps) {
    useDeviceSize();
    console.log('filterList: ', filterList);

    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { mutate: DeleteMutate } = useMutationAPIQuery(DeleteCurrentPackage, {
        onSuccess: () => {
            refetch?.();
        },
    });


    const { mutate: updateLikeMutate } = useMutationAPIQuery(UpdateLikePackage, {
        onSuccess: () => {
            console.log('Like status updated successfully');
        refetch?.();
        }
    });



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


    return (
        <div className="flex flex-col gap-6 items-center justify-center max-w-7xl mx-auto p-2 sm:p-5 w-full">
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
                            <div className={`msm:p-2 ${isAdmin ? "group" : ""}`}>
                                <SwiperSlide>
                                    <div className="relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-xl text-gray-900">
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
                                        <div className="w-full sm:relative sm:w-[55%]">
                                            <InnerCarousel images={offer.images} offerId={offer._id} />

                                            {/* Discount Ribbon */}
                                            <div className="absolute top-0 right-0">
                                                <div className="absolute top-5 font-roboto -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max">
                                                    50 % OFF
                                                </div>
                                                <div className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"></div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-col justify-center gap-3 p-8 md:w-[45%] font-roboto">
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
                                                        type: "tween",
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

                                                <Row>
                                                    <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12" />
                                                    <AnimatedButton
                                                        buttonText="Contact us"
                                                        className="w-3/4 hover:bg-custom-black"
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

function Row({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-between gap-4">{children}</div>;
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
