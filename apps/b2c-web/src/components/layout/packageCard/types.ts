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

export interface PackageCardProps {
    offer: Package;
    refetch?: () => void | any;
    handleLikeUpdate?: (id: string, liked: boolean) => void;
    isAllPackagePage?: boolean;
    className?: string;
}

export interface PackageGridProps {
    filterList: Package[];
    refetch?: () => void | any;
    handleLikeUpdate?: (id: string, liked: boolean) => void;
    isAllPackagePage?: boolean;
}

export type LikePayload = {
    id: string;
    liked: boolean;
    userId: string | null;
};
