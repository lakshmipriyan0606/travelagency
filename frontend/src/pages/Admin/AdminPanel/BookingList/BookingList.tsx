import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent
} from "@/components/ui/dialog";
import {
    Loader2,
    Mail,
    Phone,
    MapPin,
    Users,
    Info,
    ExternalLink,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { GetAllBookings } from "@/api/admin/auth.api";
import whatsappIcon from "@/assets/icons/whatsapp.svg";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";

interface Booking {
    _id: string;
    bookingId: string;
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    city: string;
    destination: string;
    travelDate: string;
    vacationType?: string;
    noOfPeople?: number;
    createdAt?: string;
}

interface BookingResponse {
    bookings: Booking[];
}

export default function BookingAdminPage() {
    const [selected, setSelected] = useState<Booking | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, isError } = UseFetchAPIQuery<BookingResponse>({
        key: ["allBookings"],
        queryFn: GetAllBookings,
    });

    const filteredBookings = data?.bookings?.filter(b =>
        (b.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (b.bookingId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (b.destination?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const handleWhatsApp = (phone: string, name: string) => {
        const message = `Hello ${name}, thank you for your inquiry with Travel Agency. How can we help you today?`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleQuickReply = (email: string, name: string, id: string) => {
        const subject = `Regarding your booking request #${id}`;
        const body = `Hello ${name},\n\nThank you for reaching out to Travel Agency. Regarding your inquiry...`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (isLoading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-pulse" />
                </div>
                <p className="text-neutral-500 font-medium animate-pulse">Loading amazing bookings...</p>
            </div>
        );

    if (isError) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50 rounded-3xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
                <Info size={24} />
            </div>
            <h3 className="text-lg font-bold text-red-900">Connection Error</h3>
            <p className="text-red-600/70 max-w-xs mx-auto mt-2">We couldn't fetch the booking list right now. Please check your connection.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Booking Requests</h1>
                    <p className="text-sm text-neutral-500 mt-1">Manage and review all incoming travel inquiries</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-neutral-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm w-full sm:w-64 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-all shadow-sm">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-50/50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                    <div className="col-span-3">Inquiry Details</div>
                    <div className="col-span-3">Customer</div>
                    <div className="col-span-3">Preference</div>
                    <div className="col-span-2">Contact</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-neutral-100">
                    <AnimatePresence mode="popLayout">
                        {filteredBookings && filteredBookings.length > 0 ? (
                            filteredBookings.map((b) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    key={b._id}
                                    className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-neutral-50/50 transition-colors group"
                                >
                                    <div className="col-span-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-neutral-800">#{b.bookingId}</span>
                                            <span className="text-[11px] text-neutral-400 mt-0.5">{b.destination}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-neutral-700">{b.name}</span>
                                            <span className="text-xs text-neutral-400 flex items-center gap-1">
                                                <MapPin size={10} /> {b.city || "Not specified"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {b.vacationType || "General"}
                                            </span>
                                            <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                                <Users size={10} /> {b.noOfPeople || 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex gap-2">
                                            <a href={`mailto:${b.email}`} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-primary/20 hover:text-primary transition-all">
                                                <Mail size={14} />
                                            </a>
                                            <a
                                                href={`tel:${b.phone}`}
                                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-green-100 hover:text-green-600 transition-all"
                                                title="Call Customer"
                                            >
                                                <Phone size={14} />
                                            </a>
                                            <button
                                                onClick={() => handleWhatsApp(b.whatsapp || b.phone, b.name)}
                                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:scale-110 transition-all border border-neutral-100"
                                                title="WhatsApp Message"
                                            >
                                                <img src={whatsappIcon} alt="WA" className="w-10 h-10" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button
                                            onClick={() => setSelected(b)}
                                            className="inline-flex items-center justify-center w-9 h-9 bg-neutral-100 text-neutral-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm group-hover:scale-105"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100">
                                    <Search className="text-neutral-300" size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-700">No bookings found</h3>
                                <p className="text-neutral-400 text-sm max-w-xs mx-auto mt-1">We couldn't find any inquiries matching your search criteria.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Dialog
                open={!!selected}
                onOpenChange={() => setSelected(null)}
            >
                <DialogContent className="max-w-2xl bg-white p-0 border-none shadow-2xl rounded-3xl overflow-hidden font-sans">
                    {selected && (
                        <div className="flex flex-col">
                            <div className="bg-gradient-to-br from-primary to-[#F69520] p-8 text-white relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            Booking Request
                                        </span>
                                        <h2 className="text-3xl font-bold mt-3 tracking-tight">#{selected.bookingId}</h2>
                                        <p className="text-white/80 font-medium mt-1 uppercase text-xs tracking-widest">{selected.destination}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[100px]">
                                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Travel Date</span>
                                        <span className="text-lg font-bold">
                                            {(() => {
                                                const d = new Date(selected.travelDate);
                                                return isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString();
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
                                    <ExternalLink size={20} />
                                </div>
                            </div>

                            <div className="p-8 pt-10 grid grid-cols-2 gap-8 text-neutral-700">
                                <section className="space-y-6">
                                    <div>
                                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Customer Information</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-800 leading-tight">{selected.name}</p>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{selected.city || "City not provided"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                    <Mail size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Email</p>
                                                    <p className="text-sm font-semibold text-neutral-800">{selected.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
                                                    <Phone size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Direct Contact</p>
                                                    <p className="text-sm font-semibold text-neutral-800">{selected.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div>
                                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Trip Preferences</h4>
                                        <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Destination</span>
                                                <span className="text-sm font-bold text-neutral-800 text-right">{selected.destination}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Group Size</span>
                                                <span className="text-sm font-bold text-neutral-800 text-right">{selected.noOfPeople || 1} Person(s)</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Style</span>
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">{selected.vacationType || "General"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleQuickReply(selected.email, selected.name, selected.bookingId)}
                                            className="flex-1 py-3 bg-neutral-800 text-white rounded-2xl font-bold text-sm hover:bg-neutral-900 transition-all shadow-lg shadow-neutral-200"
                                        >
                                            Quick Reply
                                        </button>
                                        <button
                                            onClick={() => handleWhatsApp(selected.whatsapp || selected.phone, selected.name)}
                                            className="w-12 h-12 flex items-center justify-center"
                                            title="WhatsApp Message"
                                        >
                                            <img src={whatsappIcon} alt="WA" className="w-10 h-10" />
                                        </button>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

