import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { formatItineraryExpandData, itinerariesExpandCardDetails } from "./constant";

export default function ItineraryDay({ currentPackage }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, number>>({});
  const scheduleRefs = useRef<Record<string, HTMLDivElement>>({});
  const containerRefs = useRef<Record<number, HTMLDivElement>>({});

  const toggleExpand = (id: number) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  // Update icon positions when day expands
  useEffect(() => {
    if (expandedDay !== null) {
      // Wait for animation and DOM update
      const timer = setTimeout(() => {
        const positions: Record<string, number> = {};
        const day = itinerariesExpandCardDetails.find((d) => d.id === expandedDay);
        const container = containerRefs.current[expandedDay];

        if (day && container) {
          day.schedule.forEach((_slot: any, index: number) => {
            const key = `${expandedDay}-${index}`;
            const scheduleElement = scheduleRefs.current[key];
            if (scheduleElement) {
              const containerRect = container.getBoundingClientRect();
              const scheduleRect = scheduleElement.getBoundingClientRect();
              // Calculate position relative to container top, centered on schedule item
              positions[key] = scheduleRect.top - containerRect.top + (scheduleRect.height / 2) - 120;
            }
          });
          setIconPositions(positions);
        }
      }, 400); // Wait for animation
      return () => clearTimeout(timer);
    } else {
      setIconPositions({});
    }
  }, [expandedDay]);

  // Get sun icon based on time slot
  const getSunIcon = (time: string) => {
    const timeLower = time.toLowerCase();
    if (timeLower.includes("morning")) {
      return <Sun className="w-4 h-4 text-gray-700" />;
    } else if (timeLower.includes("noon") || timeLower.includes("afternoon")) {
      return <Sun className="w-5 h-5 text-gray-700" />;
    } else if (timeLower.includes("evening") || timeLower.includes("night")) {
      return <Sun className="w-4 h-4 text-gray-700" />;
    }
    return <Sun className="w-4 h-4 text-gray-700" />;
  };


  const daysListData = formatItineraryExpandData(currentPackage?.days || [])
  console.log('daysListData: ', daysListData);


  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {daysListData.map((day) => (
        <div
          key={day.id}
          className="relative mb-12"
          ref={(el) => {
            if (el) containerRefs.current[day.id] = el;
          }}
        >
          {/* Timeline Container */}
          <div className="relative flex items-stretch">
            {/* Left Timeline Column */}
            <div className={`flex-shrink-0 w-16 relative bg-[#FFF3DB] overflow-hidden ${expandedDay !== day.id
              ? "rounded-tl-lg rounded-bl-lg"
              : ""}`}>
              {/* Timeline Bar - extends based on content */}
              <div
                className={`absolute left-6 top-0 w-0.5 transition-all duration-300 mt-16 ${expandedDay === day.id ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                style={{
                  height: expandedDay === day.id && day.schedule.length > 0
                    ? '100%'
                    : ''
                }}
              />

              {/* Day Label at Top */}
              <div className={"absolute left-2  p-1 top-0 flex flex-col items-center z-10"}>
                <span className="font-medium text-gray-600 mb-1">Day</span>
                <div
                  className={` font-roboto text-custom-black transition-all text-[18px] duration-300 ${expandedDay === day.id
                    ? "rounded-tl-lg rounded-bl-lg"
                    : ""
                    }`}
                >
                  {day.id}
                </div>
              </div>

              {/* Schedule Icons on Timeline - positioned dynamically */}
              {/* {expandedDay === day.id && day.schedule.length > 0 && (
                <>
                  {day.schedule.map((slot: any, index: number) => {
                    const key = `${day.id}-${index}`;
                    const position = iconPositions[key];

                    // Fallback calculation if position not yet available
                    const headerHeight = 60;
                    const descriptionHeight = 120;
                    const imageHeight = 280;
                    const padding = 48;
                    const itemHeight = 60;
                    const itemSpacing = 24;
                    const baseOffset = headerHeight + descriptionHeight + imageHeight + padding + 24;
                    const fallbackPosition = baseOffset + (index * (itemHeight + itemSpacing)) + (itemHeight / 2);

                    return (
                      <div
                        key={index}
                        className="absolute left-0 flex items-center justify-center z-10"
                        style={{
                          top: position !== undefined ? `${position}px` : `${fallbackPosition}px`,
                          transition: position !== undefined ? 'top 0.2s ease-out' : 'none',
                          left: '12px'
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                          {getSunIcon(slot.time)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )} */}
            </div>

            {/* Right Content Column */}
            <div className="flex-1">
              <div className={`shadow-sm overflow-hidden rounded-0 border-none py-0 gap-0  ${expandedDay !== day.id
                ? "rounded-tr-xl rounded-br-xl rounded-tl-0 rounded-bl-0 "
                : ""}`}>
                {/* Header */}
                <div
                  className="flex justify-between items-center p-[14px] cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(day.id)}
                >
                  <h2 className="text-lg font-semibold text-gray-800">
                    {day.title}
                  </h2>
                  {expandedDay === day.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedDay === day.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <CardContent className="bg-white p-6 space-y-2">
                        {/* Description */}
                        <div className="space-y-3">
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {day.description}
                          </p>
                        </div>
                        {/* Schedule Items */}
                        <div className="space-y-6">
                          {day.schedule.map((slot: any, index: number) => {
                            const key = `${day.id}-${index}`;
                            return (
                              <div
                                key={index}
                                ref={(el) => {
                                  if (el) scheduleRefs.current[key] = el;
                                }}
                                id={`schedule-${day.id}-${index}`}
                                className="relative flex items-start gap-4"
                              >
                                {/* Schedule Content */}
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-base font-semibold text-gray-800">
                                    {slot.time}
                                  </h3>
                                  <img src={slot.image} alt="" className="h-[180px] rounded-lg w-full" />
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {slot.detail || "Pride in offering reliable services & guided tours to adventure activities."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
