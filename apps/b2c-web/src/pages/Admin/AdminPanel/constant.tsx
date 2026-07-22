export const adminMenu = [
    {
        id: 100,
        label: "System Dashboard",
        icon: "📊",
        component: "MetricsDashboard",
    },
    {
        id: 101,
        label: "Website",
        icon: "🌐",
        component: "Website",
        children: [
            {
                id: 1011,
                label: "Hero Sections",
                icon: "🖼️",
                component: "WebsiteHeroManager",
            }
        ]
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
            },
            {
                id: 24,
                label: "Create Review",
                icon: "🌟",
                component: "CreateReview",
            },
            {
                id: 25,
                label: "Create Story",
                icon: "📸",
                component: "CreateStory",
            },
            {
                id: 26,
                label: "Create Destination",
                icon: "📍",
                component: "CreateDestination",
            }
        ]
    },
    {
        id: 11,
        label: "All Destinations",
        icon: "🗺️",
        component: "AllDestinations",
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
        id: 8,
        label: "All Reviews",
        icon: "⭐",
        component: "AllReviews",
    },
    {
        id: 9,
        label: "All Stories",
        icon: "🖼️",
        component: "AllStories",
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
    }
];
