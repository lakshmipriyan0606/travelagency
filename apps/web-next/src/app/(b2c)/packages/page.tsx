import { Metadata } from 'next';
import { Suspense } from 'react';
import FilterPackage from '@/components/layout/filterPackage/FilterPackage';

export const metadata: Metadata = {
    title: 'All Travel Packages & Tours | Travel Agency',
    description: 'Browse all our travel packages, from family vacations to adventure tours. Find your perfect getaway with our easy filters.',
    keywords: 'travel, packages, tours, vacation, all packages',
};

export default function PackagesPage() {
    return (
        <div className="w-full min-h-screen bg-white">
            <Suspense fallback={<div>Loading packages...</div>}><FilterPackage likePackageOnly={false} mode="packages" /></Suspense>
        </div>
    );
}
