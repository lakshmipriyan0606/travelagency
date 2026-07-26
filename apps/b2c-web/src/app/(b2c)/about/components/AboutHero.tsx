'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Smile } from 'lucide-react';
import { fadeInUpVariants, fadeInUpTransition, floatingAnimation } from './animations';

export const AboutHero = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{ scale }}
          className="w-full h-full bg-[url('https://i.postimg.cc/x13SzKT6/couple-overlooking-city-skyline-sunset-with-skyscrapers-view-jpg.jpg')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
        <motion.div
          initial="initial"
          whileInView="animate"
          variants={fadeInUpVariants}
          transition={fadeInUpTransition as any}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center lg:items-start"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-primary text-black text-[10px] md:text-xs tracking-[0.2em] mb-6 shadow-glow-lg">
            ESTABLISHED IN 2014
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[0.9] uppercase font-heading">
            Redefining Travel <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Experiences</span> <br />
            Across Malaysia
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl leading-relaxed mb-10 drop-shadow-lg font-body">
            Delivering seamless, personalized, and reliable travel solutions for global travelers and travel partners. From vibrant cities to scenic destinations, we make every journey effortless and memorable.
          </p>
        </motion.div>
      </div>

      {/* Floating Trust Badge */}
      <motion.div
        variants={floatingAnimation}
        animate="animate"
        className="absolute top-[79%] sm:top-[86%] -translate-y-1/2 left-4 sm:left-6 lg:left-4 bg-white/10 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/20 hidden lg:block shadow-2xl cursor-pointer hover:bg-white/20 transition-all z-20 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black shadow-glow group-hover:scale-110 transition-transform">
            <Smile size={24} strokeWidth={3} />
          </div>
          <div className="pr-2">
            <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-heading">Trust</p>
            <p className="text-white text-xl  font-heading leading-none mt-1">98% Satisfaction Rate</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
