import { TRUST_BADGES } from "./constant";

const TrustBadges = () => {
  return (
    <section className="relative z-30 -mt-10 md:-mt-31 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-custom-black rounded-xl md:rounded-[20px] py-3 md:py-6 px-4 md:px-16 flex justify-between md:justify-between items-center gap-x-1 md:gap-x-6 gap-y-4 shadow-xl relative overflow-hidden group">

          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-1 md:gap-3 transition-all duration-300 hover:scale-110"
            >
              <div className="flex-shrink-0">
                <img src={badge.icon} alt={badge.text} className="w-8 h-8 md:w-8 md:h-8" />
              </div>
              <span className="hidden md:block text-white text-xs lg:text-sm tracking-wide">
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
