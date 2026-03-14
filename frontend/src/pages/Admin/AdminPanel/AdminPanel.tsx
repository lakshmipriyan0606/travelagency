import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import { useState, createContext } from 'react'
import Sidebar from './SideNavbar/SideNavbar'
import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import { useSelector } from 'react-redux'
import BookingAdminPage from './BookingList/BookingList'
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList } from "@/api/user/api";
import UploadImagePage from "./UploadImage/UploadImage";
import MediaGallery from "./MediaGallery/MediaGallery";

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
}

export const AdminPanelContext = createContext<FilterPackageProps | null>(null);

const AdminPanel = () => {
    const { user } = useSelector((state: any) => state?.auth);
    const isAdmin = user?.role === "admin" || false;

    const [active, setActive] = useState("AllPackages");
    const [editPackageId, setEditPackageId] = useState<string | null>(null);

    const packageAPIDetail = UseFetchAPIQuery({
        key: ["allPackage"],
        queryFn: () => GetAllPackageList({
            limit: 10,
            lastId: ''
        }),
    });


    const renderPage = () => {
        switch (active) {
            case "CreatePackage": return <AdminUploadPackageForm />;
            case "AllPackages": return <FilterPackage />;
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
                                {active === "CreatePackage" && (editPackageId ? "Edit Package" : "Create New Package")}
                                {active === "FormList" && "Booking Requests"}
                                {active === "UploadImage" && "Media Manager"}
                            </h1>
                            <p className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-bold">
                                Home / {active}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                                <span className="text-sm font-bold text-neutral-800 leading-none">{user?.name || "Administrator"}</span>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none mt-1">System Online</span>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 font-bold shadow-sm">
                                {user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                        </div>
                    </header>

                    <div className="">
                        <div className="max-w-7xl mx-auto">
                            {renderPage()}
                        </div>
                    </div>
                </main>
            </div>
        </AdminPanelContext.Provider>
    )
}

export default AdminPanel;
