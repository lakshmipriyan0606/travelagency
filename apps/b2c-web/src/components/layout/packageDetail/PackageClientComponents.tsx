'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ItineraryCard from '@/components/layout/ItineraryCard/ItineraryCard';
import ItineraryExpandDay from '@/components/layout/ItineraryCard/ItineraryExpandCard';
import noDataImg from '@/assets/image/no-data-clean.png';

export const PackageTabs = ({ pkg }: { pkg: any }) => {
    const [activeTab, setActiveTab] = useState(1);

    const tabberConfig = [
        {
            id: 1,
            text: 'Itinerary',
            component: <ItineraryCard currentPackage={pkg} />
        },
        {
            id: 2,
            text: 'Day to Day',
            component: <ItineraryExpandDay currentPackage={pkg} />
        },
    ];

    return (
        <div className="w-full py-9">
            {/* ----------- TAB BUTTONS ----------- */}
            <div className="flex pb-2 font-semibold bg-gray-200 rounded-lg p-1 w-fit">
                {tabberConfig.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="relative px-4 py-2 cursor-pointer"
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="absolute inset-0 bg-primary rounded-md"
                            />
                        )}
                        <span className={`relative z-10 text-black`}>{tab.text}</span>
                    </button>
                ))}
            </div>
            <div className="mt-4">
                {tabberConfig.find((tab) => tab.id === activeTab)?.component}
            </div>
        </div>
    );
};

export const PackageNotFound = ({ isActivity }: { isActivity: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] px-8 text-center"
        >
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 relative"
            >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <img
                    src={noDataImg.src}
                    alt="No Data"
                    className="w-56 h-auto relative z-10 drop-shadow-xl"
                />
            </motion.div>

            <h2 className="text-3xl lg:text-4xl text-slate-900 mb-6 tracking-tight leading-tight">
                This {isActivity ? "activity" : "package"} is <span className="text-primary italic">no longer available.</span>
            </h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-lg font-medium opacity-90">
                Let's discover something even better for your next trip.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mt-3 w-full max-w-lg justify-center">
                <Link
                    href={isActivity ? "/activities" : "/allpackage"}
                    className="px-10 py-5 bg-primary text-black rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_15px_35_rgba(242,193,46,0.4)] active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap flex items-center justify-center"
                >
                    Explore All {isActivity ? "Activities" : "Packages"}
                </Link>
                <Link
                    href="/"
                    className="px-10 py-5 bg-white text-slate-800 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-extrawide text-sm whitespace-nowrap flex items-center justify-center"
                >
                    Back to Home
                </Link>
            </div>
        </motion.div>
    );
};
