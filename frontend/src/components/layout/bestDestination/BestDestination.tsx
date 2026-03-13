import { bestPackageList } from "./constant";
import badgeBackground from "@/assets/icons/badgeBackground.svg";
import { useNavigate } from "react-router-dom";

export function BestDestination() {
    const navigate = useNavigate();

    const handleColSpan = (index: number) => {
        const map: Record<number, string> = {
            0: "col-span-12 sm:col-span-4",
            1: "col-span-6 sm:col-span-8",
            2: "col-span-6 sm:col-span-8",
            3: "col-span-12 sm:col-span-4",
        };
        return map[index] ?? "col-span-6";
    };

    return (
        <section className="main__container_space">
            <div className='main__container_space_nextContainer'>
                <h2 className="text-2xl md:text-3xl lg:text-5xl mb-10 leading-tight">
                    Popular <span className="text-yellow-400">Destinations</span>
                </h2>

                <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
                    {bestPackageList.map(({ src, alt, title, fallbackSrc }, index) => {
                        const aspect =
                            index === 0 || index === 3 ? "sm:aspect-[1/1]" : "sm:aspect-[2/1]";
                        return (
                            <div
                                key={index}
                                onClick={() => navigate(`/allpackage?city=${encodeURIComponent(title)}`)}
                                className={`
                            ${handleColSpan(index)}
                            rounded-[15px] relative overflow-hidden group 
                            cursor-pointer ${aspect}
                        `}
                            >
                                <img
                                    src={src}
                                    alt={alt}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const img = e.currentTarget as HTMLImageElement;
                                        if (fallbackSrc && img.src !== fallbackSrc) {
                                            img.src = fallbackSrc;
                                        } else {
                                            img.src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop";
                                        }
                                    }}
                                />

                                {/* From center → left */}
                                <span
                                    className="
                                absolute bottom-0 left-1/2 h-[4px] w-1/2
                                bg-yellow-400 z-20
                                origin-right scale-x-0
                                transition-all duration-700 ease-in-out
                                group-hover:scale-x-100
                            "
                                />

                                {/* From center → right */}
                                <span
                                    className="
                                absolute bottom-0 right-1/2 h-[4px] w-1/2
                                bg-yellow-400 z-20
                                origin-left scale-x-0
                                transition-all duration-700 ease-in-out
                                group-hover:scale-x-100
                            "
                                />

                                <div
                                    className="
                                absolute inset-0 bg-black/30 flex items-center justify-center p-4 
                                opacity-0 group-hover:opacity-100 
                                transition-all duration-500
                            "
                                >
                                    <div className="relative transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-center">
                                        <div className="relative">
                                            <img
                                                src={badgeBackground}
                                                alt="badge"
                                                className="w-[160px] sm:w-[200px] h-auto object-contain"
                                            />
                                            <h3 className="absolute inset-0 flex items-center pl-4 justify-center text-white font-arizonia text-xl sm:text-xl mt-1 drop-shadow-md">
                                                {title.split(' ').slice(0, 2).join(' ')}
                                            </h3>
                                        </div>
                                        {title.split(' ').length > 2 && (
                                            <h3 className="text-white font-arizonia text-lg sm:text-2xl mt-[-10px] drop-shadow-md">
                                                {title.split(' ').slice(2).join(' ')}
                                            </h3>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
