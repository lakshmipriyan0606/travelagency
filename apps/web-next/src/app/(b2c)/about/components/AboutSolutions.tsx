'use client';
import { motion } from 'framer-motion';
import { Zap, Settings, CheckCircle2 } from 'lucide-react';
import { fadeInUpVariants, fadeInUpTransition } from './animations';

export const AboutSolutions = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-20 items-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            variants={fadeInUpVariants}
            transition={fadeInUpTransition as any}
            viewport={{ once: true, margin: "-100px" }}
            className="flex-1"
          >
            <h2 className="text-primary uppercase tracking-[0.3em] text-[10px] mb-6 font-heading">OUR METHODOLOGY</h2>
            <h3 className="text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-10 leading-[0.95] font-heading uppercase tracking-tighter">
              Simplifying Travel <br /> with Smart <br /> <span className="text-primary">Execution</span>
            </h3>

            <div className="space-y-10 md:space-y-12">
              {[
                {
                  title: "Real-Time Travel Coordination",
                  desc: "Stay ahead with live updates on traffic, schedules, and local conditions to ensure smooth and timely travel experiences across Malaysia.",
                  icon: Zap
                },
                {
                  title: "Seamless Operations & Integration",
                  desc: "Efficient systems and strong coordination between our team, partners, and vendors ensure hassle-free execution from booking to completion.",
                  icon: Settings
                },
                {
                  title: "Strict Quality Standards",
                  desc: "Every hotel, vehicle, and service partner is carefully vetted to maintain safety, comfort, and consistent service quality.",
                  icon: CheckCircle2
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 10 }}
                  className="flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-8 group cursor-pointer"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-[1.25rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300 shadow-sm group-hover:shadow-glow">
                    <item.icon size={28} strokeWidth={2.5} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-xl  text-gray-900 mb-2 font-heading group-hover:text-primary transition-colors uppercase tracking-tight">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed font-body">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex-1 relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              <img
                src="https://res.cloudinary.com/dizocitqw/image/upload/v1775663891/uploads/pvu6s8sd4awn66gmluy0.jpg"
                className="rounded-[2rem] md:rounded-[2.5rem] shadow-premium-lg md:mt-12 aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500"
                alt="Travel collage"
              />

              <img
                src="https://i.postimg.cc/ZYXZtbQz/miami-bayside-marketplace-jpg.jpg"
                className="rounded-[2rem] md:rounded-[2.5rem] shadow-premium-lg aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500"
                alt="Malaysia travel place"
              />

              <img
                src="https://i.postimg.cc/jSbb28Km/aerial-view-stunning-orangedomed-mosque-melaka-sunny-day-jpg.jpg"
                className="rounded-[2rem] md:rounded-[2.5rem] shadow-premium-lg aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500"
                alt="Melaka mosque view"
              />

              <img
                src="https://i.postimg.cc/fRNNyHZv/batu-caves-kuala-lumpur-one-largest-hindu-attractions-malaysia-jpg.jpg"
                className="rounded-[2rem] md:rounded-[2.5rem] shadow-premium-lg md:-mt-12 aspect-[3/4] object-cover hover:scale-105 transition-transform duration-500"
                alt="Batu Caves, Kuala Lumpur"
              />
            </motion.div>
            <div className="absolute inset-0 bg-primary/10 rounded-[4rem] -z-10 blur-3xl scale-110" />
          </div>
        </div>
      </div>
    </section>
  );
};
