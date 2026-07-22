import { Helmet } from "react-helmet-async";
import BookingFomField from "@/components/layout/reachus/BookingFomField";
import { GLOBAL_CONFIG } from "@/config/globalConfig";
import { MapPin, Mail, Phone, MessageCircle, ExternalLink, Copy, PhoneCall } from "lucide-react";
import { showToast, WANumber, WADisplayNumber } from "@/lib/utils";

const OFFICE_ADDRESS =
  "Sastikaa Travel Sdn Bhd, 117, Jln Pudu, Bukit Bintang, 50000 Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia";

const GMAPS_QUERY = encodeURIComponent(OFFICE_ADDRESS);
const GMAPS_IFRAME_SRC = `https://www.google.com/maps?q=${GMAPS_QUERY}&output=embed`;
const GMAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${GMAPS_QUERY}`;

export default function Contact() {
  const openWhatsApp = () => {
    const message =
      "Hi Sastika Travels, I visited your website and would like to know more about your travel packages. Please share the details. Thank you!";
    window.open(`https://wa.me/${WANumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const openDirections = () => {
    // Using window.open avoids occasional overlay / SPA interception issues on some devices
    window.open(GMAPS_DIRECTIONS_URL, "_blank", "noopener,noreferrer");
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(OFFICE_ADDRESS);
      showToast({ type: "success", content: "Address copied!" });
    } catch {
      showToast({ type: "error", content: "Could not copy address. Please copy manually." });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact | {GLOBAL_CONFIG.site.officialName}</title>
        <meta
          name="description"
          content="Contact Sastikaa Travel Sdn Bhd for tour packages, bookings, and enquiries. Find our address in Kuala Lumpur and reach us via WhatsApp or email."
        />
      </Helmet>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://i.postimg.cc/rmFhP4Tg/woman-traveler-visiting-son-tra-marina-tourist-with-blue-dress-hat-traveling-da-nang-city-vietnam-so.jpg')",
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-black/55" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(252,175,22,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-10 sm:pb-14">

          <div className="flex flex-col gap-5">
            <p className="text-primary tracking-[0.25em] uppercase text-xs sm:text-sm">
              Contact & Location
            </p>
            <h1 className="text-white text-3xl sm:text-5xl leading-tight">
              Let’s plan your next trip — start with a message.
            </h1>
            <p className="text-white/75 max-w-2xl text-sm sm:text-base leading-relaxed">
              Share where you want to go and when you want to travel. Our team will respond with the
              best options, pricing, and itinerary ideas.
            </p>
          </div>

          {/* Quick actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-black px-4 py-2.5 font-semibold hover:brightness-95 transition"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp us
            </button>
            <a
              href={`mailto:${GLOBAL_CONFIG.contact.email}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white px-4 py-2.5 hover:bg-white/15 transition"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <button
              type="button"
              onClick={openDirections}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white px-4 py-2.5 hover:bg-white/15 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Directions
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 pb-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left: contact cards + map */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold">WhatsApp</p>
                    <p className="text-gray-600 text-sm mt-1">{WADisplayNumber}</p>
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="mt-3 inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      Message on WhatsApp <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold">India Contact</p>
                    <p className="text-gray-600 text-sm mt-1">{GLOBAL_CONFIG.contact.indiaPhone}</p>
                    <a
                      href={`tel:${GLOBAL_CONFIG.contact.indiaPhone.replace(/\s/g, '')}`}
                      className="mt-3 inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      Call Now <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold">Email</p>
                    <p className="text-gray-600 text-sm mt-1 break-all">{GLOBAL_CONFIG.contact.email}</p>
                    <a
                      href={`mailto:${GLOBAL_CONFIG.contact.email}`}
                      className="mt-3 inline-flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      Send an email <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-semibold">Office address</p>
                    <p className="text-gray-600 text-sm mt-1">{OFFICE_ADDRESS}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={copyAddress}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 text-gray-900 px-3 py-2 hover:bg-gray-100 transition text-sm border border-neutral-200"
                      >
                        <Copy className="w-4 h-4" />
                        Copy address
                      </button>
                      <button
                        type="button"
                        onClick={openDirections}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 text-gray-900 px-3 py-2 hover:bg-gray-100 transition text-sm border border-neutral-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open in Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-neutral-200/80 bg-white shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
              <div className="aspect-[16/12] sm:aspect-[16/9] lg:aspect-[16/8]">
                <iframe
                  title="Sastikaa Travel location on Google Maps"
                  src={GMAPS_IFRAME_SRC}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3">
                <p className="text-gray-600 text-sm">
                  Find us in Bukit Bintang, Kuala Lumpur.
                </p>
                <button
                  type="button"
                  onClick={openDirections}
                  className="text-primary text-sm hover:underline inline-flex items-center gap-2"
                >
                  Get directions <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: enquiry form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:ring-2 hover:ring-primary/10 hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.6)]">
              <h2 className="text-gray-900 text-xl sm:text-2xl font-semibold">
                Enquiry form
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Submit your details and we’ll call/message you back with package suggestions.
              </p>
              <div className="mt-5">
                <BookingFomField mainClassName="bg-white" />
              </div>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                By submitting, you agree to be contacted via WhatsApp/phone/email for your enquiry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

