/**
 * HeroEnquiryForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Step-1 mini enquiry card shown in the Hero section (desktop) or inside the
 * mobile modal. Fields are driven by heroFormFields from formConfig.ts.
 * Uses reusable SelectField component.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Calendar, Users, Clock } from 'lucide-react';
import {
    heroFormFields,
    heroFormSchema,
    HeroFormData,
} from '@/config/formConfig';
import { SelectField } from '@/components/forms/SelectField';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
    MapPin: <MapPin size={18} className="text-yellow-600" />,
    Calendar: <Calendar size={18} className="text-yellow-600" />,
    Users: <Users size={18} className="text-yellow-600" />,
    Clock: <Clock size={18} className="text-yellow-600" />,
};

// ─── Main form component ──────────────────────────────────────────────────────

interface HeroEnquiryFormProps {
    /** Called when user successfully submits step-1 data */
    onComplete?: (data: HeroFormData) => void;
    /** Compact mode for inside modal on mobile — removes extra padding */
    compact?: boolean;
}

export default function HeroEnquiryForm({
    onComplete,
    compact = false,
}: HeroEnquiryFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitted },
    } = useForm<HeroFormData>({
        resolver: zodResolver(heroFormSchema),
        defaultValues: {
            destination: '',
            travelMonth: '',
            noOfPeople: '',
            duration: '',
        },
    });

    const onSubmit = (data: HeroFormData) => {
        onComplete?.(data);
        const reachUsEl = document.getElementById('reach-us-section');
        if (reachUsEl) {
            reachUsEl.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const hasAnyError = isSubmitted && Object.keys(errors).length > 0;

    return (
        <div className={`hero-form-card ${compact ? 'hero-form-card--compact' : ''}`}>
            {/* Card title */}
            <p className="hero-form-title">Your Perfect Trip Begins Here!</p>

            {/* Divider */}
            <div className="hero-form-divider" />

            {/* Fields */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="hero-form-fields">
                    {heroFormFields.map((field) => (
                        <div key={field.name} className="hero-form-field">
                            {/* Icon bubble */}
                            <div className="hero-form-field-icon">
                                {iconMap[field.icon]}
                            </div>

                            {/* SelectField reusable component */}
                            <div className="flex-1 min-w-0">
                                {field.options && (
                                    <SelectField
                                        control={control}
                                        name={field.name}
                                        label={field.label}
                                        options={field.options}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="mt-4">
                    <AnimatedButton
                        buttonText="NEXT"
                        type="submit"
                        className="w-full !px-10 !py-3.5 rounded-md"
                        borderButtonColor={'#FFD700'}
                    />
                </div>

                {/* Step dots */}
                {/* <div className="hero-form-dots">
                    <span className="hero-form-dot hero-form-dot--active" />
                    <span className="hero-form-dot" />
                </div> */}
            </form>
        </div>
    );
}
