import { cn } from "@/lib/utils";
import { handleDayListFormat,itinerariesCardDetails } from "./constant";
const ItineraryCard = ({currentPackage}) => {

  const cardWrapper = "max-w-4xl mx-auto p-4 font-sans flex flex-col";
  const cardContainer = "border-1 border-[#909090] rounded-lg overflow-hidden";
  const cardHeader = "border-b border-[#909090] bg-[#FFF3DB] px-4 py-3";
  const sideBar = "w-14 border-r  border-[#909090]  bg-gray-50 flex flex-col items-center justify-center p-1";
  const slotWrapper = "flex flex-row items-start gap-3 px-4 py-3 border-b border-[#909090] sm:border-b-0";
  const descClass = "text-sm text-gray-700";

  const daysListData = handleDayListFormat(currentPackage?.days || [])
  console.log('daysListData: ', daysListData);

  return (
    <div className={cardWrapper}>
      {daysListData.map((dayData, index) => {
        return dayData.interval ? (
          <div key={index} className="flex justify-center">
            <div
              className="h-28 w-[100%] bg-no-repeat bg-contain bg-center bg-flip-vertical"
              style={{ backgroundImage: `url(${dayData?.backgroundImage})` }}
            ></div>
          </div>
        ) : (
          <div key={index} className={cardContainer}>
            <div className={cardHeader}>
              <h2 className="text-lg font-semibold">{dayData?.day?.title}</h2>
            </div>

            <div className="flex">
              <div className={sideBar}>{dayData?.day?.duration}</div>

              <div className="flex-1 sm:flex">
                {dayData.day?.timeSlots.map((slot, index) => {
                  if (slot?.onlyDuration) return null;

                  return (
                    <div
                      key={index}
                      className={cn(
                        slotWrapper,
                        index !== dayData?.day?.timeSlots.length - 1 &&
                        "sm:border-r border-gray-200"
                      )}
                    >
                      <img src={slot?.icon} width={50} height={50} alt="" />
                      <div className="flex-1">
                        <p className={descClass}>{slot.time}</p>
                        <p className={descClass}>{slot.description}</p>
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
