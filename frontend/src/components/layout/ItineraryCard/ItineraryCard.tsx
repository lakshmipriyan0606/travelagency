import { cn } from "@/lib/utils";
import { handleDayListFormat } from "./constant";

const ItineraryCard = ({ currentPackage }) => {
  const cardWrapper = "max-w-4xl mx-auto p-4 font-sans flex flex-col gap-[9px]";
  const cardContainer = "border border-[#909090] rounded-lg overflow-hidden bg-white shadow-sm";
  const cardHeader = "border-b border-[#909090] bg-[#FFF3DB] px-4 py-3";
  const sideBar = "w-16 shrink-0 border-r border-[#909090] bg-gray-50 flex flex-col items-center justify-center p-2 text-sm font-medium text-gray-600";
    const descClass = "text-sm text-gray-600 mt-1 leading-snug break-words break-all";

  const daysListData = handleDayListFormat(currentPackage?.days || []);

  return (
    <div className={cardWrapper}>
      {daysListData.map((dayData, index) => {
        if (dayData.interval) {
          return (
            <div key={index} className="flex justify-center -my-2 relative z-0">
              <div
                 className="h-28 w-[100%] bg-no-repeat bg-contain bg-center bg-flip-vertical"
                style={{ backgroundImage: `url(${dayData?.backgroundImage})` }}
              ></div>
            </div>
          );
        }

        return (
          <div key={index} className={cardContainer}>
            <div className={cardHeader}>
              <h2 className="text-lg font-bold text-gray-800">
                {dayData?.day?.title}
              </h2>
            </div>

            <div className="flex">
              <div className={sideBar}>
                <span className="text-center">{dayData?.day?.duration}</span>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row">
                {dayData.day?.timeSlots.map((slot, slotIndex) => {
                  if (slot?.onlyDuration) return null;

                  return (
                    <div
                      key={slotIndex}
                      className={cn(
                        "flex-1 min-w-0 flex flex-row items-start gap-3 p-4",
                        "border-b border-[#909090] sm:border-b-0 sm:border-r", 
                        "last:border-0" 
                      )}
                    >
                      <img
                        src={slot?.icon}
                        alt=""
                        className="rounded-full w-12 h-12 object-cover shrink-0 border border-gray-200"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                          {slot.time}
                        </p>
                        <p className={`${descClass} line-clamp-3`}>
                          {slot.description || "No description available."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItineraryCard;