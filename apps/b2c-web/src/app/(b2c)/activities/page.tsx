import { Metadata } from 'next';
import { Suspense } from 'react';
import ActivitiesClient from './ActivitiesClient';

export const metadata: Metadata = {
    title: 'All Adventure Activities & Tours | Travel Agency',
    description: 'Discover a wide range of travel activities and adventure tours from snorkeling to hiking.',
    keywords: 'travel, activities, tours, adventure',
};

export default function ActivitiesPage() {
    return (
        <div className="w-full min-h-screen bg-white">
            <Suspense fallback={<div>Loading activities...</div>}><ActivitiesClient /></Suspense>
        </div>
    );
}
