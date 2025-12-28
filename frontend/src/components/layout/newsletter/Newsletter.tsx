// import { useForm } from 'react-hook-form';
// import { ReusableInput } from '@/components/forms/ReusableInput';
import PrimaryButton from '@/components/Button/PrimaryButton';
import NotifiationBell from '@/assets/icons/notificationBell.svg';
import { motion } from 'framer-motion';
import { showToast } from '@/lib/utils';
import { useMutationAPIQuery } from '@/Hook/useMutationAPIQuery';
import { subscribeNewsletter } from '@/api/user/api';
// import z from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';

// type NewsletterForm = {
//     email: string;
// };

// const emailSchema = z.object({
//     email: z
//         .string()
//         .email("Invalid email")
//         .min(1, "Email is required")
//         .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),

// });

export default function Newsletter() {
    // const { control, handleSubmit, reset } = useForm<NewsletterForm>({
    //     // resolver: zodResolver(emailSchema),
    // });

    const emailRef = useRef<HTMLInputElement>(null);

    const { mutate, isPending } = useMutationAPIQuery(subscribeNewsletter, {
        onSuccess() {
            showToast({
                type: 'success',
                content: 'Thank you for subscribing to our newsletter!',
                position: 'top-right',
            });
            if (emailRef.current?.value) {
                emailRef.current.value = '';
            }
        },
        onError(error: any) {
            console.log('error: ', error);
            showToast({
                type: 'error',
                content: error.response?.data?.message || 'Something went wrong',
                position: 'top-right',
            });
        },
    });

    const formSubmit = () => {
        const emailInput = emailRef.current?.value;
        if (emailInput) {
            mutate({ email: emailInput });
        }
    };

    return (
        <section className="p-5 py-18">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    SUBSCRIBE TO OUR NEWSLETTER
                </h2>

                <form onSubmit={(e) => { e.preventDefault(); formSubmit(); }} className="rounded-2xl border border-gray-300 p-6 md:p-8 max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6">
                    {/* Icon + Text */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <motion.img
                            src={NotifiationBell}
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
                            transition={{ duration: 1 }}
                        />
                        <p className="font-bold text-lg">Get More Updates</p>
                    </div>

                    {/* Input + Button */}
                    <div className="flex items-center">
                        <input
                            name="email"
                            required
                            placeholder="Email address"
                            className="py-0 rounded-none rounded-l-sm bg-custom-black text-white h-[34px] border-none pl-3 focus:ring-0 focus:outline-none w-[210px]"
                            // mainContainerClassName="mb-0"
                            type='email'
                            ref={emailRef}
                            autoComplete="off"
                        />

                        <PrimaryButton
                            type="submit"
                            {...{ disabled: isPending }}
                            className={`whitespace-nowrap rounded-r-sm relative right-[2px] h-[34px] ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            buttonText={isPending ? "subscribing..." : "subscribe"}
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}
