import { BestDestination } from "@/components/layout/bestDestination/BestDestination";
import BestPackage from "@/components/layout/bestPackage/BestPackage";
import ReachUs from "@/components/layout/reachus/Reachus";
import HeroSection from "@/components/layout/herosection/HeroSection";
import TravelPartnerSection from "@/components/layout/partners/TravelPartnerSection";
import Welcome from "@/components/layout/welcome/Welcome";
import TrustBadges from "@/components/layout/TrustBadges/TrustBadges";
import TravelExperiences from "@/components/layout/travelExperiences/TravelExperiences";
import HappyStories from "@/components/layout/happyStories/HappyStories";
import { createContext, useMemo } from "react"

export interface HomeContextType {
}

export const HomeContext = createContext<HomeContextType>({} as HomeContextType)

const Home = () => {

  const contextValue = useMemo(() => ({

  }), [])


  return (
    <HomeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background-black">
        <div className="py-16 sm:py-20 md:py-17 lg:py-22 px-4">
          <HeroSection />
        </div>
        <TrustBadges />
        <BestDestination />
        <Welcome />
        <BestPackage />
        <TravelPartnerSection />
        <ReachUs />
        <TravelExperiences />
        <HappyStories />
        {/* <Newsletter /> */}
      </div>
    </HomeContext.Provider>
  )
}

export default Home
