'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { WANumber } from '@/lib/utils';
import whatsappIcon from '@/assets/icons/whatsapp.svg';

const FloatingActions = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleWhatsAppClick = () => {
        const message =
            'Hi Sastika Travels I visited your website and would like to know more about your travel packages. Please share the details. Thank you!';
        const url = `https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleInstagramClick = () => {
        window.open('https://www.instagram.com/sastikaatravels/', '_blank');
    };

    return (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[100] flex flex-col items-center gap-3">
            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    className="w-11 h-11 rounded-full bg-white border-2 border-amber-300 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-amber-400 active:scale-95 group"
                >
                    <ChevronUp size={22} className="text-amber-600 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            )}

            {/* WhatsApp Button */}
            <button
                onClick={handleWhatsAppClick}
                aria-label="Contact on WhatsApp"
                className="cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
            >
                <img
                    src={typeof whatsappIcon === 'string' ? whatsappIcon : whatsappIcon.src}
                    alt="WhatsApp"
                    className="w-11 h-11 drop-shadow-md"
                />
            </button>

            {/* Instagram Button */}
            <button
                onClick={handleInstagramClick}
                aria-label="Follow on Instagram"
                className="cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                    alt="Instagram"
                    className="w-11 h-11 drop-shadow-md"
                />
            </button>
        </div>
    );
};

export default FloatingActions;

