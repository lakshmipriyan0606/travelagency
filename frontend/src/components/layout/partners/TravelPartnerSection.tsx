import { motion } from 'framer-motion';
import tp1 from '@/assets/image/travelPartner/tp1.png';
import tp2 from '@/assets/image/travelPartner/tp2.png';
import tp3 from '@/assets/image/travelPartner/tp3.jpeg';
import tp4 from '@/assets/image/travelPartner/tp4.jpeg';
import tp5 from '@/assets/image/travelPartner/tp5.png';

const partners = [
    {
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773594308/uploads/v1zqh8phmv1mzgxq1wsn.png",
        fallback: tp1
    },
    {
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773594327/uploads/nl5dzf5pb0pndnshvyib.png",
        fallback: tp2
    },
    {
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773594356/uploads/ocibsv73iq8lajcy2wbt.jpg",
        fallback: tp3
    },
    {
        src: "https://res.cloudinary.com/dizocitqw/image/upload/v1773594368/uploads/n9ddfjursjyhtnkodrqe.png",
        fallback: tp4
    },
    {
        src: "", // No URL for 5th, use local directly
        fallback: tp5
    }
];

// Shuffle partners to prevent same logos from appearing side-by-side
const shuffledPartners = partners.sort(() => Math.random() - 0.5);

const TravelPartnerSection = () => {
    // Array of logos to repeat in the marquee
    const logos = [...shuffledPartners]; // Triple for better flow

    return (
        <section className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center border-t border-gray-100 pt-10">
                <h2 className="text-3xl md:text-4xl">
                    Our <span className="text-yellow-500 font-bold">Travel Partners!</span>
                </h2>
            </div>

            <div className="relative flex overflow-x-hidden group mt-10">
                {/* First set of logos */}
                <motion.div
                    className="flex whitespace-nowrap items-center"
                    animate={{
                        x: [0, "-100%"],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 50, // Slower for better readability
                            ease: "linear",
                        },
                    }}
                >
                    {logos.map((partner, index) => (
                        <div key={`partner-1-${index}`} className="flex-none mx-10 md:mx-16 w-32 md:w-48 grayscale hover:grayscale-0 transition-all duration-300">
                            <img
                                src={partner.src || partner.fallback}
                                alt="Travel Partner"
                                className="w-full h-auto object-contain max-h-16"
                                onError={(e) => {
                                    const img = e.currentTarget as HTMLImageElement;
                                    if (partner.fallback && img.src !== partner.fallback) {
                                        img.src = partner.fallback;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Second set of logos for seamless loop */}
                <motion.div
                    className="flex whitespace-nowrap absolute top-0 items-center h-full"
                    animate={{
                        x: ["100%", 0],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 50,
                            ease: "linear",
                        },
                    }}
                    style={{ left: 0 }}
                >
                    {logos.map((partner, index) => (
                        <div key={`partner-2-${index}`} className="flex-none mx-10 md:mx-16 w-32 md:w-48 grayscale hover:grayscale-0 transition-all duration-300">
                            <img
                                src={partner.src || partner.fallback}
                                alt="Travel Partner"
                                className="w-full h-auto object-contain max-h-16"
                                onError={(e) => {
                                    const img = e.currentTarget as HTMLImageElement;
                                    if (partner.fallback && img.src !== partner.fallback) {
                                        img.src = partner.fallback;
                                    }
                                }}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TravelPartnerSection;
