

export const bestPackageOfferList = [
    {
        id: 1,
        location: "Explore Paris",
        packageType: "Family",
        days: "7 Days, 6 Nights",
        price: 4500,
        offerPrice: 2200,
        hotelName: "Hotel Grand Mercure",
        images: [
            "https://picsum.photos/id/1015/800/600",
            "https://picsum.photos/id/1016/800/600",
            "https://picsum.photos/id/1018/800/600"
        ],
    },
    {
        id: 2,
        location: "Discover Bali",
        packageType: "Honeymoon",
        days: "5 Days, 4 Nights",
        price: 2200,
        offerPrice: 1500,
        hotelName: "Bali Beach Resort",
        images: [
            "https://picsum.photos/id/1031/800/600",
            "https://picsum.photos/id/1032/800/600",
            "https://picsum.photos/id/1033/800/600"
        ],
    },
    {
        id: 3,
        location: "Swiss Adventure",
        packageType: "Friends",
        days: "8 Days, 7 Nights",
        price: 2000,
        offerPrice: 500,
        hotelName: "Swiss Alps Lodge",
        images: [
            "https://picsum.photos/id/1040/800/600",
            "https://picsum.photos/id/1041/800/600",
            "https://picsum.photos/id/1042/800/600"
        ],
    },
    {
        id: 4,
        location: "Tokyo Experience",
        packageType: "Family",
        days: "6 Days, 5 Nights",
        price: 5800,
        offerPrice: 4000,
        hotelName: "Tokyo Tower View Hotel",
        images: [
            "https://picsum.photos/id/1020/800/600",
            "https://picsum.photos/id/1021/800/600",
            "https://picsum.photos/id/1022/800/600"
        ],
    },
    {
        id: 5,
        location: "Dubai Luxury Tour",
        packageType: "Friends",
        days: "4 Days, 3 Nights",
        price: 3000,
        offerPrice: 2800,
        hotelName: "Dubai Oasis Palms",
        images: [
            "https://picsum.photos/id/1050/800/600",
            "https://picsum.photos/id/1051/800/600",
            "https://picsum.photos/id/1052/800/600"
        ],
    },
];



export const filterConfig = {
    packageTypes: ["Honeymoon", "Family", "Friends"],
    budgets: ["Below RM 1K", "RM 1K - RM 3K", "RM 3K - RM 5K", "Above RM 5K"],
    daysAndNights: ["2 Days, 2 Nights", "4 Days, 3 Nights", "7 Days, 6 Nights"],
};



export function calculateDiscountPercentage(originalPrice:number, offerPrice:number) {
    if (originalPrice <= 0) {
        throw new Error("Original price must be greater than 0");
    }

    const discount = originalPrice - offerPrice;
    const discountPercentage = (discount / originalPrice) * 100;

    return Math.round(discountPercentage)
}
