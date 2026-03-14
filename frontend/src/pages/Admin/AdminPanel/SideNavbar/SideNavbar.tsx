import { motion } from "framer-motion";
import { adminMenu } from "../constant";
import { LogOut, LayoutDashboard, Package, ClipboardList, Image as ImageIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    active: string;
    onChange: (component: string) => void;
}

const iconMap: Record<string, any> = {
    "AllPackages": <LayoutDashboard size={20} />,
    "CreatePackage": <Package size={20} />,
    "FormList": <ClipboardList size={20} />,
    "UploadImage": <ImageIcon size={20} />,
    "MediaGallery": <ImageIcon size={20} />
};

export default function Sidebar({ active, onChange }: SidebarProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/admin/login");
    };

    return (
        <aside className="w-full lg:w-64 bg-neutral-100 text-neutral-800 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col sticky top-0 z-50">
            <div className="p-4 lg:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-4">
                <div className="flex items-center gap-3 lg:mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#F69520] flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-xl">✈️</span>
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="font-bold text-lg tracking-tight text-neutral-800">Travel Agency</h2>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Admin Engine</p>
                    </div>
                </div>

                <nav className="flex flex-row lg:flex-col items-center lg:items-stretch gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    {adminMenu.map((item) => {
                        const isActive = active === item.component;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onChange(item.component)}
                                className={`
                                    flex items-center gap-2 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3.5 rounded-xl lg:rounded-2xl text-left transition-all duration-300 group relative whitespace-nowrap
                                    ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute bottom-0 lg:bottom-auto lg:left-0 w-full lg:w-1 h-0.5 lg:h-6 bg-gradient-to-r lg:bg-gradient-to-b from-primary to-[#F69520] rounded-t-full lg:rounded-r-full"
                                    />
                                )}
                                <span className={`${isActive ? "text-primary" : "group-hover:text-neutral-700"} transition-colors`}>
                                    {iconMap[item.component] || <span className="text-lg">{item.icon}</span>}
                                </span>
                                <span className="font-semibold text-xs sm:text-[15px]">{item.label}</span>

                                {isActive && (
                                    <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(252,175,22,0.5)]"></span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="lg:hidden">
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="hidden lg:flex mt-auto p-6 pt-0 flex-col">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-semibold text-[15px]">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
