import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
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
            <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden bg-custom-black border-t border-white/10 h-16 flex items-center shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
                {/* Enquiry Button */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 h-full border-r border-white/10 hover:bg-white/5 transition-colors"
                >
                    <MessageSquare size={20} className="text-white" />
                    <span className="text-white text-xs font-bold tracking-[0.1em] uppercase">ENQUIRY US</span>
                </button>

                {/* WhatsApp Button */}
                <button 
                    onClick={handleWhatsAppClick}
                    className="flex-1 flex items-center justify-center gap-2 h-full hover:bg-white/5 transition-colors"
                >
                    <img src={whatsappIcon} alt="WhatsApp" className="w-5 h-5" />
                    <span className="text-white text-xs font-bold tracking-[0.1em] uppercase">WHAT'SUP US</span>
                </button>
            </div>

            {/* Modal for Enquiry */}
            <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default MobileStickyBottomBar;
