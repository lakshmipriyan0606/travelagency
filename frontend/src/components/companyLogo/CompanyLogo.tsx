
import companyLogo from '@/assets/image/logo/latestlogo.svg'
import { useNavigate } from 'react-router-dom';

const CompanyLogoWeb = () => {

    const navigate = useNavigate();
    return (
        <div className=' hidden lg:flex items-center gap-2 sm:gap-3 p-1 cursor-pointer' onClick={() => { navigate('/') }}>
            <img src={companyLogo} alt="Company Logo" className='w-10 h-10 sm:w-14 sm:h-14 ' />
            <div className='flex flex-col'>
                <h1 className='text-white font-semibold leading-[1.2] tracking-[0.05em] flex items-end'>
                    <span className='text-2xl '>SASTIKAA</span>
                    <span className='text-2xl px-1'>TRAVEL</span>
                </h1>
                <div className='flex items-center  w-full cursor-pointer'>
                    <div className='h-[0.2px] bg-[#D3D3D3] w-[55%]'></div>
                    <div className='w-2 h-2 rounded-full bg-[#F69520] z-10 ml-1'></div>
                    <div className='h-[0.2px] bg-[#D3D3D3] flex-grow -mx-0.5 ml-1'></div>
                    <div className='w-[7px] h-[7px] rounded-full bg-gray-200'></div>
                </div>
                <p className='text-[#EE7322] text-base font-semibold tracking-[0.01em] uppercase'>
                    DISCOVER NEW EXPERIENCES
                </p>
            </div>
        </div>
    )
}


const CompanyLogoInMobile = () => {
    const navigate = useNavigate();
    return (
        <div className='flex justify-center items-center lg:hidden'>
            <img src={companyLogo} className='w-12 h-12 cursor-pointer' alt='Company Logo' onClick={() => { navigate('/') }} />
            <h1 className='text-[15px] sm:text-[19px] font-semibold'>SASTIKAA TRAVELS</h1>
        </div>
    )
}

const CompanyLogo = () => {
    return (
        <div>
            <CompanyLogoWeb />
            <CompanyLogoInMobile />
        </div>
    )
}

export default CompanyLogo
