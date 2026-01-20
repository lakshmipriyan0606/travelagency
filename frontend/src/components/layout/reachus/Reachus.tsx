
import { Phone, Mail } from 'lucide-react';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import MapIcon from '@/assets/icons/Map.svg';
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
    <div className="relative bg-[#F6F9FF] p-10 overflow-hidden">
      <img
        src={MapIcon}
        alt="Map background"
        className="absolute inset-0 opacity-40 object-cover pointer-events-none w-full h-full"
      />
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:px-6 lg:px-14  sm:p-8">
        {/* LEFT SECTION */}
        <div className="relative sm:p-10 flex flex-col sm:p-24 gap-4 items-center overflow-hidden">


          <h1 className=" text-4xl sm:text-6xl font-serif text-primary mb-6 relative z-10">
            Reach Us!
          </h1>

          <div className="flex items-center gap-4 relative z-10">
            <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12 cursor-pointer" onClick={() => handleSendToWhatsApp()} />
            <span className="font-medium">OR</span>
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
        <div className="text-black">
          <h2 className="text-2xl md:text-4xl  font-semibold font-cormorant text-center">
            Book Your Dream
          </h2>
          <h3 className='font-serif text-center text-lg mb-6 text-xl md:text-2xl'> Vacation Today!</h3>

          <BookingFomField />

        </div>

      </div>
    </div>
  );
}
