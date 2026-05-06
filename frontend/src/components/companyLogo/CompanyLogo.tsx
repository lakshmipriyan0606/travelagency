import finalCompanyLogo from '@/assets/image/logo/finalCompanyLogo.png';
import { useNavigate } from 'react-router-dom';
import TransparentLogo from './TransparentLogo';

const CompanyLogo = () => {
    const navigate = useNavigate();

    return (
        <div 
            className='flex items-center cursor-pointer py-1' 
            onClick={() => { navigate('/') }}
        >
            <TransparentLogo 
                src={finalCompanyLogo} 
                alt="Sastikaa Travel Logo" 
                threshold={50}
                className='h-12 sm:h-14 md:h-16 lg:h-18 w-auto max-w-[160px] sm:max-w-[200px] md:max-w-none object-contain transition-all duration-300 transform hover:scale-105' 
            />
        </div>
    );
};

export default CompanyLogo;
