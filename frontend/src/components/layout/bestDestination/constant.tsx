type Package = {
    id: number;
    alt: string;
    src: string;
    title: string;
};

 export const bestPackageList: Package[] = [
    {
        id: 1,
        alt: "Great Wall of China",
        src: "https://images.unsplash.com/photo-1505832018823-50331d70d237?w=600&h=400&fit=crop&crop=center",
        title: 'Great Wall of China',
    },
    {
        id: 2,
        alt: "Marina Bay Sands Singapore",
        src: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
        title: 'Marina Bay Sands Singapore',
    },  
    {
        id: 3,
        alt: "Marina Bay Sands at Sunset",
        src: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=600&h=400&fit=crop",
        title: 'Marina Bay Sands at Sunset',
    },
    {
        id: 4,
        alt: "Phi Phi Island Boat",
        src: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.1.0",
        title: 'Phi Phi Island Boat',
    },
];
