import { motion } from 'framer-motion';
import abudhabiLogo from '@/assets/icons/experience-abudhabi 7.svg';

const TravelPartnerSection = () => {
    // Array of logos to repeat in the marquee
    // Using multiple instances of the same logo as per user's request/screenshot
    const logos = Array(12).fill(abudhabiLogo);

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold">
                    Our <span className="text-yellow-500">Travel Partners!</span>
                </h2>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* First set of logos */}
                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{
                        x: [0, -1920], // Adjust based on content width
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                >
                    {logos.map((logo, index) => (
                        <div key={`partner-1-${index}`} className="flex-none mx-10 md:mx-16 w-32 md:w-48 grayscale hover:grayscale-0 transition-all duration-300">
                            <img
                                src={logo}
                                alt="Travel Partner"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Second set of logos for seamless loop */}
                <motion.div
                    className="flex whitespace-nowrap absolute top-0"
                    animate={{
                        x: [1920, 0],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
                            ease: "linear",
                        },
                    }}
                    style={{ left: '100%' }}
                >
                    {logos.map((logo, index) => (
                        <div key={`partner-2-${index}`} className="flex-none mx-10 md:mx-16 w-32 md:w-48 grayscale hover:grayscale-0 transition-all duration-300">
                            <img
                                src={logo}
                                alt="Travel Partner"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TravelPartnerSection;
