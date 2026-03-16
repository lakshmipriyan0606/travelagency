import { useState } from 'react';
import enquiryIcon from '@/assets/icons/EnqiryIconMobile.svg';
import whatsappIcon from '@/assets/icons/WhatsappMobileIcon.svg';
import { WANumber } from '@/lib/utils';
import EnquiryModal from '../herosection/EnquiryModal';

const MobileStickyBottomBar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleWhatsAppClick = () => {
        const message = 'Hi Sastika Travels I visited your website and would like to know more about your travel packages. Please share the details. Thank you!';
        const url = `https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden bg-black border-t border-white/20 h-10 flex items-center shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
                {/* Enquiry Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 h-full border-r border-white/20 hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <img src={enquiryIcon} alt="Enquiry" className="w-[21px] h-[18px]" />
                    <span className="text-white text-[11px] font-bold tracking-[0.12em] uppercase">ENQUIRY US</span>
                </button>

                {/* WhatsApp Button */}
                <button
                    onClick={handleWhatsAppClick}
                    className="flex-1 flex items-center justify-center gap-3 h-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                    <img src={whatsappIcon} alt="WhatsApp" className="w-[18px] h-[18px]" />
                    <span className="text-white text-[11px] font-bold tracking-[0.12em] uppercase">WHAT'SUP US</span>
                </button>
            </div>

            {/* Modal for Enquiry */}
            <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default MobileStickyBottomBar;
