import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { testimonials } from './constant';
import QuoteIcon from '@/assets/icons/doubtQoutes.svg';
import arrowLeft from '@/assets/icons/leftarrow.svg'
import arrowRight from '@/assets/icons/rightarrow.svg'

export default function Testimonials() {
    return (
        <div className='bg-custom-black py-16 relative  border-b-4 border-primary'>
            <div className='main__container_space'>
                <section className="h-[8%] w-full relative">
                    <div className="max-w-7xl mx-auto px-4 relative">
                        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">
                            Our Testimonials
                        </h2>

                        {/* Container for Swiper content only */}
                        <div className="w-full p-3 sm:p-16 xl:p-0 mt-20 ">
                            <Swiper
                                modules={[Navigation, Pagination, Autoplay]}
                                spaceBetween={30}
                                slidesPerView={1}
                                breakpoints={{
                                    640: { slidesPerView: 1 },
                                    768: { slidesPerView: 2 },
                                    1024: { slidesPerView: 2 },
                                    1440: { slidesPerView: 3 },
                                }}
                                loop={true}
                                autoplay={{ delay: 2000, disableOnInteraction: false }}
                                pagination={{
                                    clickable: true,
                                    el: '.custom-pagination',
                                }}
                                navigation={{
                                    nextEl: ".outer-next",
                                    prevEl: ".outer-prev",
                                }}
                                className="pb-12 testimonial-swiper-wrapper"
                            >
                                {testimonials.map((testimonial) => (
                                    <SwiperSlide key={testimonial.id}>
                                        <div className="bg-white rounded-2xl shadow-lg p-6 h-[400px] md:h-[400px] flex flex-col">
                                            <div className='items-end justify-end flex'>
                                                <img className=' w-7 h-7 ' src={QuoteIcon.src} alt='quote-icon' />
                                            </div>
                                            <div className="flex items-center justify-between gap-4 mb-4 mt-4">
                                                <div className='flex gap-3 items-center'>
                                                    <img
                                                        src={testimonial.avatar}
                                                        alt={testimonial.name}
                                                        className="w-16 h-16 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                                                        <div className="flex gap-1 text-primary text-2xl">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`${testimonial.rating > i ? "text-primary" : "text-[#D9D9D9]"}`}>★</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-[#666666] pl-3 text-[17px] font-light leading-relaxed flex-grow">
                                                {testimonial.text}
                                            </p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Pagination Dots */}
                            <div className="custom-pagination testimonial_pagination mt-6 flex justify-center gap-2 mt-15"></div>
                        </div>
                        <button
                            className="outer-prev absolute left-10 xl:-left-10 -ml-4 top-1/2 -translate-y-1/2 z-[100] cursor-pointer hidden sm:block"
                            aria-label="Previous Testimonial"
                        >
                            <img src={arrowLeft.src} alt="Previous" className="w-10 h-10 block" />
                        </button>

                        <button
                            className="outer-next absolute right-10 xl:-right-10 -mr-4 top-1/2 -translate-y-1/2 cursor-pointer z-[100] hidden sm:block"
                            aria-label="Next Testimonial"
                        >
                            <img src={arrowRight.src} alt="Next" className="w-10 h-10 block" />
                        </button>

                        <button
                            className="outer-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-3 shadow-md z-[100] sm:hidden"
                            aria-label="Previous Testimonial"
                        >
                            <img src={arrowLeft.src} alt="Previous" className="w-6 h-6 block" />
                        </button>

                        <button
                            className="outer-next absolute right-2 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-3 shadow-md z-[100] sm:hidden"
                            aria-label="Next Testimonial"
                        >
                            <img src={arrowRight.src} alt="Next" className="w-6 h-6 block" />
                        </button>

                    </div>
                </section>
            </div>
        </div>
    );
}