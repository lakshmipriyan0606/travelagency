import Skeleton from 'react-loading-skeleton';

const WrapperCardSkeleton = () => {
    return (
        <div className="bg-white rounded-md overflow-hidden shadow-xl text-gray-900 flex flex-col mt-3 h-[450px]">
            {/* Image Placeholder */}
            <div className="w-full h-[250px]">
                <Skeleton height={250} style={{ borderRadius: 0 }} />
            </div>

            {/* Details Placeholder */}
            <div className="flex flex-col gap-3 justify-center p-[15px] w-full">

                {/* Location & Like */}
                <div className="flex items-center justify-between">
                    <div className="w-32">
                        <Skeleton height={24} />
                    </div>
                    <div className="w-8">
                        <Skeleton circle height={32} width={32} />
                    </div>
                </div>

                {/* Days & Rating */}
                <div className="flex flex-col gap-2">
                    <div className="w-24">
                        <Skeleton height={20} />
                    </div>
                    <div className="w-20">
                        <Skeleton height={20} />
                    </div>
                </div>

                {/* Price */}
                <div className="mt-2 flex justify-between items-center">
                    <div className="w-10">
                        <Skeleton height={16} />
                    </div>
                    <div className="w-24">
                        <Skeleton height={24} />
                    </div>
                </div>

                <div className="w-full h-[1px] my-1">
                    <Skeleton height={1} />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 w-full items-center">
                    <div className="w-12">
                        <Skeleton circle height={48} width={48} />
                    </div>
                    <div className="w-full">
                        <Skeleton height={40} borderRadius={8} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WrapperCardSkeleton;
