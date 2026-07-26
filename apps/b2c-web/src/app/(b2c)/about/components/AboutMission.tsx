'use client';
import { motion } from 'framer-motion';
import { Globe, Heart, ShieldCheck } from 'lucide-react';
import { fadeInUpVariants, fadeInUpTransition, staggerContainer } from './animations';

export const AboutMission = () => {
  return (
    <section className="py-16 md:py-14 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 md:mb-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          variants={fadeInUpVariants}
          transition={fadeInUpTransition as any}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl md:text-6xl text-gray-900 mb-6 leading-none font-heading uppercase tracking-tighter">Built on <br /> Integrity.</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto font-bold font-body">
            Our core values guide every journey we create and every partnership we build across Malaysia.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        variants={staggerContainer}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
      >
        {[
          { icon: Globe, title: "Global Vision", desc: "Delivering world-class Destination Management Company (DMC) services in Malaysia, with a strong understanding of global travel expectations and evolving customer needs." },
          { icon: Heart, title: "Passionate People", desc: "Our experienced travel specialists and local experts treat every itinerary with care—ensuring each trip is thoughtfully planned, seamlessly executed, and truly memorable." },
          { icon: ShieldCheck, title: "Radical Honesty", desc: "We believe in complete transparency—offering clear pricing, honest communication, and dependable service that builds long-term trust with travelers and partners." }
        ].map((val, idx) => (
          <motion.div
            key={idx}
            variants={fadeInUpVariants}
            whileHover={{
              y: -10,
              scale: 1.02,
              boxShadow: "0 30px 60px -15px rgba(0,0,0,0.1)"
            }}
            transition={{ ...fadeInUpTransition, type: "spring", stiffness: 300, damping: 20 } as any}
            className="relative p-10 md:p-12 bg-white rounded-[3rem] md:rounded-[3.5rem] border border-gray-100 group overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700 ease-out" />
            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "anticipate" }}
                className="w-16 md:w-20 h-16 md:h-20 bg-primary text-black rounded-[1.5rem] flex items-center justify-center mb-8 shadow-glow group-hover:shadow-glow-lg transition-all"
              >
                <val.icon size={idx === 2 ? 32 : 40} strokeWidth={3} />
              </motion.div>
              <h4 className="text-2xl md:text-3xl text-gray-900 mb-4 font-heading group-hover:text-primary transition-colors uppercase leading-none">{val.title}</h4>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-body group-hover:text-gray-700 transition-colors">{val.desc}</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
