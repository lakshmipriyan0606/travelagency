import badgeBackground from "@/assets/icons/badgeBackground.svg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDestinations } from "@/api/admin/destination.api";

const FALLBACK_DESTINATIONS = [
  {
    _id: "fb-1",
    title: "Langkawi Island",
    location: "langkawi",
    url: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289720/uploads/dujsljvtrzon8ulsktjj.jpg",
  },
  {
    _id: "fb-2",
    title: "Penang",
    location: "penang",
    url: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289674/uploads/orx7bvfhmyn0fkkf4fvw.jpg",
  },
  {
    _id: "fb-3",
    title: "Genting Highland",
    location: "genting",
    url: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289736/uploads/caiv3y1zu3xcxhale8ko.jpg",
  },
  {
    _id: "fb-4",
    title: "Kuala Lumpur",
    location: "kuala-lumpur",
    url: "https://res.cloudinary.com/dizocitqw/image/upload/v1773289703/uploads/koeqcpz78twzsg1qplfm.jpg",
  },
];

const DestinationSkeleton = () => (
// ... (rest of skeleton)
    <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
        {[0, 1, 2, 3].map((i) => {
            const aspect = i === 0 || i === 3 ? "aspect-[1/1]" : "aspect-[2/1]";
            const colSpan = i === 0 || i === 3 ? "col-span-12 sm:col-span-4" : "col-span-6 sm:col-span-8";
            return (
                <div 
                    key={i} 
                    className={`${colSpan} ${aspect} bg-neutral-100 rounded-[32px] animate-pulse overflow-hidden relative`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            );
        })}
    </div>
);

export function BestDestination() {
    const { data: apiDestinations = [], isLoading, isError, isFetching } = useQuery({
        queryKey: ["adminDestinations"],
        queryFn: getDestinations,
        retry: 4, // Retry 4 times as requested
        retryDelay: 2000,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleColSpan = (index: number) => {
        const map: Record<number, string> = {
            0: "col-span-12 sm:col-span-4",
            1: "col-span-6 sm:col-span-8",
            2: "col-span-6 sm:col-span-8",
            3: "col-span-12 sm:col-span-4",
        };
        return map[index] ?? "col-span-6";
    };

    // Show skeleton during the first load or while fetching/retrying
    if (isLoading || (isFetching && apiDestinations.length === 0)) {
        return (
            <section className="main__container_space">
                <h2 className="text-2xl md:text-3xl lg:text-5xl mb-10 leading-tight flex items-center gap-4">
                    Popular <span className="text-yellow-400">Destinations</span>
                </h2>
                <DestinationSkeleton />
            </section>
        );
    }

    // Use API data if available, otherwise fallback to default data (if error or empty)
    const finalData = (apiDestinations.length > 0 && !isError) ? apiDestinations : FALLBACK_DESTINATIONS;

    return (
        <section className="main__container_space">
            <div>
                <h2 className="text-2xl md:text-3xl lg:text-5xl mb-10 leading-tight flex items-center gap-4">
                    Popular <span className="text-yellow-400">Destinations</span>
                </h2>

                <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
                    {finalData.map((dest: any, index: number) => {
                        const aspect =
                            index === 0 || index === 3 ? "sm:aspect-[1/1]" : "sm:aspect-[2/1]";
                        return (
                            <Link
                                key={dest._id}
                                to={`/allpackage?city=${encodeURIComponent(dest.location || dest.title)}`}
                                className={`
                                    ${handleColSpan(index)}
                                    rounded-[32px] relative overflow-hidden group 
                                    cursor-pointer ${aspect}
                                    block shadow-lg shadow-neutral-200/20 border border-neutral-100
                                `}
                            >
                                <img
                                    src={dest.url}
                                    alt={dest.alt || dest.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        const img = e.currentTarget as HTMLImageElement;
                                        img.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop";
                                    }}
                                />

                                {/* Interactive Borders */}
                                <span className="absolute bottom-0 left-1/2 h-[4px] w-1/2 bg-yellow-400 z-20 origin-right scale-x-0 transition-transform duration-700 ease-in-out group-hover:scale-x-100" />
                                <span className="absolute bottom-0 right-1/2 h-[4px] w-1/2 bg-yellow-400 z-20 origin-left scale-x-0 transition-transform duration-700 ease-in-out group-hover:scale-x-100" />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="relative transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center">
                                        <div className="relative">
                                            <img
                                                src={badgeBackground}
                                                alt="badge"
                                                className="w-[160px] sm:w-[200px] h-auto object-contain drop-shadow-2xl"
                                            />
                                            <h3 className="absolute inset-0 flex items-center pl-4 justify-center text-white font-arizonia text-xl sm:text-2xl mt-1 drop-shadow-md">
                                                {dest.title.split(' ').slice(0, 2).join(' ')}
                                            </h3>
                                        </div>
                                        {dest.title.split(' ').length > 2 && (
                                            <h3 className="text-white font-arizonia text-lg sm:text-2xl mt-[-10px] drop-shadow-md">
                                                {dest.title.split(' ').slice(2).join(' ')}
                                            </h3>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
