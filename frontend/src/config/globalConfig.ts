/**
 * globalConfig.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The single source of truth for all global configurations and constants.
 * Update this file to change values across the entire website (frontend & admin).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const GLOBAL_CONFIG = {
  site: {
    name: "S' SASTIKA TRAVELS",
    officialName: "Sastika Travels",
    email: "info@sastikaatravels.com",
    copyright: "© sastikaatravels.com 2025. All rights reserved.",
  },
  contact: {
    whatsappNumber: "60164012988",
    whatsappDisplay: "+60 16-401 2988",
    email: "info@sastikaatravels.com",
  },
  currency: {
    symbol: "RM",
    code: "MYR",
  },
  // Standardized Destinations (Fixed to these 4)
  destinations: [
    { id: "kl", label: "Kuala Lumpur", value: "Kuala Lumpur" },
    { id: "langkawi", label: "Langkawi Island", value: "Langkawi Island" },
    { id: "penang", label: "Penang", value: "Penang" },
    { id: "genting", label: "Genting Highland", value: "Genting Highland" },
  ],
  // Standardized Durations (Matched to user screenshot)
  durations: [
    { label: "3 Days, 2 Nights", value: "3D2N" },
    { label: "5 Days, 4 Nights", value: "5D4N" },
    { label: "7 Days, 6 Nights", value: "7D6N" },
    { label: "10 Days, 9 Nights", value: "10D9N" },
  ],
  // Vacation Types
  vacationTypes: [
    { label: "Family Vacation", value: "family" },
    { label: "Honeymoon", value: "honeymoon" },
    { label: "Adventure", value: "adventure" },
    { label: "Luxury", value: "luxury" },
    { label: "Business", value: "business" },
    { label: "Pilgrimage", value: "pilgrimage" },
  ],
  // Languages
  languages: [
    { label: "English", value: "english" },
    { label: "Tamil", value: "tamil" },
    { label: "Hindi", value: "hindi" },
    { label: "Telugu", value: "telugu" },
    { label: "Kannada", value: "kannada" },
    { label: "Malayalam", value: "malayalam" },
  ],
  // Months
  months: [
    { label: "January", value: "january" },
    { label: "February", value: "february" },
    { label: "March", value: "march" },
    { label: "April", value: "april" },
    { label: "May", value: "may" },
    { label: "June", value: "june" },
    { label: "July", value: "july" },
    { label: "August", value: "august" },
    { label: "September", value: "september" },
    { label: "October", value: "october" },
    { label: "November", value: "november" },
    { label: "December", value: "december" },
  ],
  // Person Counts
  personCounts: Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? "Person" : "Persons"}`,
  })),
  // Activity Categories (Unified source of truth)
  activityCategories: [
    { value: "Sightseeing", label: "🏛️ Sightseeing", emoji: "🏛️", description: "Explore iconic landmarks and city wonders", gradient: "from-rose-700 to-pink-500" },
    { value: "Water Sports", label: "🏄 Water Sports", emoji: "🏄", description: "Thrilling adventures on the waves", gradient: "from-cyan-700 to-blue-500" },
    // { value: "Hiking", label: "🥾 Hiking", emoji: "🥾", description: "Trek through scenic mountain trails", gradient: "from-green-800 to-emerald-600" },
    { value: "Shopping", label: "🛍️ Shopping", emoji: "🛍️", description: "Discover local crafts and premium brands", gradient: "from-purple-700 to-indigo-500" },
    // { value: "Relaxing", label: "🏖️ Relaxing", emoji: "🏖️", description: "Unwind at pristine beaches & resorts", gradient: "from-sky-700 to-cyan-500" },
    // { value: "Boating", label: "⛵ Boating", emoji: "⛵", description: "Sail across stunning waters", gradient: "from-blue-800 to-blue-500" },
    // { value: "Snorkeling", label: "🤿 Snorkeling", emoji: "🤿", description: "Explore vibrant underwater worlds", gradient: "from-teal-700 to-teal-400" },
    // { value: "Safari", label: "🦁 Safari", emoji: "🦁", description: "Witness wildlife in their natural habitat", gradient: "from-orange-700 to-amber-600" },
    { value: "Adventure", label: "🧗 Adventure", emoji: "🧗", description: "Push limits with thrilling activities", gradient: "from-red-700 to-orange-500" },
    { value: "Diving", label: "🐠 Diving", emoji: "🐠", description: "Dive deep into crystal-clear waters", gradient: "from-blue-700 to-indigo-600" },
    // { value: "Cycling", label: "🚴 Cycling", emoji: "🚴", description: "Pedal through scenic countryside", gradient: "from-yellow-700 to-amber-500" },
    // { value: "Skiing", label: "⛷️ Skiing", emoji: "⛷️", description: "Glide down snow-capped slopes", gradient: "from-indigo-700 to-blue-400" },
    // { value: "Cultural", label: "🏛️ Cultural", emoji: "🏛️", description: "Immerse in heritage & local traditions", gradient: "from-rose-700 to-pink-500" },
  ],
};
