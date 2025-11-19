import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import Footer from '@/components/layout/footer/Footer'
import Navbar from '@/components/layout/navbar/Navbar'
import { useMemo, useState, createContext } from 'react'
import Sidebar from './SideNavbar/SideNavbar'
import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import { useSelector } from 'react-redux'
import BookingAdminPage from './BookingList/BookingList'
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList } from "@/api/user/api";

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
        queryFn: GetAllPackageList,
    });


    const renderPage = () => {
        switch (active) {
            case "CreatePackage": return <AdminUploadPackageForm />;
            case "AllPackages": return <FilterPackage />;
            case "FormList": return <BookingAdminPage />;
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
            <Navbar />
            <div className='flex'>
                <Sidebar active={active} onChange={(data) => {
                    setActive(data);
                    setEditPackageId(null);
                }} />
                <main className="flex-1 p-6 bg-neutral-100 min-h-screen">
                    {renderPage()}
                </main>
            </div>
            <Footer />
        </AdminPanelContext.Provider>
    )
}

export default AdminPanel;
