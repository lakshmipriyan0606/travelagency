
import { Phone, Mail } from 'lucide-react';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import MapIcon from '@/assets/icons/Map.svg';
import BookingFomField from './BookingFomField';
import { WANumber, WADisplayNumber } from '@/lib/utils';
import HeroEnquiryForm from '../herosection/HeroEnquiryForm';


export default function ReachUs() {

  const handleSendToWhatsApp = () => {
    const phoneNumber = WANumber

    const message = `Hi Sastika Travels I visited your website and would like to know more about your travel packages.Please share the details. Thank you!`;


    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };
  return (
    <div id="reach-us-section" className="   relative bg-[#474747] py-10 px-2 overflow-hidden">
      {/* Background map */}
      <img
        src={MapIcon}
        alt="Map background"
        className="absolute inset-3 opacity-25 object-cover pointer-events-none w-full h-full"
      />
      {/* Subtle overlay removed to let gray color shine through */}
      <div className="relative z-10 max-w-7xl p-3 py-4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:px-6 lg:px-14 sm:p-8">
        {/* LEFT SECTION */}
        <div className="relative  flex flex-col justify-center gap-4 items-center overflow-hidden">


          <h1 className=" text-4xl sm:text-6xl text-primary mb-6 relative z-10">
            Reach Us!
          </h1>

          <div className="flex items-center gap-4 relative z-10">
            <img src={whatsappIcon} alt="whatsapp" className="w-12 h-12 cursor-pointer" onClick={() => handleSendToWhatsApp()} />
            <span className="font-medium text-gray-300">OR</span>
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Phone className="text-white" />
            </div>
          </div>

          <p className="mt-6 text-lg text-gray-300 relative z-10">
            {WADisplayNumber}
          </p>

          <div className="flex flex-col items-center gap-3 mt-10 relative z-10">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Mail className="text-white" />
            </div>
            <p className="text-gray-300 text-lg">info@SastikaTravels.com</p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="text-white xl:max-w-md">
          <h2 className="text-2xl md:text-4xl  font-semibold text-center">
            Book Your Dream
          </h2>
          <h3 className='text-center text-lg mb-6 text-xl md:text-2xl text-gray-200'> Vacation Today!</h3>

          <div className='hidden sm:block'>
            <BookingFomField fieldClassName={'text-gray-200 sm:text-gray-700'} mainClassName='bg-white' />
          </div>

          <div className='sm:hidden'>
            <HeroEnquiryForm onComplete={() => { }} compact packageName={''} />
          </div>
        </div>

      </div>
    </div>
  );
}
