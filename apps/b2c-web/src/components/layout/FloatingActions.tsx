import { WANumber } from '@/lib/utils';
import whatsappIcon from '@/assets/icons/whatsapp.svg';

const FloatingActions = () => {
    const handleWhatsAppClick = () => {
        const message = 'Hi Sastika Travels I visited your website and would like to know more about your travel packages. Please share the details. Thank you!';
        const url = `https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleInstagramClick = () => {
        window.open('https://www.instagram.com/sastikaatravels/', '_blank');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 sm:bottom-2 hidden sm:flex">
            {/* WhatsApp Button */}
            <button
                onClick={handleWhatsAppClick}
                aria-label="Contact on WhatsApp"
                className="cursor-pointer"
            >
                <img src={whatsappIcon} alt="WhatsApp" className="w-10 h-10 relative z-10" />
            </button>

            {/* Instagram Button */}
            <button
                onClick={handleInstagramClick}
                aria-label="Follow on Instagram"
                className="cursor-pointer"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                    alt="Instagram"
                    className="w-10 h-10 relative z-10"
                />
            </button>
        </div>
    );
};

export default FloatingActions;
