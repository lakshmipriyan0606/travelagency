
import companyLogo from '@/assets/image/logo/companyLogo.png'

const CompanyLogo = () => {
    return (
        <div className='flex justify-center items-center'>
            <img src={companyLogo} alt="Company Logo" className='company-logo'/>
            <h1 className='text-[12px] sm:text-[19px] font-semibold'>SASTIKAA TRAVELS</h1>
        </div>
    )
}

export default CompanyLogo
