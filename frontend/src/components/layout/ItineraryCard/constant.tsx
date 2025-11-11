
import dotLineLeftPng from "@/assets/image/dotlineLeftpng.png";
import dotLineRightPng from "@/assets/image/dotlineRightpng.png";

export const itinerariesExpandCardDetails = [
    {
        id: 1,
        title: "Arrival to Singapore",
        description:
            "Pride in offering reliable services, carefully curated itineraries and complete transparency in every booking. From flight tickets to hotel stays, guided tours to adventure activities.",
        schedule: [
            {
                time: "Morning",
                detail:
                    "Arrive at Changi, transfer to hotel, short rest and quick city orientation.",
                image:
                    'https://picsum.photos/1200/800?random=12',
            },
            // {
            //     time: "Noon",
            //     detail:
            //         "Lunch at local hawker centre and short walking tour around Marina Bay.",
            //      image:
            //         'https://picsum.photos/1200/800?random=24',
            // },
            // {
            //     time: "Evening",
            //     detail:
            //         "Visit Gardens by the Bay and enjoy an evening light show.",
            //       image:
            //         'https://picsum.photos/1200/800?random=29',
            // },
        ],
    },
    {
        id: 2,
        title: "Explore Sentosa Island",
        description:
            "Enjoy a fun-filled day at Sentosa Island with guided experiences, beach relaxation, and thrilling attractions.",
        schedule: [
            {
                time: "Morning",
                detail: "Visit Universal Studios and enjoy the themed rides.",
                 image:
                    'https://picsum.photos/1200/800?random=5',
            },
            {
                time: "Noon",
                detail: "Relax at Siloso Beach and enjoy local dining options.",
                  image:
                    'https://picsum.photos/1200/800?random=21',
            },
            {
                time: "Evening",
                detail: "Witness the Wings of Time show by the sea.",
                 image:
                    'https://picsum.photos/1200/800?random=10',
            },
        ],
    },
];


export const itinerariesCardDetails = [
    {
        day: {
            duration: "Day -1",
            title: "Arrival and City Tour",
            timeSlots: [
                { time: "Day -1", onlyDuration: true },
                { time: "Morning", icon: "🌅", description: "Pride in offering reliable services" },
                { time: "Noon", icon: "☀️", description: "Pride in offering reliable services" },
                { time: "Evening", icon: "🌆", description: "Pride in offering reliable services" },
            ],
        },
    },
    {
        interval: true,
        backgroundImage: dotLineRightPng,
    },
    {
        day: {
            duration: "Day -2",
            title: "Arrival and City Tour",
            timeSlots: [
                { time: "Day -2", onlyDuration: true },
                { time: "Morning", icon: "🌅", description: "Pride in offering reliable services" },
                { time: "Noon", icon: "☀️", description: "Pride in offering reliable services" },
                { time: "Evening", icon: "🌆", description: "Pride in offering reliable services" },
            ],
        },
    },
    {
        interval: true,
        backgroundImage: dotLineLeftPng,
    },
    {
        day: {
            duration: "Day -2",
            title: "Arrival and City Tour",
            timeSlots: [
                { time: "Day -2", onlyDuration: true },
                { time: "Morning", icon: "🌅", description: "Pride in offering reliable services" },
                { time: "Noon", icon: "☀️", description: "Pride in offering reliable services" },
                { time: "Evening", icon: "🌆", description: "Pride in offering reliable services" },
            ],
        },
    },
];
