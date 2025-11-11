import { ReusableInput } from '@/components/forms/ReusableInput';
import { SelectField } from '@/components/forms/SelectField';
import { DatePickerField } from '@/components/forms/DatePickerField';
import { PhoneInputField } from '@/components/forms/PhoneInputField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    city: z.string().min(1, 'City is required'),
    email: z.string().email('Invalid email').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    whatsapp: z.string().min(1, 'WhatsApp is required'),
    destination: z.string().min(1, 'Select a destination'),
    noOfPeople: z.string().min(1, 'Select number of people'),
    vacationType: z.string().min(1, 'Select vacation type'),
    travelDate: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

const destinations = [
    { value: 'bali', label: 'Bali' },
    { value: 'maldives', label: 'Maldives' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'switzerland', label: 'Switzerland' },
];

const peopleOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? 'Person' : 'People'}`,
}));

const vacationTypes = [
    { value: 'family', label: 'Family Vacation' },
    { value: 'honeymoon', label: 'Honeymoon' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'luxury', label: 'Luxury' },
];

const BookingFomField = () => {

    const { control, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: { travelDate: undefined as any },
    });

    const onSubmit = (data: FormData) => {
        console.log(data);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ReusableInput control={control} name="name" label="Name" required />
                <ReusableInput control={control} name="city" label="City of Residence" required />
                <ReusableInput control={control} name="email" label="Email" required />

                <PhoneInputField control={control} name="phone" label="Phone Number" required />
                <PhoneInputField control={control} name="whatsapp" label="WhatsApp Number" required />

                <SelectField control={control} name="destination" label="Travel Destination" options={destinations} required />

                <DatePickerField control={control} name="travelDate" label="Date of Travel" required />

                <SelectField control={control} name="noOfPeople" label="No. of People" options={peopleOptions} required />

                <SelectField control={control} name="vacationType" label="Vacation Type" options={vacationTypes} required />

                <button
                    type="submit"
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-semibold py-3 rounded-md transition tracking-wider shadow"
                >
                    Book Your Destination!
                </button>

                <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree with <span className="underline text-blue-600">Terms of Use</span>
                </p>
            </form>
        </div>
    )
}

export default BookingFomField