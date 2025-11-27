
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
        <section className="bg-custom-black py-16 relative">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-bold text-primary mb-12">
                    Our Testimonials
                </h2>

                <div className=" w-full p-3 sm:p-16 xl:p-0">
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
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        pagination={{
                            clickable: true,
                            el: '.custom-pagination',
                        }}
                        navigation={{
                            prevEl: '.swiper-button-prev',
                            nextEl: '.swiper-button-next',
                        }}
                        className="pb-12"
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
                                                <div className="flex gap-1">
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

                    <button
                        className="
                swiper-button-prev 
                absolute left-0 top-1/2
                z-10 
                bg-white sm:bg-transparent 
                rounded-full 
                shadow-md sm:shadow-none 
                p-2 
                transition
                "
                    >
                        <img src={arrowLeft} alt="prev" className="w-8 h-8 sm:w-[300px] sm:h-[300px]" />
                    </button>

                    <button
                        className="
                swiper-button-next 
                absolute right-0 top-1/2
                z-10 
                bg-white sm:bg-transparent 
                rounded-full 
                shadow-md sm:shadow-none 
                pl-4 pt-1
                transition
                "
                    >
                        <img src={arrowRight} alt="next" className="w-8 h-8 sm:w-[300px] sm:h-[300px]" />
                    </button>


                    <div className="custom-pagination mt-6 flex justify-center gap-2 pb-9"></div>
                </div>
            </div>
        </section>
    );
}
