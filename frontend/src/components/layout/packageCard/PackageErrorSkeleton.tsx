import { TriangleAlert } from 'lucide-react';
import PackageCardSkeleton from './PackageCardSkeleton';

interface PackageErrorSkeletonProps {
    message?: string;
}

const PackageErrorSkeleton = ({ message = "No data available" }: PackageErrorSkeletonProps) => {
    return (
        <div className="relative w-full">
            {/* Background Skeletons (Faded) */}
            <div className="flex flex-col gap-0 w-full pointer-events-none">
                {[1, 2, 3].map((n) => (
                    <PackageCardSkeleton key={n} />
                ))}
            </div>

            {/* Centered Badge */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-6 py-3 flex items-center gap-3 sticky top-1/2">
                    <TriangleAlert className="text-orange-500 w-6 h-6" />
                    <span className="text-gray-600 font-medium">{message}</span>
                </div>
            </div>
        </div>
    );
};

export default PackageErrorSkeleton;
