'use client';
import { motion } from 'framer-motion';
import {
  FileText,
  Settings,
  CreditCard,
  ShieldCheck,
  Info,
  ArrowRight,
  Landmark,
  ChevronRight
} from 'lucide-react';
import { termsData } from './constant';
import { useState, useEffect } from 'react';

const TermsAndConditions = () => {
  const [activeTab, setActiveTab] = useState(termsData[0].title);

  // Intersection Observer for scroll-spy effect on desktop
  useEffect(() => {
    const pElements = document.querySelectorAll('.term-category-section');
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          const title = entry.getAttribute('data-title');
          if (title) setActiveTab(title);
        }
      });
    }, observerOptions);

    pElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToCategory = (title: string) => {
    setActiveTab(title); // Immediate UI update
    const element = document.querySelector(`[data-title="${title}"]`);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const fadeInUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const getCategoryIcon = (categoryTitle: string) => {
    switch (categoryTitle) {
      case "General Rate Policies": return <FileText size={20} />;
      case "Service Inclusions & Policies": return <Settings size={20} />;
      case "Financial & Booking Terms": return <CreditCard size={20} />;
      case "Legal & Liability": return <ShieldCheck size={20} />;
      default: return <Info size={20} />;
    }
  };
  return (
    <div className="bg-[#fcfcfd] min-h-screen font-body selection:bg-primary/20 selection:text-primary-dark">
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[url('https://res.cloudinary.com/dizocitqw/image/upload/v1774077014/travel_packages/zonwfcxrdg6ssjnu2fpy.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md text-primary text-[10px] md:text-xs tracking-[0.2em] mb-4 border border-primary/30 uppercase">
              Legal Documentation
            </span>
            <h1 className="text-4xl md:text-6xl text-white font-heading uppercase tracking-tighter mb-4">
              Terms & <span className="text-primary">Conditions</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-white">Terms & Conditions</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sticky Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-32 space-y-2">
              <h3 className="text-gray-400 text-[10px] tracking-[0.2em] uppercase mb-6 pl-4">Categories</h3>
              {termsData.map((category) => (
                <button
                  key={category.title}
                  onClick={() => scrollToCategory(category.title)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 border outline-none focus:outline-none ${activeTab === category.title
                    ? 'bg-primary text-black border-primary shadow-glow font-bold'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                >
                  <span className={`${activeTab === category.title ? 'text-black' : 'text-primary'}`}>
                    {getCategoryIcon(category.title)}
                  </span>
                  <span className="text-sm tracking-tight">{category.title}</span>
                </button>
              ))}

              <div className="mt-12 p-6 rounded-[2rem] bg-custom-black text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
                <Landmark className="text-primary mb-4" size={32} />
                <h4 className="text-sm font-heading mb-2">Need Clarification?</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">If you have any questions regarding our B2B terms, please contact our support team.</p>
                <button className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  Contact Support <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </aside>

          {/* Terms Content */}
          <div className="flex-1 space-y-20">
            {termsData.map((category) => (
              <div
                key={category.title}
                data-title={category.title}
                className="term-category-section space-y-8 scroll-mt-32"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                    {getCategoryIcon(category.title)}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading uppercase tracking-tight text-gray-900">
                    {category.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {category.sections.map((section, secIdx) => (
                    <motion.div
                      key={section.id}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true, margin: "-100px" }}
                      variants={fadeInUpVariants}
                      transition={{ delay: secIdx * 0.1 }}
                      className="group bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-premium transition-all duration-500 hover:border-primary/30"
                    >
                      <div className="flex items-start gap-4 md:gap-6">
                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-500">
                          {section.number}
                        </span>
                        <div className="space-y-3">
                          <h4 className="text-lg font-heading text-gray-900 group-hover:text-primary transition-colors duration-300 uppercase tracking-tight">
                            {section.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                            {section.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;

