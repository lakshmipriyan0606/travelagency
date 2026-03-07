/**
 * HeroSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Desktop  : left 55% = text + CTA  |  right 45% = HeroEnquiryForm card
 * Mobile   : full-width text + "ENQUIRE NOW" button → opens EnquiryModal
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react';
import HeroSectionVideoClip from '@/assets/video/hero.mp4';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import { WANumber } from '@/lib/utils';
import HeroEnquiryForm from './HeroEnquiryForm';
import EnquiryModal from './EnquiryModal';
import { HeroFormData } from '@/config/formConfig';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';

// ─── Scroll indicator (unchanged) ────────────────────────────────────────────

const ScrollIndicator = () => {
    const handleScroll = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    return (
        <div className="scroll-indicator" onClick={handleScroll}>
            <svg
                className="scroll-group"
                xmlns="http://www.w3.org/2000/svg"
                width="74"
                height="40"
                viewBox="0 0 74 40"
            >
                <g>
                    <circle className="circle-static" fill="none" cx="71%" cy="50%" r="24%" />
                    <circle className="circle-animated" fill="none" strokeWidth="2" cx="71%" cy="50%" r="24%" />
                </g>
                <polygon
                    className="scroll-arrow"
                    points="
            49.525,14.265 48.898,15.044 54.481,19.541
            6.444,19.541 6.444,20.541 54.464,20.541
            48.901,24.954 49.522,25.737 56.7,20.044
          "
                />
                <defs>
                    <linearGradient id="scroll-gradient" x1="100%" y1="50%" x2="0%" y2="50%">
                        <stop offset="0%" stopOpacity="0.3" />
                        <stop offset="100%" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

// ─── WhatsApp handler ─────────────────────────────────────────────────────────

const handleSendToWhatsApp = () => {
    const message =
        'Hi Sastika Travels I visited your website and would like to know more about your travel packages. Please share the details. Thank you!';
    const url = `https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// ─── HeroSection ──────────────────────────────────────────────────────────────

const HeroSection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFormComplete = (_data: HeroFormData) => {
        // Step 1 done — scroll to ReachUs for step 2
        const reachUsEl = document.getElementById('reach-us-section');
        if (reachUsEl) {
            reachUsEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="hero-container">
            {/* Background video */}
            <video className="hero-video rounded-2xl" src={HeroSectionVideoClip} autoPlay loop muted playsInline />

            {/* Dark overlay + layout */}
            <div className="hero-overlay rounded-2xl">
                <div className="hero-layout rounded-2xl">

                    {/* ── LEFT: text side ────────────────────────────────────────── */}
                    <div className="hero-text-side">
                        {/* Headline */}
                        <div className="hero-headline">
                            <p className="hero-sub-heading">
                                Experience{' '}
                                <span className="text-primary">Singapore</span>{' '}
                                like never before,
                            </p>
                            <p className="hero-sub-heading">
                                Adventure awaits{' '}
                                <span className="text-primary">Everywhere!</span>
                            </p>
                        </div>


                        {/* CTA Group */}
                        <div className="hero-cta-group pt-4">
                            <AnimatedButton
                                buttonText="ENQUIRE NOW!"
                                className="!px-10 !py-3.5 w-[150px] h-[45px] rounded-sm"
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setIsModalOpen(true);
                                    } else {
                                        const formEl = document.querySelector('.hero-form-card');
                                        formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                            />

                            {/* Desktop scroll hint */}
                            <div className="hidden md:block mt-8">
                                <ScrollIndicator />
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: form card (desktop only) ────────────────────────── */}
                    <div className="hero-form-side">
                        <HeroEnquiryForm onComplete={handleFormComplete} />
                    </div>

                </div>
            </div>

            {/* WhatsApp floating button */}
            <div className="hero-whatsapp">
                <img
                    src={whatsappIcon}
                    alt="Chat on WhatsApp"
                    className="w-12 h-12 cursor-pointer"
                    onClick={handleSendToWhatsApp}
                />
            </div>

            {/* Mobile enquiry modal */}
            <EnquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HeroSection;