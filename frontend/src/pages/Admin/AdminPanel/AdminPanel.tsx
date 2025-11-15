import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import Footer from '@/components/layout/footer/Footer'
import Navbar from '@/components/layout/navbar/Navbar'
import React, { useState } from 'react'
import Sidebar from './SideNavbar/SideNavbar'
import AllPackage from '@/pages/AllPackage/AllPackage'
import FilterPackage from '@/components/layout/filterPackage/FilterPackage'

const AdminPanel = () => {


    const [active, setActive] = useState("AllPackages");

    const renderPage = () => {
        switch (active) {
            case "CreatePackage": return <AdminUploadPackageForm />;
            case "AllPackages": return <FilterPackage />;
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex '>
                <Sidebar active={active} onChange={setActive} />
                <main className="flex-1 p-6 bg-neutral-100 min-h-screen">
                    {renderPage()}
                </main>
            </div>
            <Footer />
        </div>
    )
}

export default AdminPanel
