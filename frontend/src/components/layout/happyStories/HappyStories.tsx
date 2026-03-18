import { CUSTOMER_IMAGES } from "./constant";

const HappyStories = () => {
  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/sastikaatravels/', '_blank');
  };

  // Duplicate images to create a seamless infinite loop
  const imagesRow1 = [...CUSTOMER_IMAGES, ...CUSTOMER_IMAGES, ...CUSTOMER_IMAGES];
  const imagesRow2 = [...CUSTOMER_IMAGES, ...CUSTOMER_IMAGES, ...CUSTOMER_IMAGES];

  return (
    <section className="py-20 bg-white overflow-hidden flex flex-col gap-12">
      {/* Top Row: Left to Right (Actually Right to Left motion) */}
      <div className="relative flex overflow-hidden group cursor-pointer">
        <div className="flex gap-6 pr-6 animate-marquee-left group-hover:[animation-play-state:paused]">
          {imagesRow1.map((src, idx) => (
            <div
              key={`row1-${idx}`}
              className="w-64 md:w-80 h-40 md:h-48 rounded-[24px] overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105"
            >
              <img
                src={src}
                alt="Customer Story"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section: Text and Button */}
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          <span className="text-[#5E4B8B]">Happy Customers,</span>{" "}
          <span className="text-[#D94E4E]">Happy Stories</span>
        </h2>
        <button
          onClick={handleInstagramClick}
          className="bg-[#FFAE00] text-white px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-orange-100 cursor-pointer"
        >
          View Instagram
        </button>
      </div>

      {/* Bottom Row: Right to Left (Actually Left to Right motion) */}
      <div className="relative flex overflow-hidden group cursor-pointer">
        <div className="flex gap-6 pr-6 animate-marquee-right group-hover:[animation-play-state:paused]">
          {imagesRow2.map((src, idx) => (
            <div
              key={`row2-${idx}`}
              className="w-64 md:w-80 h-40 md:h-48 rounded-[24px] overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105"
            >
              <img
                src={src}
                alt="Customer Story"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HappyStories;
