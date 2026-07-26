'use client';
import { motion } from 'framer-motion';
import { fadeInUpVariants, fadeInUpTransition } from './animations';

export const AboutStory = () => {
  return (
    <section className="py-16 md:py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-amber-50"
            >
              <img
                src="https://res.cloudinary.com/dizocitqw/image/upload/v1774080031/travel_packages/ire48oc7tl83t9k5uaye.jpg"
                alt="Travel experience in Malaysia"
                className="w-full aspect-[4/5] object-cover"
              />
            </motion.div>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            variants={fadeInUpVariants}
            transition={fadeInUpTransition as any}
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <h2 className="text-[10px] tracking-[0.4em] text-primary uppercase mb-4 font-heading">THE JOURNEY</h2>
            <h3 className="text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-8 leading-[0.95] font-heading uppercase tracking-tighter">
              Crafting Meaningful <br />
              Travel Experiences <br className="hidden lg:block" />
              <span className="text-primary">Across Malaysia</span>
            </h3>
            <div className="space-y-6 text-gray-600 text-sm md:text-base leading-relaxed font-medium font-body max-w-lg mx-auto lg:mx-0">
              <p>
                At Sastikaa Travel, our journey began with a simple vision — to go beyond being just a travel provider and become a trusted on-ground partner in Malaysia. We recognized that travelers and global travel agents need more than bookings; they need reliability, local expertise, and seamless execution.
              </p>
              <p>
                With deep knowledge of destinations like Kuala Lumpur, Langkawi, Genting Highlands, and beyond, we design travel experiences that balance comfort, authenticity, and efficiency. Every itinerary is thoughtfully crafted to match the expectations of modern travelers and the operational needs of travel partners.
              </p>
              <p>
                Today, Sastikaa Travel stands as a dependable Destination Management Company (DMC) in Malaysia, delivering personalized holidays and complete ground handling services with precision and care.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
