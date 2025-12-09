
import { Phone, Mail } from 'lucide-react';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import BookingFomField from './BookingFomField';
import { WANumber } from '@/lib/utils';


export default function ReachUs() {

  const handleSendToWhatsApp = () => {
    const phoneNumber = WANumber

    const message = `Hi Sastika Travels I visited your website and would like to know more about your travel packages.Please share the details. Thank you!`;


    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="bg-[#F6F9FF] p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:px-6 lg:px-14  sm:p-8">

        {/* LEFT SECTION */}
        <div className="relative sm:p-10  flex flex-col  sm:p-24 gap-4 items-center">
          <img
            src="/images/india-map.png"
            alt=""
            className="absolute inset-0 opacity-10 object-contain pointer-events-none"
          />

          <h1 className=" text-4xl sm:text-6xl font-serif text-primary mb-6 relative z-10">
            Reach Us!
          </h1>

          <div className="flex items-center gap-4 relative z-10">
            <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12 cursor-pointer" onClick={() => handleSendToWhatsApp()} />
            <span className="font-medium text-gray-600">OR</span>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Phone className="text-white" />
            </div>
          </div>

          <p className="mt-6 text-lg text-gray-500 relative z-10 font-roboto">
            +91 9789569791
          </p>

          <div className="flex flex-col items-center gap-3 mt-10 relative z-10">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Mail className="text-white" />
            </div>
            <p className="text-gray-700 text-lg">info@SastikaTravels.com</p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="">
          <h2 className="text-2xl md:text-4xl font-serif text-center mb-6 ">
            Book Your Dream Vacation Today!
          </h2>

          <BookingFomField />

        </div>

      </div>
    </div>
  );
}
