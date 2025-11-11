import { Link } from "react-router-dom"
import { navbarList } from "./constant"
import PrimaryOutlineButton from "@/components/Button/PrimaryOutlineButton"

const NavbarRenderList = () => {
    const navbarListItems = navbarList.map((item) => (
        <li key={item.key} className="navbar-list-item">
            <Link to={item.path} className="hover:text-orange-400 transition-colors text-lg">
                {item.name}
            </Link>
        </li>
    ))
    
    return (
        <ul className="navbar-list">
            {navbarListItems}
            <li>
                <PrimaryOutlineButton buttonName="For Agencies/ B2B" />
            </li>
        </ul>
    )
}

export default NavbarRenderList