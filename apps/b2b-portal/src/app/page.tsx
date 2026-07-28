import { ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
        <Briefcase className="text-white w-8 h-8" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center max-w-2xl">
        TravelAgency <span className="text-blue-500">B2B Portal</span>
      </h1>
      
      <p className="text-neutral-400 mt-6 text-center max-w-lg text-lg">
        The exclusive platform for our travel partners. Manage bookings, access wholesale rates, and streamline your operations.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link 
          href={ROUTES.login}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all"
        >
          Partner Login
          <ArrowRight size={18} />
        </Link>
        <Link 
          href={ROUTES.register}
          className="px-8 py-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all"
        >
          Apply for Partnership
        </Link>
      </div>
    </main>
  );
}
