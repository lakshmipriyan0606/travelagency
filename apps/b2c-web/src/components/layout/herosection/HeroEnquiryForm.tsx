/**
 * HeroEnquiryForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Step-1 mini enquiry card shown in the Hero section (desktop) or inside the
 * mobile modal. Fields are driven by heroFormFields from formConfig.ts.
 * Uses reusable SelectField component.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Calendar, Users, Clock, Mail, User, MessageSquare } from 'lucide-react';
import {
    heroFormFields,
    // heroFormSchema,
    reachUsFormSchema,
    HeroFormData,
    languageOptions,
} from '@/config/formConfig';
import { SelectField } from '@/components/forms/SelectField';
import { ReusableInput } from '@/components/forms/ReusableInput';
import { ReusableTextArea } from '@/components/forms/ReusableTextArea';
import { PhoneInputField } from '@/components/forms/PhoneInputField';
import AnimatedButton from '@/components/Button/AnimatedButton/AnimatedButton';
import { CreateBookingForm } from '@/api/user/api';
import { useMutationAPIQuery } from '@/Hook/useMutationAPIQuery';
import { showToast } from '@/lib/utils';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
    MapPin: <MapPin size={18} className="text-yellow-600" />,
    Calendar: <Calendar size={18} className="text-yellow-600" />,
    Users: <Users size={18} className="text-yellow-600" />,
    Clock: <Clock size={18} className="text-yellow-600" />,
    MessageSquare: <MessageSquare size={18} className="text-yellow-600" />,
};

// ─── Main form component ──────────────────────────────────────────────────────

interface HeroEnquiryFormProps {
    /** Called when user successfully submits step-1 data */
    onComplete?: (data: HeroFormData) => void;
    /** Compact mode for inside modal on mobile — removes extra padding */
    compact?: boolean;
    isCustomMobileView?: boolean;
}

import { ReachUsFormData } from '@/config/formConfig';

type StepFormData = ReachUsFormData;

export default function HeroEnquiryForm({
    onComplete,
    compact = false,
    isCustomMobileView = false,
    packageName = '',
}: HeroEnquiryFormProps & { packageName?: string }) {
    const [step, setStep] = useState<1 | 2>(1);
    const {
        control,
        handleSubmit,
        trigger,
        watch,
        reset,
        setValue,
        clearErrors,
        formState: { errors },
    } = useForm<StepFormData>({
        resolver: zodResolver(reachUsFormSchema),
        mode: 'onChange',
        defaultValues: {
            destination: '',
            travelMonth: '',
            noOfPeople: '',
            duration: '',
            name: '',
            email: '',
            whatsapp: '',
            language: '',
            message: '',
            packageName: packageName || '',
        },
    });

    useEffect(() => {
        if (packageName) {
            setValue('packageName', packageName);
        }
    }, [packageName, setValue]);

    console.log(errors);

    const [destination, travelMonth, noOfPeople, duration] = watch([
        'destination',
        'travelMonth',
        'noOfPeople',
        'duration',
        'name',
        'email',
    ]);
    const step1Complete = Boolean(destination && travelMonth && noOfPeople && duration);
    // const step2Complete = Boolean(step1Complete && name && email);

    const { mutate, isPending: isMutating } = useMutationAPIQuery(CreateBookingForm, {
        onSuccess() {
            showToast({
                type: 'success',
                content: 'Your booking request has been submitted successfully!',
                position: 'top-right',
            });
            reset();
            setStep(1);
            onComplete?.({} as any);
        },
        onError(error: any) {
            showToast({
                type: 'error',
                content: error.response?.data?.message || 'Something went wrong',
                position: 'top-right',
            });
        },
    });

    const handleNextStep = async () => {
        // Trigger validation for step 1 fields only
        const isStep1Valid = await trigger(['destination', 'travelMonth', 'noOfPeople', 'duration']);
        if (isStep1Valid) {
            clearErrors(['name', 'email', 'whatsapp', 'language']);
            setStep(2);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            await handleNextStep();
        } else {
            handleSubmit((data) => mutate(data))(e);
        }
    };


    return (
        <div
            id="hero-form-card"
            className={[
                'backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-sm px-6 pt-6 pb-4 flex flex-col gap-3',
                compact ? 'rounded-2xl shadow-none px-4 pt-4 pb-3' : '',
                isCustomMobileView ? '' : 'bg-white/95',
                !isCustomMobileView ? 'border-none' : 'border border-gray-100',
            ].join(' ')}
        >
            <p className={`font-bold text-center leading-snug ${isCustomMobileView ? 'text-gray-200' : 'text-gray-800'}`}>Your Perfect Trip Begins Here!</p>
            <div className="-mx-2 border-t border-gray-200" />
            <form onSubmit={handleFormSubmit} noValidate>
                <div className="flex flex-col">
                    {step === 1 &&
                        heroFormFields.map((field) => (
                            <div key={field.name} className="flex items-center gap-3 py-3">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                                    {iconMap[field.icon]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {field.type === 'select' && field.options ? (
                                        <SelectField
                                            control={control}
                                            name={field.name}
                                            label={field.label}
                                            options={field.options}
                                            required={field.required}
                                            labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                            selectedValueClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                        />
                                    ) : (
                                        <ReusableInput
                                            control={control}
                                            name={field.name}
                                            label={field.label}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                            inputClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                    {step === 2 && (
                        <>
                            <div className="flex items-center gap-3 py-3">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                                    <User size={18} className="text-yellow-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ReusableInput
                                        control={control}
                                        name="name"
                                        label="Name"
                                        required
                                        inputClassName="focus-visible:ring-yellow-200 focus-visible:border-yellow-400"
                                        inputProps={{ id: 'hero-name-input' }}
                                        labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3 ">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                                    <Mail size={18} className="text-yellow-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ReusableInput
                                        control={control}
                                        name="email"
                                        label="Email"
                                        type="email"
                                        required
                                        inputClassName="focus-visible:ring-yellow-200 focus-visible:border-yellow-400"
                                        labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3 ">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                                    <span className="text-yellow-600 text-[12px] font-bold">WA</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <PhoneInputField
                                        control={control}
                                        name="whatsapp"
                                        label="WhatsApp"
                                        required
                                        mainContainerClassName="mb-0"
                                        labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3  last:border-b-0">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                                    <span className="text-yellow-600 text-[12px] font-bold">LG</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <SelectField
                                        control={control}
                                        name="language"
                                        label="Preferred Language"
                                        options={languageOptions}
                                        labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                        selectedValueClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                    />
                                </div>
                            </div>
                            <div className="flex items-start gap-3 py-3 last:border-b-0">
                                <div className="flex-none w-9 h-9 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mt-1">
                                    <MessageSquare size={18} className="text-yellow-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <ReusableTextArea
                                        control={control}
                                        name="message"
                                        label="Message (Max 500 chars)"
                                        placeholder="Add any special requests..."
                                        maxLength={500}
                                        labelClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                        textareaClassName={isCustomMobileView ? 'text-gray-200' : ''}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                    <div
                        className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-yellow-500' : 'bg-gray-300'} cursor-pointer`}
                        onClick={() => setStep(1)}
                        title="Go to Step 1"
                    />
                    <div
                        className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-yellow-500' : 'bg-gray-300'} ${step1Complete ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        onClick={() => step1Complete && handleNextStep()}
                        title={step1Complete ? "Go to Step 2" : "Complete Step 1 first"}
                    />
                    <span className="text-xs text-gray-500 ml-2">Step {step} of 2</span>
                </div>

                <div className="mt-4 text-center">
                    <AnimatedButton
                        buttonText={step === 1 ? 'NEXT' : (isMutating ? 'SUBMITTING...' : 'SUBMIT')}
                        type="submit"
                        className="w-full !px-10 !py-3.5 rounded-md"
                        borderButtonColor={'#FFD700'}
                        disabled={isMutating}
                    />
                </div>
            </form>
        </div>
    );
}
