import { useState, useRef, useMemo } from "react";
import { ChevronDown, ChevronUp, Sun } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { formatItineraryExpandData } from "./constant";

// ✅ Types
interface ScheduleSlot {
  time: string;
  image: string;
  detail?: string;
}

interface DayData {
  id: number;
  title: string;
  description: string;
  schedule: ScheduleSlot[];
}

interface ItineraryDayProps {
  currentPackage?: {
    days?: any[];
  };
}

export default function ItineraryDay({ currentPackage }: ItineraryDayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [iconPositions, setIconPositions] = useState<Record<string, number>>({});

  const scheduleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const daysListData: DayData[] = formatItineraryExpandData(
    currentPackage?.days || []
  );

  const toggleExpand = (id: number) => {
    setExpandedDay((prev) => (prev === id ? null : id));
  };

  /**
   * -------------------------------
   *  DYNAMIC ICON POSITION CALCULATOR
   * -------------------------------
   */
  useMemo(() => {
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

          positions[key] =
            elRect.top - containerRect.top + elRect.height / 2;
        }
      });

      setIconPositions(positions);
    };

    const timer = setTimeout(updatePositions, 350);

    const images =
      containerRefs.current[expandedDay]?.querySelectorAll("img") || [];

    images.forEach((img) => {
      img.onload = updatePositions;
    });

    window.addEventListener("resize", updatePositions);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositions);
    };
  }, [expandedDay, JSON.stringify(daysListData)]);

  /**
   * Time-based icon
   */
  const getSunIcon = () => {
    // const t = time.toLowerCase();
    return <Sun className="w-4 h-4 text-gray-700" />;
  };

  return (
    <div className="py-10 px-4">
      {daysListData.map((day) => (
        <div
          key={day.id}
          ref={(el: HTMLDivElement | null) => {
            containerRefs.current[day.id] = el;
          }}
          className="relative mb-12"
        >
          <div className="relative flex items-stretch">
            {/* LEFT TIMELINE */}
            <div
              className={`flex-shrink-0 w-16 relative bg-[#FFF3DB] overflow-hidden ${expandedDay !== day.id
                ? "rounded-tl-lg rounded-bl-lg"
                : ""
                }`}
            >
              {expandedDay === day.id && (
                <div
                  className="absolute left-6 top-0 w-0.5 bg-gray-300 mt-16"
                  style={{ height: "100%" }}
                />
              )}

              <div className="absolute left-2 top-0 p-1 flex flex-col items-center z-10">
                <span className="font-medium text-gray-600 mb-1">Day</span>
                <div className="text-[18px]">{day.id}</div>
              </div>

              {expandedDay === day.id &&
                day.schedule.map((_, index) => {
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
                        {getSunIcon()}
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

                <AnimatePresence>
                  {expandedDay === day.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <CardContent className="bg-white p-6 space-y-6">
                        <p className="text-sm text-gray-700 break-words leading-relaxed">
                          {day.description}
                        </p>

                        <div className="space-y-6">
                          {day.schedule.map((slot, index) => {
                            const key = `${day.id}-${index}`;

                            return (
                              <div
                                key={index}
                                ref={(el: HTMLDivElement | null) => {
                                  scheduleRefs.current[key] = el;
                                }}
                                className="flex items-start gap-4"
                              >
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-base font-semibold text-gray-800">
                                    {slot.time}
                                  </h3>

                                  <img
                                    src={slot.image}
                                    className="h-[180px] sm:h-[350px] w-full rounded-lg object-cover"
                                    alt="schedule"
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