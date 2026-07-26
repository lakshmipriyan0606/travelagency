export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-[0.3em] animate-pulse">
                Loading Story...
            </p>
        </div>
    );
}
