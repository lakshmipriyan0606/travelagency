import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Users,
  Target,
  ShieldCheck,
  Settings,
  Clock,
  Tag,
  UserCheck,
  CheckCircle2,
  Zap,
  Heart,
  Globe,
  MapPin,
  Calendar,
  Smile
} from 'lucide-react';

const About = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const fadeInUpVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const fadeInUpTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  } as any;

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  return (
    <div className="bg-[#fcfcfd] text-[#1a1a1a] selection:bg-primary/20 selection:text-primary-dark font-body">
      {/* Hero Section - Compact & Bold */}
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

      {/* Stats Section - Tighter spacing */}
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

      {/* Our Story - Compact visual balance */}
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
                  src="https://i.postimg.cc/2SDDyHmc/rear-view-woman-against-sea-trees-against-sky-jpg.jpg"
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

      {/* USP Section - Compact Dark Mode */}
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

      {/* Solutions Section - Compact methodology */}
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

      {/* Mission & Values - Compact spacing */}
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
    </div>
  );
};

export default About;
