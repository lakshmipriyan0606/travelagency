import { Metadata } from 'next';
import { Suspense } from 'react';
import FilterPackage from "@/components/layout/filterPackage/FilterPackage";

export const metadata: Metadata = {
    title: 'Liked Packages | Travel Agency',
    description: 'View your favorite and liked travel packages.',
};

export default function LikePackagePage() {
    return (
        <div className="w-full min-h-screen bg-white">
            <Suspense fallback={<div>Loading liked packages...</div>}>
                <FilterPackage likePackageOnly={true} mode="packages" />
            </Suspense>
        </div>
    );
}
