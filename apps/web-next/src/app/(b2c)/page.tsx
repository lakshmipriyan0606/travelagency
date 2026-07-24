import { Metadata } from "next";
import { BestDestination } from "@/components/layout/bestDestination/BestDestination";
import BestPackage from "@/components/layout/bestPackage/BestPackage";
import BestActivitiesSection from "@/components/layout/BestActivities/BestActivitiesSection";
import HeroSection from "@/components/layout/herosection/HeroSection";
import TravelPartnerSection from "@/components/layout/partners/TravelPartnerSection";
import Welcome from "@/components/layout/welcome/Welcome";
import ReachUs from "@/components/layout/reachus/Reachus";
import TrustBadges from "@/components/layout/TrustBadges/TrustBadges";
import TravelExperiences from "@/components/layout/travelExperiences/TravelExperiences";
import HappyStories from "@/components/layout/happyStories/HappyStories";

export const metadata: Metadata = {
  title: "Travel Agency | Best Tour Packages & Adventure Activities",
  description: "Book your dream vacation with our premium travel agency. Explore exclusive tour packages, adventure activities, and unforgettable experiences across Malaysia and beyond.",
  keywords: "travel agency, tour packages, adventure, vacation, tourism",
};

export default async function HomePage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  
  let initialBestPackages = [];
  let initialBestActivities = [];
  let initialReviews = [];

  try {
    const res = await fetch(`${API_BASE}/packages/bestpackages`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      initialBestPackages = data?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch best packages", error);
  }

  try {
    const res = await fetch(`${API_BASE}/packages/bestactivities`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      initialBestActivities = data?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch best activities", error);
  }

  try {
    const res = await fetch(`${API_BASE}/reviews?status=Published`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      initialReviews = data?.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch reviews", error);
  }

  return (
    <div className="min-h-screen bg-background-black">
      <div className="pt-16 sm:pt-20 md:pt-17 lg:pt-30 px-4">
        <HeroSection />
      </div>
      <TrustBadges />
      <BestDestination />
      <Welcome />
      <BestPackage initialPackages={initialBestPackages} />
      <BestActivitiesSection initialActivities={initialBestActivities} />
      <TravelExperiences initialReviews={initialReviews} />
      <TravelPartnerSection />
      <ReachUs />
      <HappyStories />
    </div>
  );
}
