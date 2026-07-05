import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

const ComingSoon = () => {
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-custom-black">
            <Helmet>
                <title>B2B Portal - Coming Soon</title>
                <meta name="description" content="Our exclusive B2B portal for travel agencies is launching soon." />
            </Helmet>

            {/* Stunning Background Elements */}
            <div 
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}
            />
            
            {/* Main Content Container - Simpler, smaller box */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center mt-16">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 p-10 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden text-center"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold tracking-widest uppercase mb-6">
                        <Sparkles size={16} />
                        <span>Launching Soon</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
                        The Ultimate <br />
                        <span className="text-primary italic font-heading">B2B Portal</span>
                    </h1>

                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl mx-auto font-light mb-10">
                        We are crafting an exclusive platform for travel agencies with unbeatable deals, seamless bookings, and a vast global inventory. Stay tuned!
                    </p>

                    <Link 
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-black font-semibold rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_10px_25px_rgba(252,175,22,0.3)] hover:shadow-[0_15px_35px_rgba(252,175,22,0.4)] active:scale-95 uppercase tracking-wider text-sm mx-auto"
                    >
                        <ArrowLeft size={18} />
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default ComingSoon;
