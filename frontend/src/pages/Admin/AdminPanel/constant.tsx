export const adminMenu = [
    {
        id: 100,
        label: "System Dashboard",
        icon: "📊",
        component: "MetricsDashboard",
    },
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
        id: 7,
        label: "All Blogs",
        icon: "📝",
        component: "AllBlogs",
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
            },
            {
                id: 23,
                label: "Create Blog",
                icon: "✍️",
                component: "CreateBlog",
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
