import { config } from '@/lib/config';
import { ENDPOINTS } from '@/lib/endpoints';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const BASE_URL = config.siteUrl;

    try {
        // Fetch all packages and blogs for sitemap
        const [packagesRes, blogsRes] = await Promise.all([
            fetch(ENDPOINTS.server.sitemapPackages(), { next: { revalidate: 3600 } }),
            fetch(ENDPOINTS.server.sitemapBlogs(), { next: { revalidate: 3600 } })
        ]);

        const packages = packagesRes.ok ? await packagesRes.json() : { data: [] };
        const blogs = blogsRes.ok ? await blogsRes.json() : { data: [] };

        const packageUrls: MetadataRoute.Sitemap = (packages?.data || []).map((pkg: any) => ({
            url: `${BASE_URL}/package/${pkg.slug || pkg._id}`,
            lastModified: new Date(pkg.updatedAt || pkg.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        const blogUrls: MetadataRoute.Sitemap = (blogs?.data || []).map((blog: any) => ({
            url: `${BASE_URL}/blogs/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || blog.date || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        return [
            {
                url: `${BASE_URL}/`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            },
            {
                url: `${BASE_URL}/packages`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/activities`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/blogs`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            {
                url: `${BASE_URL}/contact`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            },
            ...packageUrls,
            ...blogUrls,
        ];
    } catch (error) {
        console.error("Failed to generate sitemap", error);
        return [
            {
                url: `${BASE_URL}/`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            }
        ];
    }
}

