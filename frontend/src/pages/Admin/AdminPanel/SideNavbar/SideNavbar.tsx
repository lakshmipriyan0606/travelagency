import { motion, AnimatePresence } from "framer-motion";
import { adminMenu } from "../constant";
import { LogOut, Package, ClipboardList, Image as ImageIcon, ChevronDown, Sparkles, Activity, PlusCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { logoutAPI } from "@/api/admin/auth.api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
    active: string;
    onChange: (component: string) => void;
}

const iconMap: Record<string, any> = {
    "AllPackages": <Package size={20} />,
    "CreatePackage": <PlusCircle size={18} />,
    "CreateActivity": <Sparkles size={18} />,
    "FormList": <ClipboardList size={20} />,
    "UploadImage": <ImageIcon size={20} />,
    "MediaGallery": <ImageIcon size={20} />,
    "AllActivities": <Activity size={20} />,
    "CreateNew": <PlusCircle size={20} />,
};

export default function Sidebar({ active, onChange }: SidebarProps) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Track which parent menus are expanded
    const [expandedMenus, setExpandedMenus] = useState<Record<number, boolean>>(() => {
        // Auto-expand if a child is active
        const initial: Record<number, boolean> = {};
        adminMenu.forEach(item => {
            if (item.children?.some(child => child.component === active)) {
                initial[item.id] = true;
            }
        });
        return initial;
    });

    const toggleMenu = (id: number) => {
        setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleLogout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error("Logout API failed", error);
        }
        dispatch(logout());
        navigate("/admin/login");
    };

    return (
        <aside className="w-full lg:w-64 bg-neutral-100 text-neutral-800 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col sticky top-0 z-50">
            <div className="p-4 lg:p-8 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-4 h-full">
                <div className="flex items-center gap-3 lg:mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#F69520] flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-xl">✈️</span>
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="font-bold text-lg tracking-tight text-neutral-800">Travel Agency</h2>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Admin Engine</p>
                    </div>
                </div>

                <nav className="flex flex-row lg:flex-col items-center lg:items-stretch gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 w-full">
                    {adminMenu.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus[item.id];
                        const isAnyChildActive = item.children?.some(child => child.component === active);
                        const isActive = active === item.component || (!hasChildren && active === item.component);

                        return (
                            <div key={item.id} className="flex flex-col w-full">
                                <button
                                    onClick={() => {
                                        if (hasChildren) {
                                            toggleMenu(item.id);
                                        } else {
                                            onChange(item.component);
                                        }
                                    }}
                                    className={`
                                        flex items-center gap-2 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3.5 rounded-xl lg:rounded-2xl text-left transition-all duration-300 group relative whitespace-nowrap w-full
                                        ${(isActive || (hasChildren && isAnyChildActive && !isExpanded))
                                            ? "bg-primary/10 text-primary"
                                            : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"}
                                    `}
                                >
                                    {(isActive || (hasChildren && isAnyChildActive && !isExpanded)) && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute bottom-0 lg:bottom-auto lg:left-0 w-full lg:w-1 h-0.5 lg:h-6 bg-gradient-to-r lg:bg-gradient-to-b from-primary to-[#F69520] rounded-t-full lg:rounded-r-full"
                                        />
                                    )}
                                    <span className={`${isActive ? "text-primary" : "group-hover:text-neutral-700"} transition-colors`}>
                                        {iconMap[item.component] || <span className="text-lg">{item.icon}</span>}
                                    </span>
                                    <span className="font-bold text-xs sm:text-[14px] uppercase tracking-wider">{item.label}</span>

                                    {hasChildren && (
                                        <ChevronDown 
                                            size={16} 
                                            className={`ml-auto transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
                                        />
                                    )}
                                </button>

                                {/* Render Children */}
                                <AnimatePresence>
                                    {hasChildren && isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden flex flex-col pl-4 lg:pl-9 mt-1 gap-1"
                                        >
                                            {item.children?.map(child => {
                                                const isChildActive = active === child.component;
                                                return (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => onChange(child.component)}
                                                        className={`flex items-center gap-3 py-2 px-3 rounded-xl text-sm transition-all duration-200
                                                            ${isChildActive 
                                                                ? "text-primary font-bold bg-primary/5 shadow-sm" 
                                                                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100/50"}`}
                                                    >
                                                        <span className="opacity-70">{iconMap[child.component] || child.icon}</span>
                                                        <span>{child.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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

        </aside>
    );
}
