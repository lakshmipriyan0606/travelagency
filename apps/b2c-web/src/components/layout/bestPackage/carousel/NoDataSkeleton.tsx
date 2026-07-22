import { TriangleAlert } from 'lucide-react';
import WrapperCardSkeleton from './WrapperCardSkeleton';

const NoDataSkeleton = () => {
    return (
        <div className="relative w-full h-full min-h-[450px]">
            {/* Background Skeletons (Faded) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-50 pointer-events-none blur-[1px]">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="hidden md:block first:block">
                        <WrapperCardSkeleton />
                    </div>
                ))}
            </div>

            {/* Centered No Data Badge */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-6 py-3 flex items-center gap-3">
                    <TriangleAlert className="text-orange-500 w-6 h-6" />
                    <span className="text-gray-600 font-medium">No data available</span>
                </div>
            </div>
        </div>
    );
};

export default NoDataSkeleton;
