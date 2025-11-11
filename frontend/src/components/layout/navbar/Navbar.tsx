import { Link } from "react-router-dom";
import { navbarList } from "./constant";
import ProfileSection from "./ProfileSection";
import NavbarRenderList from "./NavBarList";
import { useContext } from "react";
import { HomeContext, HomeContextType } from "@/pages/Home/Home";
import { MenuIcon, X } from "lucide-react";
import CompanyLogo from "@/components/companyLogo/CompanyLogo";
import PrimaryOutlineButton from "@/components/Button/PrimaryOutlineButton";

const Navbar = () => {
  const { setNavbarOpen, navbarOpen } = useContext<HomeContextType>(HomeContext);

  return (
    <div className="navbar-main relative">
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

      {/* Mobile Menu */}
      <div
        className={`navbar-list mobile absolute top-full left-0 w-full bg-white shadow-lg overflow-hidden transition-all duration-300 ease-in-out
          ${navbarOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex flex-col items-center py-3 space-y-3">
          {navbarList.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className="text-gray-800 hover:text-blue-600 transition-colors duration-200 text-xl"
              onClick={() => setNavbarOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <PrimaryOutlineButton buttonName="For Agencies/ B2B" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
