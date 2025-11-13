import AdminUploadPackageForm from '@/components/layout/Admin/AdminUploadPackage/AdminUploadPackageForm'
import Footer from '@/components/layout/footer/Footer'
import Navbar from '@/components/layout/navbar/Navbar'
import React from 'react'

const AdminPanel = () => {
    return (
        <div>
            <Navbar/>
            <AdminUploadPackageForm />
            <Footer/>
        </div>
    )
}

export default AdminPanel
