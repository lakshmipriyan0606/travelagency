import { BestDestination } from "@/components/layout/bestDestination/BestDestination";
import BestPackage from "@/components/layout/bestPackage/BestPackage";
import ReachUs from "@/components/layout/reachus/Reachus";
import HeroSection from "@/components/layout/herosection/HeroSection";
import TravelPartnerSection from "@/components/layout/partners/TravelPartnerSection";
import Welcome from "@/components/layout/welcome/Welcome";
import TrustBadges from "@/components/layout/TrustBadges/TrustBadges";
import TravelExperiences from "@/components/layout/travelExperiences/TravelExperiences";
import HappyStories from "@/components/layout/happyStories/HappyStories";
import ActivitySection from "@/components/layout/Activities/ActivitySection";
import { createContext, useMemo } from "react"
import { Helmet } from "react-helmet-async";


export interface HomeContextType {
}

export const HomeContext = createContext<HomeContextType>({} as HomeContextType)

const Home = () => {

  const contextValue = useMemo(() => ({

  }), [])


  return (
    <HomeContext.Provider value={contextValue}>
      <Helmet>
        <title>Travel Agency | Best Tour Packages & Adventure Activities</title>
        <meta name="description" content="Book your dream vacation with our premium travel agency. Explore exclusive tour packages, adventure activities, and unforgettable experiences across Malaysia and beyond." />
        <meta name="keywords" content="travel agency, tour packages, adventure, vacation, tourism" />
      </Helmet>
      <div className="min-h-screen bg-background-black">

        <div className="pt-16 sm:pt-20 md:pt-17 lg:pt-22 px-4">
          <HeroSection />
        </div>
        <TrustBadges />
        <BestDestination />
        <Welcome />
        <BestPackage />
        <ActivitySection />
        <TravelExperiences />
        <TravelPartnerSection />
        <ReachUs />
        <HappyStories />
        {/* <Newsletter /> */}
      </div>
    </HomeContext.Provider>
  )
}

export default Home
