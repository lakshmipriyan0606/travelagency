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

// ─── Single dynamic field renderer ───────────────────────────────────────────

interface DynamicFieldProps {
    fieldConfig: FormFieldConfig;
    control: any;
}

const DynamicField = ({ fieldConfig, control }: DynamicFieldProps) => {
    if (fieldConfig.type === 'select' && fieldConfig.options) {
        return (
            <SelectField
                control={control}
                name={fieldConfig.name}
                label={fieldConfig.label}
                options={fieldConfig.options}
                required={fieldConfig.required}
            />
        );
    }

    if (fieldConfig.type === 'phone') {
        return (
            <PhoneInputField
                control={control}
                name={fieldConfig.name}
                label={fieldConfig.label}
                required={fieldConfig.required}
            />
        );
    }

    // text | email
    return (
        <ReusableInput
            control={control}
            name={fieldConfig.name}
            label={fieldConfig.label}
            type={fieldConfig.type}
            placeholder={fieldConfig.placeholder}
            required={fieldConfig.required}
        />
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
        <div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-0">
                {reachUsFormFields.map((fieldConfig) => (
                    <DynamicField
                        key={fieldConfig.name}
                        fieldConfig={fieldConfig}
                        control={control}
                    />
                ))}

                <div className="mt-4">
                    <AnimatedButton
                        type="submit"
                        disabled={loading}
                        buttonText={loading ? 'Submitting...' : 'Book Your Destination!'}
                        className="w-full !px-10 !py-3.5 "
                    />
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                    By proceeding, you agree with{' '}
                    <span className="underline text-blue-600 cursor-pointer">Terms of Use</span>
                </p>
            </form>
        </div>
    );
};

export default BookingFomField;