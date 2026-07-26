'use client';
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
import { SelectField } from '@travelagency/forms';
import { ReusableInput } from '@travelagency/forms';
import { PhoneInputField } from '@travelagency/forms';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import { CreateBookingForm } from '@/api/user/api';
import { useMutationAPIQuery } from '@travelagency/hooks';

import { showToast } from "@/lib/toast";
import { MapPin, Calendar, Users, Clock, User, Mail, Phone, Globe, MessageSquare } from 'lucide-react';
import { useEffect, type ReactElement } from 'react';
import { ReusableTextArea } from '@travelagency/forms';

// ─── Single dynamic field renderer ───────────────────────────────────────────

interface DynamicFieldProps {
    fieldConfig: FormFieldConfig;
    control: any;
    fieldClassName?: string;
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
    MessageSquare: <MessageSquare size={18} className="text-yellow-600" />,
};

const DynamicField = ({ fieldConfig, control, fieldClassName }: DynamicFieldProps) => {
    return (
        <div className="flex items-center gap-3 py-1.5">
            <div className={`flex-none w-9 h-9 rounded-full bg-yellow-50/90 border border-yellow-200 flex items-center justify-center ${fieldConfig.type === 'textarea' ? 'self-start mt-1' : ''}`}>
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
                        labelClassName="text-gray-500"
                        selectedValueClassName={fieldClassName}
                    />
                ) : fieldConfig.type === 'phone' ? (
                    <PhoneInputField
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        required={fieldConfig.required}
                        labelClassName="text-gray-500"
                        inputClassName={fieldClassName}
                    />
                ) : fieldConfig.type === 'textarea' ? (
                    <ReusableTextArea
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                        maxLength={500}
                        labelClassName="text-gray-500"
                        textareaClassName={fieldClassName}
                    />
                ) : (
                    <ReusableInput
                        control={control}
                        name={fieldConfig.name}
                        label={fieldConfig.label}
                        type={fieldConfig.type}
                        placeholder={fieldConfig.placeholder}
                        required={fieldConfig.required}
                        labelClassName="text-gray-500"
                        inputClassName={fieldClassName}
                    />
                )}
            </div>
        </div>
    );
};

// ─── BookingFomField ──────────────────────────────────────────────────────────

const BookingFomField = ({ fieldClassName = 'text-gray-200', mainClassName, packageName }: { fieldClassName?: string, mainClassName?: string, packageName?: string }) => {
    const defaultValues = {
        ...reachUsFormFields.reduce<Record<string, string>>(
            (acc, f) => ({ ...acc, [f.name]: '' }),
            {}
        ),
        packageName: packageName || '',
    } as ReachUsFormData;

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting },
    } = useForm<ReachUsFormData>({
        resolver: zodResolver(reachUsFormSchema),
        defaultValues,
    });

    useEffect(() => {
        if (packageName) {
            setValue('packageName', packageName);
        }
    }, [packageName, setValue]);

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
        <div className={`border border-white/30 rounded-2xl shadow-2xl sm:p-8 ${mainClassName}`}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="flex flex-col">
                    {reachUsFormFields.map((fieldConfig) => (
                        <DynamicField
                            key={fieldConfig.name}
                            fieldConfig={fieldConfig}
                            control={control}
                            fieldClassName={fieldClassName}
                        />
                    ))}
                </div>

                <div className="mt-4">
                    <AnimatedButton
                        type="submit"
                        disabled={loading}
                        buttonText={loading ? 'Submitting...' : 'Book Your Destination!'}
                        className="w-full !px-10 !py-3.5"
                    />
                </div>
            </form>
        </div>
    );
};

export default BookingFomField;


