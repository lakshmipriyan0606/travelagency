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
        <section className="bg-custom-black py-16 relative  border-b-4 border-primary">
            <div className="max-w-7xl mx-auto px-4 relative"> 
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">
                    Our Testimonials
                </h2>

                {/* Container for Swiper content only */}
                <div className="w-full p-3 sm:p-16 xl:p-0 ">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
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
                                <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className='flex gap-3 items-center'>
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                                                <div className="flex gap-1 text-yellow-500">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <span key={i} className="text-primary">★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <img className='relative bottom-5' src={QuoteIcon} alt='quote-icon' />
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                                        {testimonial.text}
                                    </p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Pagination Dots */}
                    <div className="custom-pagination mt-6 flex justify-center gap-2 pb-9"></div>
                </div>
                <button
                    className="outer-prev absolute left-10 xl:-left-10 -ml-4 top-1/2 -translate-y-1/2 z-[100] cursor-pointer hidden sm:block"
                    aria-label="Previous Testimonial"
                >
                    <img src={arrowLeft} alt="Previous" className="w-10 h-10 block" />
                </button>

                <button
                    className="outer-next absolute right-10 xl:-right-10 -mr-4 top-1/2 -translate-y-1/2 cursor-pointer z-[100] hidden sm:block"
                    aria-label="Next Testimonial"
                >
                    <img src={arrowRight} alt="Next" className="w-10 h-10 block" />
                </button>

                <button
                    className="outer-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-3 shadow-md z-[100] sm:hidden"
                    aria-label="Previous Testimonial"
                >
                    <img src={arrowLeft} alt="Previous" className="w-6 h-6 block" />
                </button>

                <button
                    className="outer-next absolute right-2 top-1/2 -translate-y-1/2 bg-white cursor-pointer rounded-full p-3 shadow-md z-[100] sm:hidden"
                    aria-label="Next Testimonial"
                >
                    <img src={arrowRight} alt="Next" className="w-6 h-6 block" />
                </button>

            </div>
        </section>
    );
}