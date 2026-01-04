import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                >
                    <div className="text-[150px] font-bold text-gray-200 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="text-primary"
                        >
                            <Compass size={100} className="text-[#C59435]" />
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Lost Your Way?
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        It looks like the destination you're looking for doesn't exist on our map.
                        Let's get you back on track to your next adventure.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="flex items-center cursor-pointer gap-2 px-8 py-3 bg-primary hover:bg-custom-black text-white rounded-full font-semibold shadow-lg transition-colors group"
                        >
                            <Home size={20} />
                            <span>Return Home</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/allpackage')}
                            className="flex items-center cursor-pointer gap-2 px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-full font-semibold transition-colors"
                        >
                            <MapPin size={20} />
                            <span>Explore Packages</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
