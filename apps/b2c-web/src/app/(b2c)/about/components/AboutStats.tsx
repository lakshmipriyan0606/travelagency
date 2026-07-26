'use client';
import { motion } from 'framer-motion';
import { Users, Target, MapPin, Calendar } from 'lucide-react';

export const AboutStats = () => {
  return (
    <section className="relative -mt-10 md:-mt-12 z-30 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-3 bg-white p-3 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] border border-gray-100"
        >
          {[
            { label: "Active Partners", value: "250+", icon: Users },
            { label: "Global Experts", value: "45+", icon: Target },
            { label: "Yearly Tours", value: "1.2k+", icon: MapPin },
            { label: "Years Experience", value: "10+", icon: Calendar }
          ].map((stat, i) => (
            <div key={i} className="text-center group cursor-pointer border-b last:border-0 sm:border-b-0 sm:odd:border-r lg:odd:border-r-0 lg:[&:not(:last-child)]:border-r border-gray-100 pb-3 sm:pb-0">
              <div className="w-11 h-11 bg-primary/10 rounded-[1rem] flex items-center justify-center mx-auto mb-3 text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-sm group-hover:shadow-glow">
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-1 font-heading">{stat.value}</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-heading">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
