import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import Footer from '@/components/layout/footer/Footer'
import Navbar from '@/components/layout/navbar/Navbar'
import React, { useState } from 'react'
import Sidebar from './SideNavbar/SideNavbar'
import AllPackage from '@/pages/AllPackage/AllPackage'
import FilterPackage from '@/components/layout/filterPackage/FilterPackage'
import { useSelector } from 'react-redux'

const AdminPanel = () => {

    const { user } = useSelector((state: any) => state?.auth);
    const isAdmin = user?.role === "admin" || false;
    const [active, setActive] = useState("AllPackages");
    const [editPackageId, setEditPackageId] = useState<string | null>(null);
    console.log('editPackageId: ', editPackageId);

    const renderPage = () => {
        switch (active) {
            case "CreatePackage": return <AdminUploadPackageForm id={editPackageId}  />;
            case "AllPackages": return <FilterPackage  isAdmin={isAdmin} setEditPackageId={setEditPackageId} setActive={setActive} />;
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex '>
                <Sidebar active={active} onChange={(data)=>{
                    setActive(data)
                    setEditPackageId(null)
                }} />
                <main className="flex-1 p-6 bg-neutral-100 min-h-screen">
                    {renderPage()}
                </main>
            </div>
            <Footer />
            
        </div>
    )
}

export default AdminPanel
