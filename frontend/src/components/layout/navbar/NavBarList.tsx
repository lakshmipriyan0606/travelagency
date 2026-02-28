import { NavLink } from "react-router-dom";
import { navbarList } from "./constant";
import PrimaryOutlineButton from "@/components/Button/PrimaryOutlineButton";

const NavbarRenderList = () => {
  const navbarListItems = navbarList.map((item) => (
    <li key={item.key} className="navbar-list-item">
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `sm:text-[17px] transition-colors ${
            isActive 
              ? "text-primary"
              : "text-white/80 hover:text-primary"
          }`
        }
      >
        {item.name}
      </NavLink>
    </li>
  ));

  return (
    <ul className="navbar-list">
      {navbarListItems}
      <li>
        <PrimaryOutlineButton buttonName="For Agencies/ B2B"  className="h-7" animated />
      </li>
    </ul>
  );
};

export default NavbarRenderList;