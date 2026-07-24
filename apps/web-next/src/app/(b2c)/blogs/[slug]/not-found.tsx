import { SearchX } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150"></div>
                <div className="relative w-24 h-24 bg-neutral-50 rounded-[32px] shadow-xl flex items-center justify-center border border-neutral-100">
                    <SearchX size={40} className="text-primary/40 stroke-[1.5px]" />
                </div>
            </div>

            <h2 className="text-4xl mb-4 text-neutral-800 tracking-tight">Article Not Found</h2>
            <p className="text-neutral-500 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
                The story you're looking for might have been moved or removed. Let's find you another adventure.
            </p>

            <Link href="/blogs" className="px-10 py-4 bg-neutral-900 text-white rounded-[20px] font-bold text-sm uppercase tracking-[0.1em] hover:bg-black transition-all hover:scale-105 shadow-xl flex items-center gap-3">
                <ArrowLeft size={18} /> Back to Stories
            </Link>
        </div>
    );
}
