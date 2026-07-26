'use client';
import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Settings, Clock, Tag, UserCheck } from 'lucide-react';
import { fadeInUpVariants, fadeInUpTransition, staggerContainer } from './animations';

export const AboutUSP = () => {
  return (
    <section className="py-20 md:py-32 bg-[#0a0a0b]/95 text-white rounded-[3rem] mx-2 md:mx-4 my-12 md:my-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 md:mb-24">
        <motion.div
          initial="initial"
          whileInView="animate"
          variants={fadeInUpVariants}
          transition={fadeInUpTransition as any}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-primary tracking-[0.3em] uppercase text-[10px] mb-4 font-heading">WHY PARTNER WITH US</h2>
          <h3 className="text-4xl md:text-6xl text-white mb-6 leading-none font-heading uppercase tracking-tighter">Unmatched Travel <br /> Expertise & Reliability</h3>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-medium font-body">
            Strategic advantages that make Sastikaa Travel your trusted ground partner in Malaysia.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        variants={staggerContainer}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {[
          { icon: Globe, title: "Local Destination Expertise", desc: "In-depth knowledge of Malaysia’s top destinations, ensuring authentic experiences and smooth travel execution." },
          { icon: ShieldCheck, title: "Transparent & Reliable Service", desc: "Clear pricing, honest communication, and dependable operations you can trust every time." },
          { icon: Settings, title: "Customized Travel Solutions", desc: "Tailor-made itineraries designed to match your clients’ preferences, budgets, and travel styles." },
          { icon: Clock, title: "24/7 On-Ground Support", desc: "Round-the-clock assistance to handle changes, emergencies, and ensure a stress-free journey." },
          { icon: Tag, title: "Competitive & Direct Pricing", desc: "A strong vendor network allows us to offer the best rates without compromising quality." },
          { icon: UserCheck, title: "Professional Guides & Drivers", desc: "Experienced, friendly, and certified professionals ensuring safety, comfort, and local insights." }
        ].map((usp, index) => (
          <motion.div
            key={index}
            variants={fadeInUpVariants}
            whileHover={{
              y: -10,
              backgroundColor: "rgba(252,175,22,0.05)",
              borderColor: "rgba(252,175,22,0.3)",
              boxShadow: "0 20px 40px -10px rgba(252,175,22,0.15)"
            }}
            transition={{ ...fadeInUpTransition, type: "spring", stiffness: 300, damping: 20 } as any}
            className="p-8 md:p-10 rounded-[2.5rem] bg-white/5 border border-white/10 transition-all duration-500 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-[2] transition-transform duration-700 ease-out" />

            <div className="relative z-10">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center mb-8 text-black shadow-glow group-hover:shadow-glow-lg transition-all duration-500"
              >
                <usp.icon size={28} strokeWidth={3} />
              </motion.div>
              <h4 className="text-xl  mb-4 font-heading group-hover:text-primary transition-colors">{usp.title}</h4>
              <p className="text-gray-400 leading-relaxed text-sm font-medium font-body group-hover:text-gray-300 transition-colors">{usp.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
