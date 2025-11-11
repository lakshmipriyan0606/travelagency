import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { itinerariesExpandCardDetails } from "./constant";

export default function ItineraryDay() {
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleExpand = (id:any) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="relative ml-6">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300" />

        {itinerariesExpandCardDetails.map((day) => (
          <div key={day.id} className="relative mb-8 pl-8">
            <div
              className={`absolute -left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-md transition-all duration-300 font-roboto ${
                expandedDay === day.id
                  ? "bg-yellow-500 scale-110"
                  : "bg-yellow-400"
              }`}
            >
              {day.id}
            </div>

            <Card className="shadow-lg rounded-2xl overflow-hidden border-none p-0">
              <div
                className="flex justify-between items-center p-3 cursor-pointer bg-white hover:bg-gray-50"
                onClick={() => toggleExpand(day.id)}
              >
                <h2 className="font-semibold    ">{day.title}</h2>
                {expandedDay === day.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>

              <AnimatePresence>
                {expandedDay === day.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <CardContent className="space-y-6 bg-white">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {day.description}
                      </p>

                      {day.schedule.map((slot:any, index) => (
                        <div
                          key={index}
                          className="relative flex gap-4 pl-4 border-l border-gray-200"
                        >
                          {/* Left column with icon inside line */}
                          <div className="absolute -left-5 top-1 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-yellow-50 border border-yellow-300 flex items-center justify-center">
                              {slot.icon}
                            </div>
                            {index !== day.schedule.length - 1 && (
                              <div className="w-px bg-yellow-200 flex-1 mt-2" />
                            )}
                          </div>

                          {/* Right content */}
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold text-gray-800">
                              {slot.time}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.detail}
                            </p>
                            <img
                              src={slot.image}
                              alt={`${day.title} ${slot.time}`}
                              className="rounded-xl w-full object-cover h-48"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
