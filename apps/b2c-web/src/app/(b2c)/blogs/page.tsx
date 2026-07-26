import { Metadata } from 'next';
import BlogsClient from './BlogsClient';

export const metadata: Metadata = {
    title: 'Travel Blogs - Discover Your Next Adventure | Travel Agency',
    description: 'Read our latest travel blogs to discover the best destinations, travel tips, and cultural experiences worldwide.',
};

export default function BlogsPage() {
    return (
        <BlogsClient />
    );
}
