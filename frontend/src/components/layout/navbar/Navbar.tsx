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
          ? "backdrop-blur-md bg-custom-black/80 border-b border-white/10 shadow-sm py-2"
          : "bg-custom-black py-0"
          }`}
      >
        <div className={`navbar-main flex items-center justify-between px-6 ${scrolled ? 'rounded-2xl' : ''} bg-transparent`}>
          <CompanyLogo />

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <NavbarRenderList />
          </div>

          {/* Mobile Navigation */}
          <div className="navbar-rightside">
            <ProfileSection />
            <div
              className="mobile-nav mobile-menu-toggle cursor-pointer"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              {navbarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
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
              <PrimaryOutlineButton buttonName="For Agencies/ B2B" animated />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
