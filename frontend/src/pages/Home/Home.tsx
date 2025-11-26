import { BestDestination } from "@/components/layout/bestDestination/BestDestination";
import BestPackage from "@/components/layout/bestPackage/BestPackage";
import ReachUs from "@/components/layout/reachus/Reachus";
import Footer from "@/components/layout/footer/Footer";
import HeroSection from "@/components/layout/herosection/HeroSection";
import Navbar from "@/components/layout/navbar/Navbar";
import Newsletter from "@/components/layout/newsletter/Newsletter";
import Testimonials from "@/components/layout/testimonial/Testmonial";
import Welcome from "@/components/layout/welcome/Welcome";
import { createContext, useMemo, useState } from "react"

export interface HomeContextType {
}

export const HomeContext = createContext<HomeContextType>({} as HomeContextType)

const Home = () => {

  const contextValue = useMemo(() => ({

  }), [])


  return (
    <HomeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background-black">
        <Navbar />
        <HeroSection />
        <BestDestination />
        <Welcome />
        <BestPackage />
        <ReachUs />
        <Testimonials />
        <Newsletter />
        <Footer />
      </div>
    </HomeContext.Provider>
  )
}

export default Home
