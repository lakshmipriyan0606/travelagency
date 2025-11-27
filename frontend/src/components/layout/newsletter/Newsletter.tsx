

import { useForm } from 'react-hook-form';
import { ReusableInput } from '@/components/forms/ReusableInput';
import PrimaryButton from '@/components/Button/PrimaryButton';
import NotifiationBell from '@/assets/icons/notificationBell.svg'
import { motion } from 'framer-motion';

export default function Newsletter() {
    const { control } = useForm()


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <section className="p-5">
            {/* Top Yellow Line */}

            <div className="max-w-4xl mx-auto px-4 text-center">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
                    SUBSCRIBE TO OUR NEWSLETTER
                </h2>

                {/* Form Container */}
                <form
                    onSubmit={handleSubmit}
                    className=" rounded-2xl border border-gray-300 p-6 md:p-8 max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6"
                >
                    {/* Icon + Text */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative">
                            <motion.img
                                src={NotifiationBell}
                                initial={{ rotate: 0 }}
                                animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0] }}
                                transition={{ duration: 1, repeat: 1 }}
                            />
                        </div>
                        <p className="font-bold text-lg">
                            Get More Updates
                        </p>
                    </div>

                    {/* Input + Button */}
                    <div className="flex items-center">
                        <ReusableInput control={control} name="email" required inputClassName='py-0  rounded-none rounded-l-sm bg-custom-black text-white h-[34px] border-none' mainContainerClassName='mb-0' />
                        <PrimaryButton type="submit" className="whitespace-nowrap rounded-r-sm relative right-[2px] h-[34px]" buttonText='Subscribe' />
                    </div>
                </form>
            </div>
        </section>
    );
}