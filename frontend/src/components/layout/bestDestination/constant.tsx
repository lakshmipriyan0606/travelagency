import kualaLumpurLocal from "@/assets/image/popularDestination/Kuala Lumpur.jpeg";
import langkawiLocal from "@/assets/image/popularDestination/Langkawi.jpeg";
import gentingHighlandsLocal from "@/assets/image/popularDestination/Genting Highlands.jpeg";
import penangLocal from "@/assets/image/popularDestination/Penang.jpeg";

type Package = {
    id: number;
    alt: string;
    src: string;
    title: string;
    description?: string;
    fallbackSrc?: string;
};

export const bestPackageList: Package[] = [

    {
        id: 2,
        alt: "Langkawi",
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289720/uploads/dujsljvtrzon8ulsktjj.jpg",
        fallbackSrc: langkawiLocal,
        title: "Langkawi",
        description:
            "Relax on pristine beaches and discover tropical island adventures in Malaysia’s paradise getaway.",
    },
    {
        id: 4,
        alt: "Penang",
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289674/uploads/orx7bvfhmyn0fkkf4fvw.jpg",
        fallbackSrc: penangLocal,
        title: "Penang",
        description:
            "Experience heritage streets, famous street food, and beautiful coastal charm in Penang.",
    },
    {
        id: 3,
        alt: "Genting Highlands",
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289736/uploads/caiv3y1zu3xcxhale8ko.jpg",
        fallbackSrc: gentingHighlandsLocal,
        title: "Genting Highlands",
        description:
            "Enjoy cool mountain air, exciting casinos, theme parks, and breathtaking hilltop views.",
    },

    {
        id: 1,
        alt: "Kuala Lumpur",
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289703/uploads/koeqcpz78twzsg1qplfm.jpg",
        fallbackSrc: kualaLumpurLocal,
        title: "Kuala Lumpur",
        description:
            "Explore Malaysia’s vibrant capital filled with iconic landmarks, shopping, and cultural experiences.",
    },
];
