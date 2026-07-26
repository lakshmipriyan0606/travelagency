export default function Loading() {
    const Skeleton = ({ className }: { className?: string }) => (
        <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
    );

    return (
        <div className="min-h-screen">
            <div className="px-4 sm:px-8 lg:px-8 pt-28 sm:pt-32">
                <Skeleton className="h-6 w-1/3" />
            </div>

            <div className={`font-body mt-8 bg-white/50 px-6 rounded-2xl border border-gray-100`}>
                <Skeleton className="h-10 w-3/4 mb-2 mt-2" />
            </div>

            <div className={`mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8`}>
                <div className={`lg:col-span-8 pt-0 sm:pt-0`}>
                    <div className="space-y-4">
                        <Skeleton className="h-[400px] w-full" />
                        <Skeleton className="h-10 w-1/4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-4">
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </div>
        </div>
    );
}
