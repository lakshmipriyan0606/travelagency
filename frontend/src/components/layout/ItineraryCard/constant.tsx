
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
                    'https://picsum.photos/1200/800?random=5',
            },
            {
                time: "Evening",
                detail: "Witness the Wings of Time show by the sea.",
                image:
                    'https://picsum.photos/1200/800?random=5',
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

// ----------------------------------------------------
// TYPES
// ----------------------------------------------------
export interface Slot {
  slotType: string;
  title?: string;        // <- backend has title, so make it optional here
  description: string;
  imageUrl?: string;
}

export interface DayData {
  dayTitle: string;
  slots: Slot[];
}

/** Existing timeline types kept as-is */
export interface TimeSlot {
  time: string;
  description?: string;
  icon?: string;
  onlyDuration?: boolean;
}

export interface DayFormatted {
  day: {
    duration: string;
    title: string;
    timeSlots: TimeSlot[];
  };
}

export interface IntervalItem {
  interval: true;
  backgroundImage: string;
}

export type FinalTimelineItem = DayFormatted | IntervalItem;

/** ----- New types for front-end itinerary format ----- */

export interface ScheduleItem {
  time: string;
  detail: string;
  image: string;
}

export interface ItineraryDay {
  id: number;
  title: string;
  description: string;
  schedule: ScheduleItem[];
}

// ----------------------------------------------------
// SLOT FORMATTER
// ----------------------------------------------------
export const handleSlotFormat = (
  slotList: Slot[] = [],
  dayIndex: number
): TimeSlot[] => {
  const formattedSlots = slotList.map((item) => ({
    time: item.slotType,
    description: item.description,
    icon: item.imageUrl || "",
  }));

  // Add onlyDuration object ONLY ONCE at top
  return [{ time: `Day -${dayIndex + 1}`, onlyDuration: true }, ...formattedSlots];
};

// ----------------------------------------------------
// DAYS FORMATTER (FULL LOGIC)
// ----------------------------------------------------
export const handleDayListFormat = (daysData: DayData[] = []): FinalTimelineItem[] => {
  const dayList: DayFormatted[] = daysData.map((day, index) => ({
    day: {
      duration: `Day -${index + 1}`,
      title: day.dayTitle,
      timeSlots: handleSlotFormat(day.slots, index),
    },
  }));

  const finalList: FinalTimelineItem[] = [];

  dayList.forEach((day, index) => {
    const isLast = index === dayList.length - 1;

    finalList.push(day);

    if (!isLast) {
      finalList.push({
        interval: true,
        backgroundImage: index % 2 === 0 ? dotLineRightPng : dotLineLeftPng,
      });
    }
  });

  return finalList;
};

// ----------------------------------------------------
// ITINERARY EXPAND FORMATTER (TYPED)
// ----------------------------------------------------
export const formatItineraryExpandData = (daysList: DayData[] = []): ItineraryDay[] => {
  return daysList.map((day, dayIndex) => {
    const firstSlotDescription = day?.slots?.[0]?.description || "No description available for this day.";

    const schedule: ScheduleItem[] = day.slots.map((slot) => ({
      time: slot.slotType
        ? slot.slotType.charAt(0).toUpperCase() + slot.slotType.slice(1)
        : "N/A",
      detail: slot.title || slot.description || "No details available.",
      image: slot.imageUrl || "",
    }));

    return {
      id: dayIndex + 1,
      title: day.dayTitle || `Day ${dayIndex + 1}`,
      description: firstSlotDescription,
      schedule,
    };
  });
};
