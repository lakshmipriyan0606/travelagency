import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Sun } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { formatItineraryExpandData } from "./constant";

export default function ItineraryDay({ currentPackage }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, number>>({});

  const scheduleRefs = useRef<Record<string, HTMLDivElement>>({});
  const containerRefs = useRef<Record<number, HTMLDivElement>>({});

  const daysListData = formatItineraryExpandData(currentPackage?.days || []);

  const toggleExpand = (id: number) => {
    setExpandedDay((prev) => (prev === id ? null : id));
  };

  /**
   * -------------------------------
   *  DYNAMIC ICON POSITION CALCULATOR
   * -------------------------------
   */
  useEffect(() => {
    if (expandedDay === null) {
      setIconPositions({});
      return;
    }

    const updatePositions = () => {
      const positions: Record<string, number> = {};
      const container = containerRefs.current[expandedDay];
      const day = daysListData.find((d) => d.id === expandedDay);

      if (!container || !day) return;

      day.schedule.forEach((_slot, index) => {
        const key = `${expandedDay}-${index}`;
        const el = scheduleRefs.current[key];

        if (el) {
          const containerRect = container.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();

          // Place icon exactly in middle of slot
          positions[key] = elRect.top - containerRect.top + elRect.height / 2;
        }
      });

      setIconPositions(positions);
    };

    // Recalculate after expansion animation
    const timer = setTimeout(updatePositions, 350);

    // Recalculate when images inside this day load
    const images =
      containerRefs.current[expandedDay]?.querySelectorAll("img") || [];

    images.forEach((img: HTMLImageElement) => {
      img.onload = updatePositions;
    });

    // Recalculate on resize
    window.addEventListener("resize", updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositions);
    };
  }, [expandedDay, daysListData]);

  /**
   * Time-based icon 
   */
  const getSunIcon = (time: string) => {
    const t = time.toLowerCase();
    return <Sun className="w-4 h-4 text-gray-700" />;
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {daysListData.map((day) => (
        <div
          key={day.id}
          ref={(el) => el && (containerRefs.current[day.id] = el)}
          className="relative mb-12"
        >
          <div className="relative flex items-stretch">
            {/* LEFT TIMELINE */}
            <div
              className={`flex-shrink-0 w-16 relative bg-[#FFF3DB] overflow-hidden ${expandedDay !== day.id ? "rounded-tl-lg rounded-bl-lg" : ""
              }`}
            >
              {/* Vertical Line */}
              {expandedDay === day.id && (
                <div
                  className="absolute left-6 top-0 w-0.5 bg-gray-300 mt-16"
                  style={{ height: "100%" }}
                />
              )}

              {/* DAY LABEL */}
              <div className="absolute left-2 top-0 p-1 flex flex-col items-center z-10">
                <span className="font-medium text-gray-600 mb-1">Day</span>
                <div className="text-[18px] font-roboto">{day.id}</div>
              </div>

              {/* ICONS — positioned dynamically */}
              {expandedDay === day.id &&
                day.schedule.map((slot, index) => {
                  const key = `${day.id}-${index}`;
                  const top = iconPositions[key] ?? 0;

                  return (
                    <div
                      key={index}
                      className="absolute left-[12px] z-10"
                      style={{
                        top: `${top}px`,
                        transition: "top 0.25s ease-out",
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                        {getSunIcon(slot.time)}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1">
              <div
                className={`shadow-sm overflow-hidden border-none ${expandedDay !== day.id
                    ? "rounded-tr-xl rounded-br-xl"
                    : ""
                }`}
              >
                {/* HEADER */}
                <div
                  className="flex justify-between items-center p-4 cursor-pointer bg-white hover:bg-gray-50"
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

                {/* EXPAND PANEL */}
                <AnimatePresence>
                  {expandedDay === day.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <CardContent className="bg-white p-6 space-y-6">
                        {/* Description */}
                        <p className="text-sm text-gray-700 break-words sm:max-w-sm md:max-w-md">
                          {day.description}
                        </p>


                        {/* Schedule */}
                        <div className="space-y-6">
                          {day.schedule.map((slot, index) => {
                            const key = `${day.id}-${index}`;

                            return (
                              <div
                                key={index}
                                ref={(el) =>
                                  el && (scheduleRefs.current[key] = el)
                                }
                                className="flex items-start gap-4"
                              >
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-base font-semibold text-gray-800">
                                    {slot.time}
                                  </h3>

                                  <img
                                    src={slot.image}
                                    className="h-[180px] w-full rounded-lg object-cover"
                                  />

                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {slot.detail ||
                                      "Pride in offering reliable guided adventure tours."}
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
