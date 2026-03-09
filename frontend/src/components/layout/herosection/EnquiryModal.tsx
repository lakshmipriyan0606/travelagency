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
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Enquiry Form"
        >
            <div
                className="relative bg-white w-full sm:max-w-sm bottom-16 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
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
