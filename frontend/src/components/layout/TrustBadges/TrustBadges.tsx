import { TRUST_BADGES } from "./constant";

const TrustBadges = () => {
  return (
    <section className="relative z-20 pt-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-custom-black rounded-[20px] py-6 px-6 md:px-16 flex flex-wrap justify-center md:justify-between items-center gap-x-6 gap-y-6 shadow-xl relative overflow-hidden group">
          
          {/* Decorative side cutouts to match the image design */}
          <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />
          <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full" />

          {TRUST_BADGES.map((badge) => (
            <div 
              key={badge.id} 
              className="flex items-center gap-2 md:gap-3 transition-all duration-300 hover:scale-105"
            >
              <div className="flex-shrink-0">
                <img src={badge.icon} alt={badge.text} className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <span className="text-white text-[10px] md:text-xs lg:text-sm tracking-tight md:tracking-wide">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
