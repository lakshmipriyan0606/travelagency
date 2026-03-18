export const adminMenu = [
    {
        id: 1,
        label: "All Packages",
        icon: "📦",
        component: "AllPackages",
    },
    {
        id: 6,
        label: "All Activities",
        icon: "🎾",
        component: "AllActivities",
    },
    {
        id: 2,
        label: "Create New",
        icon: "➕",
        component: "CreateNew",
        children: [
            {
                id: 21,
                label: "Create Package",
                icon: "📦",
                component: "CreatePackage",
            },
            {
                id: 22,
                label: "Create Activity",
                icon: "✨",
                component: "CreateActivity",
            }
        ]
    },
    {
        id: 3,
        label: "Form List",
        icon: "📝",
        component: "FormList",
    },
    {
        id: 4,
        label: "Media Gallery",
        icon: "🖼️",
        component: "MediaGallery",
    },
];
