/**
 * BookingFomField — ReachUs Section
 * ─────────────────────────────────────────────────────────────────────────────
 * Full booking form driven by reachUsFormFields config (formConfig.ts).
 * Uses existing reusable components: SelectField, ReusableInput, PhoneInputField
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    reachUsFormFields,
    reachUsFormSchema,
    ReachUsFormData,
    FormFieldConfig,
} from '@/config/formConfig';
import { SelectField } from '@/components/forms/SelectField';
import { ReusableInput } from '@/components/forms/ReusableInput';
import { PhoneInputField } from '@/components/forms/PhoneInputField';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import { CreateBookingForm } from '@/api/user/api';
import { useMutationAPIQuery } from '@/Hook/useMutationAPIQuery';
import { showToast } from '@/lib/utils';
import { MapPin, Calendar, Users, Clock, User, Mail, Phone, Globe } from 'lucide-react';
import type { ReactElement } from 'react';

// ─── Single dynamic field renderer ───────────────────────────────────────────

interface DynamicFieldProps {
    fieldConfig: FormFieldConfig;
    control: any;
}

const IconMap: Record<FormFieldConfig['icon'], ReactElement> = {
    MapPin: <MapPin size={18} className="text-yellow-600" />,
    Calendar: <Calendar size={18} className="text-yellow-600" />,
    Users: <Users size={18} className="text-yellow-600" />,
    Clock: <Clock size={18} className="text-yellow-600" />,
    User: <User size={18} className="text-yellow-600" />,
    Mail: <Mail size={18} className="text-yellow-600" />,
    Phone: <Phone size={18} className="text-yellow-600" />,
    Globe: <Globe size={18} className="text-yellow-600" />,
};

const DynamicField = ({ fieldConfig, control }: DynamicFieldProps) => {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="flex-none w-9 h-9 rounded-full bg-yellow-50/90 border border-yellow-200 flex items-center justify-center">
                {IconMap[fieldConfig.icon]}
            </div>
            <div className="flex-1 min-w-0">
                {fieldConfig.type === 'select' && fieldConfig.options ? (
                    <SelectField
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        options={fieldConfig.options}
                        required={fieldConfig.required}
                    />
                ) : fieldConfig.type === 'phone' ? (
                    <PhoneInputField
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        required={fieldConfig.required}
                    />
                ) : (
                    <ReusableInput
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                    />
                )}
            </div>
        </div>
    );
};

// ─── BookingFomField ──────────────────────────────────────────────────────────

const BookingFomField = () => {
    const defaultValues = reachUsFormFields.reduce<Record<string, string>>(
        (acc, f) => ({ ...acc, [f.name]: '' }),
        {}
    ) as ReachUsFormData;

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<ReachUsFormData>({
        resolver: zodResolver(reachUsFormSchema),
        defaultValues,
    });

    const { mutate, isPending: isMutating } = useMutationAPIQuery(CreateBookingForm, {
        onSuccess() {
            showToast({
                type: 'success',
                content: 'Your booking request has been submitted successfully!',
                position: 'top-right',
            });
            reset();
        },
        onError(error: any) {
            showToast({
                type: 'error',
                content: error.response?.data?.message || 'Something went wrong',
                position: 'top-right',
            });
        },
    });

    const onSubmit = (data: ReachUsFormData) => {
        mutate(data as any);
    };

    const loading = isSubmitting || isMutating;

    return (
        <div className="bg-transparent border border-white/30 rounded-2xl shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col">
                    {reachUsFormFields.map((fieldConfig) => (
                        <DynamicField
                            key={fieldConfig.name}
                            fieldConfig={fieldConfig}
                            control={control}
                        />
                    ))}
                </div>

                <div className="mt-4">
                    <AnimatedButton
                        type="submit"
                        disabled={loading}
                        buttonText={loading ? 'Submitting...' : 'Book Your Destination!'}
                        className="w-full !px-10 !py-3.5 rounded-md"
                    />
                </div>

                <p className="text-xs text-gray-300 text-center mt-2">
                    By proceeding, you agree with{' '}
                    <span className="underline text-blue-300 cursor-pointer">Terms of Use</span>
                </p>
            </form>
        </div>
    );
};

export default BookingFomField;
