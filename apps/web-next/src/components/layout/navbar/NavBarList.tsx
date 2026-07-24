"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navbarList } from "./constant";
import PrimaryOutlineButton from "@/components/Button/PrimaryOutlineButton";

const NavbarRenderList = () => {
  const pathname = usePathname();
  
  const navbarListItems = navbarList.map((item) => {
    const isActive = pathname === item.path;
    return (
    <li key={item.key} className="navbar-list-item">
      <Link
        href={item.path}
        className={`sm:text-[17px] transition-colors ${
            isActive 
              ? "text-primary"
              : "text-white/80 hover:text-primary"
          }`}
      >
        {item.name}
      </Link>
    </li>
    );
  });

  return (
    <ul className="navbar-list">
      {navbarListItems}
      <li>
        <Link href="/b2b">
            <PrimaryOutlineButton buttonName="For Agencies/ B2B"  className="h-7" animated />
        </Link>
      </li>
    </ul>
  );
};

export default NavbarRenderList;

