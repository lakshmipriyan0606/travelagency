"use client";
import Exclimation from '@/assets/icons/Exclimation.svg'



const Welcome = () => {
    return (
        <section>
            <div className='main__container_space'>
                <h1 className="main_title">Welcome to  <span className="text-primary">Sastikaa Travels!</span></h1>

                <p className="mt-6 text-[14px] sm:text-[16px] lg:text-lg text-justify leading-relaxed">
                    <span className="text-primary font-semibold">Sastikaa Travel Sdn Bhd</span> is a <span className="text-primary">trusted travel agency in Malaysia</span> based in Kuala Lumpur, offering reliable and personalized travel services for both direct travelers and global travel partners. As a professional <span className="text-primary">Destination Management Company (DMC)</span>, we specialize in creating smooth and memorable travel experiences across Malaysia with a strong focus on comfort, safety, and local expertise.
                </p>
                <p className="text-[14px] sm:text-[16px] lg:text-lg mt-4 text-justify leading-relaxed">
                    Known as a growing Indian travel agency in Malaysia, we help families, couples, honeymooners, and groups explore the country with confidence. From vibrant city tours in Kuala Lumpur to relaxing island holidays in Langkawi Island and scenic mountain trips to Genting Highland and Penang, our team carefully designs travel experiences that match every traveler’s preferences and budget.
                </p>
                <p className="text-[14px] sm:text-[16px] lg:text-lg mt-4 text-justify leading-relaxed">
                    As one of the reliable travel agencies in Kuala Lumpur Malaysia, Sastikaa Travel provides a complete range of services including private airport transfers, customized holiday packages, hotel bookings, guided sightseeing tours, and comfortable transport arrangements. Our professional drivers, experienced guides, and well-maintained vehicles ensure every journey is safe, punctual, and enjoyable.
                </p>
                <p className="text-[14px] sm:text-[16px] lg:text-lg mt-4 text-justify leading-relaxed">
                    For travel agents worldwide, we also offer dependable <span className="text-primary">B2B ground handling services in Malaysia</span>, including group tour coordination, airport meet-and-greet services, hotel arrangements, and 24/7 on-ground support. With transparent pricing, strong local partnerships, and dedicated service, Sastikaa Travel continues to build trust as a dependable travel agency in Malaysia for unforgettable journeys.
                </p>

                <section className='flex items-center gap-1 mb-20'>
                    <img src={Exclimation} className='w-8 h-8' alt="" />
                    <div className='relative flex-1 top-[70px] sm:top-[100px] border border-[#9C9C9C] rounded-[10px] text-center  text-3xl p-2 sm:text-5xl sm:p-5'>
                        <h1 className='font-accent '> Travel isn’t about the miles you cover, it’s about
                            memories you create.
                        </h1>
                        <p className='text-[16px] pt-2 sm:text-xl text-right sm:pt-5'>- Sastikaa Travels</p>
                    </div>
                </section>

            </div>
        </section>
    )
}

export default Welcome
