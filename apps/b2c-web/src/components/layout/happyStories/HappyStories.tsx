"use client";
import { useQuery } from "@tanstack/react-query";
import { getStories } from "@/api/story.api";
import { Loader2 } from "lucide-react";

const HappyStories = () => {
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["publicStories"],
    queryFn: getStories,
  });

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/sastikaatravels/', '_blank');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Extract array if stories is wrapped in a response object
  const storiesArray = Array.isArray(stories) ? stories : (stories.data || []);

  // Filter into rows and create loopable arrays
  const row1Data = storiesArray.filter((s: any) => s.row === 1);
  const row2Data = storiesArray.filter((s: any) => s.row === 2);

  // If no stories, don't show the marquee part
  if (storiesArray.length === 0) return null;

  const imagesRow1 = [...row1Data, ...row1Data, ...row1Data];
  const imagesRow2 = [...row2Data, ...row2Data, ...row2Data];

  return (
    <section className="py-20 bg-white overflow-hidden flex flex-col gap-12">
      {/* Top Row: Left to Right */}
      {row1Data.length > 0 && (
        <div className="relative flex overflow-hidden group cursor-pointer">
          <div className="flex gap-6 pr-6 animate-marquee-left group-hover:[animation-play-state:paused]">
            {imagesRow1.map((story, idx) => (
              <div
                key={`row1-${idx}`}
                className="w-64 md:w-80 h-40 md:h-48 rounded-[24px] overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={story.url}
                  alt={story.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Section: Text and Button */}
      <div className="max-w-7xl mx-auto px-4 w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <h2 className="text-2xl md:text-4xl text-center tracking-tight">
          <span className="text-neutral-800">Happy Customers,</span>{" "}
          <span className="text-primary">Happy Stories</span>
        </h2>
        <button
          onClick={handleInstagramClick}
          className="bg-[#FFAE00] text-white px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-lg shadow-orange-100 cursor-pointer"
        >
          View Instagram
        </button>
      </div>

      {/* Bottom Row: Right to Left */}
      {row2Data.length > 0 && (
        <div className="relative flex overflow-hidden group cursor-pointer">
          <div className="flex gap-6 pr-6 animate-marquee-right group-hover:[animation-play-state:paused]">
            {imagesRow2.map((story, idx) => (
              <div
                key={`row2-${idx}`}
                className="w-64 md:w-80 h-40 md:h-48 rounded-[24px] overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={story.url}
                  alt={story.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HappyStories;
