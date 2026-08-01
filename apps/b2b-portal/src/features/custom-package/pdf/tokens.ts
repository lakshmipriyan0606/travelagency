/**
 * TravelHero itinerary PDF design tokens.
 * Visual source of truth: Sastikaa reference PDF (gold/cream redesign).
 */

export const PDF_COLORS = {
  cream: "#FDF8F0",
  gold: "#F8B400",
  goldLight: "#FFD54A",
  goldDark: "#C48E00",
  nearBlack: "#1A1A1A",
  /** Solid bottom edge bar under the gold contact row */
  charcoalBar: "#1C1C1C",
  body: "#2A2A2A",
  muted: "#6B6B6B",
  white: "#FFFFFF",
  teal: "#5B9AA8",
  border: "#E8DFD0",
  tableRule: "#C45C3E",
} as const;

export const PDF_CONTACTS = {
  website: "www.travelhero.com",
  phones: "support@travelhero.com | b2b-ops@travelhero.com",
  location: "Global Travel Partners",
} as const;

/**
 * Source PDF is 11 landscape slides (1440×810 / 16:9).
 * Fixed pages = full finished artwork (render Image only).
 * Dynamic pages = cream canvas + proposal data (do NOT use sample day/inclusion images).
 */
export const PDF_ASSETS = {
  /** Page 1 — cover */
  cover: "/itinerary-pdf/1.png",
  /** Page 2 — introduction */
  intro: "/itinerary-pdf/2.png",
  /** Page 3 — best time to visit */
  bestTime: "/itinerary-pdf/3.png",
  /** Page 4 — travel preparation */
  prep: "/itinerary-pdf/4.png",
  /** Page 8 — why choose / cancellation (static closing) */
  whyChoose: "/itinerary-pdf/8.png",
  /** Page 9 — important notes */
  notes: "/itinerary-pdf/9.png",
  /** Page 11 — discover Malaysia closing */
  closing: "/itinerary-pdf/11.png",
  /** Local Nunito body fonts (must be real Regular/SemiBold/Bold — not ExtraLight) */
  fontRegular: "/fonts/Nunito-Regular.ttf",
  fontSemiBold: "/fonts/Nunito-SemiBold.ttf",
  fontBold: "/fonts/Nunito-Bold.ttf",
  /** Display titles — Alatsi matches Sastikaa reference PDF */
  fontDisplay: "/fonts/Alatsi-Regular.ttf",
} as const;

/** Match source slide aspect (16:9), not A4 — avoids cropping full-bleed art */
export const PDF_PAGE_SIZE: [number, number] = [960, 540];

export const FIXED_EXCLUSIONS = [
  "International / domestic flights",
  "Visa fees & travel insurance",
  "Personal expenses & tips",
  "Early check-in / late check-out",
  "Taxes & surcharges not mentioned",
  "Entry tickets not listed in inclusions",
] as const;

export const PREP_CHECKLIST = [
  "Valid Passport (minimum 6 months validity)",
  "Book flights",
  "Exchange local currency or activate an international card",
  "Prepare travel insurance",
  "Install helpful apps",
] as const;

export const TRAVEL_TIP =
  "Carry a universal travel adapter and stay connected with a local eSIM or SIM card for a hassle-free journey.";
