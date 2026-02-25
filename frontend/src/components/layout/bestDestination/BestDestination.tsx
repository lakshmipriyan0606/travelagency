import { bestPackageList } from "./constant";
import badgeBackground from "@/assets/icons/badgeBackground.svg";

export function BestDestination() {
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
        <section className="bg-custom-black main__container_space border-b-4 border-primary">
            <div className='main__container_space_nextContainer'>
                <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white text-center mb-10 leading-tight">
                    Explore Our <span className="text-yellow-400">Best Packages</span> &amp; Be Amazed
                </h2>

                <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
                    {bestPackageList.map(({ src, alt, title }, index) => (
                        <div
                            key={index}
                            className={`
                            ${handleColSpan(index)}
                            rounded-[15px] relative overflow-hidden group
                            cursor-pointer
                        `}
                        >
                            <img src={src} alt={alt} className="w-full h-48 sm:h-64 lg:h-54 xl:h-64 2xl:h-[280px] object-cover" />

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
                                            className="w-[160px] sm:w-[200px] h-[500px] object-contain"
                                        />
                                        <h3 className="absolute inset-0 flex items-center justify-center text-white font-arizonia text-xl sm:text-3xl mt-1 drop-shadow-md">
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
                    ))}
                </div>
            </div>
        </section>
    );
}
