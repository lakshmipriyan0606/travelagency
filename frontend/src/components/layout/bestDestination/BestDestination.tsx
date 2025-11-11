import { bestPackageList } from "./constant";

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
        <section className="bg-custom-black py-12 px-4 md:px-8 lg:px-16 min-h-screen">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-10 leading-tight">
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
                        <img src={src} alt={alt} className="w-full h-48 sm:h-60 object-cover" />

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
                                absolute inset-0 bg-black/50 flex items-center justify-center p-4 
                                opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 
                                transition-all duration-700 z-30
                            "
                        >
                            <h3 className="text-xl sm:text-2xl text-center text-white font-arizonia">
                                {title}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
