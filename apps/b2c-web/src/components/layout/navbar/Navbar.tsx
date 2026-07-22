import { Link } from "react-router-dom";
import { navbarList } from "./constant";
import ProfileSection from "./ProfileSection";
import NavbarRenderList from "./NavBarList";
import { useState } from "react";
import { MenuIcon, X } from "lucide-react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import CompanyLogo from "@/components/companyLogo/CompanyLogo";
import PrimaryOutlineButton from "@/components/Button/PrimaryOutlineButton";

const Navbar = () => {
  const [navbarOpen, setNavbarOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Determine if scrolled past threshold for floating effect
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-md bg-custom-black/80 border-b border-white/10 shadow-sm"
          : "bg-custom-black"
          }`}
      >
        <div className={`navbar-main flex items-center justify-between px-6 ${scrolled ? 'rounded-2xl' : ''} bg-transparent`}>
          <CompanyLogo />

          {/* Desktop Navigation - Hidden on tablet/mobile, visible on large screens */}
          <div className="hidden lg:flex items-center">
            <NavbarRenderList />
          </div>

          {/* Right Side Icons & Mobile Toggle */}
          <div className="flex items-center gap-4 sm:gap-6">
            <ProfileSection />

            {/* Hamburger Menu - Visible on tablet/mobile, hidden on large screens */}
            <div
              className="lg:hidden cursor-pointer p-1 -mr-1"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              {navbarOpen ? <X className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`navbar-list mobile absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${scrolled ? 'rounded-b-2xl' : ''}
            ${navbarOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col pb-4 space-y-3 w-full px-4">
            {navbarList.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="text-gray-800 hover:bg-primary p-2 transition-colors duration-200 text-xl block"
                onClick={() => setNavbarOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mx-start pl-2">
              <Link to="/b2b" onClick={() => setNavbarOpen(false)}>
                <PrimaryOutlineButton buttonName="For Agencies/ B2B" animated />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
