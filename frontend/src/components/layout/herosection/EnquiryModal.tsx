/**
 * EnquiryModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Mobile-only modal overlay that wraps <HeroEnquiryForm />.
 * Triggered by the "ENQUIRE NOW" button in the hero section on mobile.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import HeroEnquiryForm from './HeroEnquiryForm';
import { HeroFormData } from '@/config/formConfig';

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
    // Lock body scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleComplete = (_data: HeroFormData) => {
        onClose();
        // Scroll to ReachUs section after closing modal
        setTimeout(() => {
            const reachUsEl = document.getElementById('reach-us-section');
            if (reachUsEl) {
                reachUsEl.scrollIntoView({ behavior: 'smooth' });
            }
        }, 300);
    };

    return (
        <div
            className="enquiry-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Enquiry Form"
        >
            {/* Card — stop click bubbling so clicking card doesn't close modal */}
            <div
                className="enquiry-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    className="enquiry-modal-close"
                    onClick={onClose}
                    aria-label="Close enquiry form"
                    type="button"
                >
                    <X size={20} />
                </button>

                <HeroEnquiryForm onComplete={handleComplete} compact />
            </div>
        </div>
    );
}
