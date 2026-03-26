import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import { useState, createContext, useEffect } from 'react'
import Sidebar from './SideNavbar/SideNavbar'
import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/store/authSlice'
import { logoutAPI } from '@/api/admin/auth.api'
import { LogOut, Clock } from 'lucide-react'
import BookingAdminPage from './BookingList/BookingList'
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList } from "@/api/user/api";
import UploadImagePage from "./UploadImage/UploadImage";
import MediaGallery from "./MediaGallery/MediaGallery";
import { useQueryClient } from '@tanstack/react-query'
import BlogAdminList from '@/components/layout/Admin/Blog/BlogAdminList'
import BlogForm from '@/components/layout/Admin/Blog/BlogForm'
import MetricsDashboard from './Dashboard/MetricsDashboard'

interface FilterPackageProps {
    isAdmin: boolean;
    editPackageId: string | null;
    setEditPackageId: (id: string | null) => void;
    setActive: (active: string) => void;
    packageAPIDetail?: {
        data: any;
        isLoading: boolean;
        isError: boolean;
        refetch: () => void;
    };
    triggerRefresh?: () => void;
    refreshCount?: number;
}

export const AdminPanelContext = createContext<FilterPackageProps | null>(null);

// Isolated Timer Component to prevent full AdminPanel re-renders every second
const SessionTimer = ({ expiry }: { expiry: number }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!expiry) return;

        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = expiry - now;

            if (remaining <= 0) {
                setTimeLeft("Expired");
            } else {
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiry]);

    if (!timeLeft) return <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-1">System Online</span>;

    return (
        <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${timeLeft === 'Expired' ? 'text-red-500' : 'text-amber-600'}`}>
            <Clock size={10} /> {timeLeft === 'Expired' ? 'Session Expired' : `Expires in: ${timeLeft}`}
        </span>
    );
};

const AdminPanel = () => {
    const { user } = useSelector((state: any) => state?.auth);
    const isAdmin = user?.role === "admin" || user?.role === "superadmin" || false;
    const isSuperAdmin = user?.role === "superadmin";
    const [active, setActive] = useState("AllPackages");
    const [editPackageId, setEditPackageId] = useState<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error("Logout API failed", error);
        }
        dispatch(logout());
        navigate("/admin/login");
    };

    const triggerRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["allPackage"] });
        setRefreshCount(prev => prev + 1);
    }

    const packageAPIDetail = UseFetchAPIQuery({
        key: ["allPackage"],
        queryFn: () => GetAllPackageList({
            limit: 10,
            lastId: ''
        }),
    });

    const renderPage = () => {
        switch (active) {
            case "MetricsDashboard":
                return isSuperAdmin ? (
                    <MetricsDashboard />
                ) : (
                    <div className="p-10">
                        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-black text-neutral-800">Access denied</h2>
                            <p className="text-neutral-500 font-medium mt-1">
                                System Dashboard is available for Super Admin only.
                            </p>
                        </div>
                    </div>
                );
            case "CreatePackage":
            case "CreateActivity": return <AdminUploadPackageForm isActivity={active === "CreateActivity"} />;
            case "AllPackages": return <FilterPackage mode="packages" />;
            case "AllActivities": return <FilterPackage mode="activities" />;
            case "AllBlogs": return <BlogAdminList />;
            case "CreateBlog": return <BlogForm />;
            case "FormList": return <BookingAdminPage />;
            case "UploadImage": return <UploadImagePage />;
            case "MediaGallery": return <MediaGallery />;
            default: return <div>Page Not Found</div>;
        }
    };

    const contextValues = {
        isAdmin,
        editPackageId,
        setEditPackageId,
        setActive,
        packageAPIDetail,
        triggerRefresh,
        refreshCount,
    };

    return (
        <AdminPanelContext.Provider value={contextValues}>
            <div className='flex flex-col lg:flex-row bg-neutral-50 min-h-screen font-sans selection:bg-primary/30'>
                <Sidebar active={active} onChange={(data) => {
                    setActive(data);
                    setEditPackageId(null);
                }} />

                <main className="flex-1 flex flex-col min-w-0">
                    <header className="h-20 border-b border-neutral-200 flex items-center justify-between px-6 sm:px-10 bg-white sticky top-0 z-100">
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-neutral-800 tracking-tight">
                                {active === "AllPackages" && "Package Inventory"}
                                {active === "AllActivities" && "Activity Inventory"}
                                {active === "AllBlogs" && "Blog Manager"}
                                {(active === "CreatePackage" || active === "CreateActivity") && (editPackageId ? "Edit Package" : (active === "CreateActivity" ? "Create New Activity" : "Create New Package"))}
                                {active === "CreateBlog" && (editPackageId ? "Edit Blog" : "Create New Blog")}
                                {active === "FormList" && "Booking Requests"}
                                {active === "UploadImage" && "Media Manager"}
                                {active === "MediaGallery" && "Media Gallery"}
                            </h1>
                            <p className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-bold">
                                Home / {active === "CreateActivity" ? "Create Activity" : (active === "CreatePackage" ? "Create Package" : active)}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                                <span className="text-sm font-bold text-neutral-800 leading-none">{user?.name || "Administrator"}</span>
                                <SessionTimer expiry={user?.user?.exp} />
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold shadow-sm">
                                {user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            {/* New Sign Out Button */}
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                title="Sign Out"
                                className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors border border-red-100 shadow-sm group relative cursor-pointer"
                            >
                                <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </header>

                    <div className="">
                        <div className="max-w-7xl mx-auto">
                            {renderPage()}
                        </div>
                    </div>
                </main>

                {/* Logout Confirmation Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500 shadow-inner">
                                <LogOut size={24} />
                            </div>
                            <h3 className="text-xl font-black text-center text-neutral-800 mb-2 tracking-tight">Log Out?</h3>
                            <p className="text-center text-neutral-500 text-sm mb-8 font-medium">Are you sure you want to end your current session?</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3.5 px-4 bg-neutral-100 hover:bg-neutral-200 cursor-pointer text-neutral-600 rounded-xl font-bold text-sm transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 cursor-pointer text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminPanelContext.Provider>
    )
}

export default AdminPanel;
