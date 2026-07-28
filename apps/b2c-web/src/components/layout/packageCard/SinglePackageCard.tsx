import { useState } from "react";
import { Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";

import { PackageCardProps } from "./types";
import { usePackageActions } from "./usePackageActions";
import { Row, Divider, IconText, PriceStrike } from "./PackageCardUI";

import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import InnerCarousel from "../bestPackage/carousel/InnerCarousel";
import EnquiryModal from "../herosection/EnquiryModal";

import whatsappIcon from "@/assets/icons/whatsapp.svg";
import locationIcon from "@/assets/icons/location.svg";
import dateIcon from "@/assets/icons/date.svg";
import starIcon from "@/assets/icons/Star.svg";
import { WANumber } from "@/lib/utils";

const calculateDiscountPercentage = (price: number, offerPrice: number) => {
    if (!price || !offerPrice || price <= offerPrice) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
};

export function SinglePackageCard({
    offer,
    refetch,
    handleLikeUpdate = () => {},
    isAllPackagePage = false,
    className = "",
}: PackageCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { updateLike } = usePackageActions(refetch);

    const isActivity = offer.type === "activity" || (!!(offer.activityCategory && offer.activityCategory !== "" && offer.activityCategory !== "none"));

    const handleToggleLike = (packageId: string, liked: boolean) => {
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
        if (!userId) {
            toast.warn("Please login to like this package");
            return;
        }
        updateLike({ id: packageId, liked, userId }, {
            onSuccess: () => handleLikeUpdate(packageId, liked)
        });
    };

    const handleSendToWhatsApp = (currPackage: any) => {
        const message = `Hi! I am interested in ${currPackage?.packageName}. Please share the details. Thanks!`;
        const url = `https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <div className={`relative flex flex-col bg-white rounded-lg text-gray-900 h-full ${className}`}>
            <div className="relative">
                <InnerCarousel images={offer.images} offerId={offer._id} packageName={offer.packageName} isActivity={isActivity} />

                {!isActivity && (
                    <div className="absolute top-0 right-0">
                        <div className="absolute top-5 -right-3 z-20 bg-red-500 text-white font-bold px-4 py-0 w-max">
                            <em className="relative z-10">{calculateDiscountPercentage(offer?.price, offer?.offerPrice)}% OFF</em>
                        </div>
                        <div className="absolute top-9 -right-1 h-5 w-2 bg-red-500 brightness-90 rotate-[60deg]"></div>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 gap-2 p-4">
                <div className="flex items-center gap-2">
                    <Image src={starIcon} alt="Best Package" className="w-4 h-4" />
                    <h2 className="text-gray-900 line-clamp-1 pl-1">{offer.packageName}</h2>
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
                            transition={{ duration: 0.35, ease: "easeInOut", type: "tween" }}
                            className="p-1 cursor-pointer"
                        >
                            <Heart className={`${offer?.userLiked ? "fill-red-500 text-red-500" : "text-gray-400"} transition-all duration-300`} size={22} />
                        </motion.button>
                    </Row>
                    <IconText icon={isActivity ? <Clock size={18} className="text-gray-500" /> : dateIcon} text={offer.daysAndNights} />
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-2">
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
                        <Image
                            src={whatsappIcon}
                            alt="whatsapp"
                            className="w-10 h-10 cursor-pointer hover:scale-110 transition-transform active:scale-95"
                            onClick={() => handleSendToWhatsApp(offer)}
                        />
                        <AnimatedButton
                            buttonText={isActivity ? "EXPLORE ACTIVITY" : "EXPLORE PACKAGE"}
                            className="flex-1 hover:bg-custom-black py-2.5"
                            borderButtonColor="bg-white"
                            textColor="text-white"
                            bgColor="bg-custom-black"
                            to={`${isActivity ? "/activity" : "/package"}/${offer.packageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                        />
                    </Row>
                </div>
            </div>

            <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
