export interface Testimonial {
  id: number;
  name: string;
  text: string;
  image: string;
  avatar: string;
  location: string;
}

export const TRAVEL_EXPERIENCES: Testimonial[] = [
  {
    id: 5,
    name: "Ananya Iyer",
    text: "Our trip to Phuket was rejuvenating. The island hopping tour was the highlight. Sastikaa Travels took care of our dietary preferences at every stop, which we really appreciated. Highly recommend for a hassle-free tropical getaway!.The train passes and hotel check-ins we arrive countries.",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    location: "Phuket",
  },
  {
    id: 6,
    name: "Rohan Gupta",
    text: "Europe tour was extensive but very well managed. The train passes and hotel check-ins were all set before we arrived. Truly a stress-free experience across multiple countries.",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    location: "Europe",
  },
  {
    id: 7,
    name: "Pooja Hegde",
    text: "Thailand's street food and culture were amazing. Sastikaa Travels gave us the best local tips that weren't in any guidebook. The personalized touch made our honeymoon special.",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    location: "Thailand",
  },
  {
    id: 8,
    name: "Suresh Menon",
    text: "Vietnam was a revelation. The Halong Bay cruise was spectacular. Sastikaa Travels' attention to detail in choosing the right cruise line really showed. Five stars!",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop",
    avatar: "https://randomuser.me/api/portraits/men/88.jpg",
    location: "Vietnam",
  },
  {
    id: 9,
    name: "Kavita Reddy",
    text: "Sri Lanka's tea gardens and beaches were lovely. The driver provided was very polite and acted as a great guide too. Everything was smooth and safe for us women travelers.",
    image: "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=800&auto=format&fit=crop",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    location: "Sri Lanka",
  },
];
