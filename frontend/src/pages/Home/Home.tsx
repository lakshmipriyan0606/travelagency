import { BestDestination } from "@/components/layout/bestDestination/BestDestination";
import BestPackage from "@/components/layout/bestPackage/BestPackage";
import ReachUs from "@/components/layout/reachus/Reachus";
import HeroSection from "@/components/layout/herosection/HeroSection";
import Newsletter from "@/components/layout/newsletter/Newsletter";
import Welcome from "@/components/layout/welcome/Welcome";
import TrustBadges from "@/components/layout/TrustBadges/TrustBadges";
import BestCities from "@/components/layout/bestCities/BestCities";
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
        <div className="py-20 px-4">
          <HeroSection />
        </div>
        <TrustBadges />
        <BestDestination />
        <Welcome />
        <BestPackage />
        <ReachUs />
        <TravelExperiences />
        <HappyStories />
        <Newsletter />
      </div>
    </HomeContext.Provider>
  )
}

export default Home
