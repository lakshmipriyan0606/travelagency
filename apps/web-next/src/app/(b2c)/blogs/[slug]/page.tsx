import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Tag, SearchX, Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
// @ts-ignore
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import { footerData } from '@/components/layout/footer/constant';
import { FAQItem, BlogInteractions } from '@/components/layout/blogDetail/BlogClientComponents';

import { API_BASE_URL } from '@/lib/config';

const iconMap: Record<string, any> = { Facebook, Twitter, Instagram, Linkedin };

async function getBlogData(slug: string) {
    try {
        const res = await fetch(`${API_BASE_URL}/v1/b2c/blogs/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.data || null;
    } catch (error) {
        return null;
    }
}

async function getSidebarBlogs(category: string) {
    try {
        // Fetch related and recent in parallel
        const [relatedRes, recentRes] = await Promise.all([
            fetch(`${API_BASE_URL}/v1/b2c/blogs?category=${encodeURIComponent(category)}&limit=4`, { next: { revalidate: 3600 } }),
            fetch(`${API_BASE_URL}/v1/b2c/blogs?limit=4`, { next: { revalidate: 3600 } })
        ]);
        
        const related = relatedRes.ok ? await relatedRes.json() : { data: [] };
        const recent = recentRes.ok ? await recentRes.json() : { data: [] };
        
        return {
            related: related?.data || [],
            recent: recent?.data || []
        };
    } catch (error) {
        return { related: [], recent: [] };
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const blog = await getBlogData(params.slug);
    if (!blog) return { title: 'Story Not Found' };

    return {
        title: `${blog.title} | Travel Agency`,
        description: blog.miniDescription,
        openGraph: {
            title: blog.title,
            description: blog.miniDescription,
            images: blog.bannerImage?.url ? [{ url: blog.bannerImage.url }] : [],
        }
    };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
    const blog = await getBlogData(params.slug);
    
    if (!blog) {
        notFound();
    }

    const { related, recent } = await getSidebarBlogs(blog.category);
    
    // Filter out current blog from sidebar lists
    const relatedFiltered = related.filter((b: any) => b._id !== blog._id).slice(0, 3);
    const recentFiltered = recent.filter((b: any) => b._id !== blog._id).slice(0, 3);

    return (
        <main className="bg-[#F6F8FC] min-h-screen pb-20">
            {/* Banner Section */}
            <section className="relative w-full h-[70vh] min-h-[650px] overflow-hidden">
                <img
                    src={blog.bannerImage?.url || blog.thumbnailImage?.url}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/95"></div>

                <div className="absolute bottom-0 left-0 top-1 w-full p-6 md:p-12 lg:p-20 pb-20 md:pb-28">
                    <div className="container mx-auto my-10">
                        <div className="flex flex-col gap-6 mb-2 translate-y-[-20px]">
                            <Breadcrumb
                                items={[
                                    { label: "Home", href: "/" },
                                    { label: "Blog", href: "/blogs" },
                                    { label: blog.title }
                                ]}
                                className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-sm md:text-base"
                            />
                            <Link href="/blogs" className="inline-flex items-center gap-2 text-white bg-white/10 backdrop-blur-md px-6 py-3 rounded-full transition-all w-fit border border-white/20 hover:bg-primary hover:border-primary shadow-2xl">
                                <ArrowLeft size={16} /> Back to Stories
                            </Link>
                        </div>

                        <h1 className="text-2xl text-white max-w-5xl mb-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] line-clamp-3 overflow-hidden cursor-default" title={blog.title}>
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-white text-xs uppercase tracking-[0.2em]">
                            {[
                                { icon: User, label: blog.author },
                                { icon: Calendar, label: new Date(blog.date).toLocaleDateString(undefined, { dateStyle: 'long' }) },
                                { icon: Clock, label: blog.readTime },
                                { icon: Tag, label: blog.category }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl transition-transform hover:scale-110 duration-300">
                                        <item.icon size={22} className="text-primary" />
                                    </div>
                                    <span className="drop-shadow-lg opacity-90">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Layout Section */}
            <section className="container mx-auto px-4 lg:px-10">
                <div className="flex flex-col lg:flex-row gap-12 -mt-24 relative z-20">

                    {/* Main Content (Left) */}
                    <div className="lg:w-[70%]">
                        <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl shadow-neutral-200/60 border border-neutral-100">
                            <div className="prose prose-neutral prose-lg max-w-none 
                                prose-headings:text-neutral-900 prose-headings:tracking-tighter
                                prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:text-[1.15rem]
                                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-neutral-100
                                prose-blockquote:border-l-primary prose-blockquote:bg-neutral-50 prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-[2rem] prose-blockquote:not-italic prose-blockquote:text-neutral-800
                                prose-a:text-primary hover:prose-a:text-primary/80 transition-colors
                                [&_ul]:list-disc [&_ol]:list-decimal [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* FAQ Section */}
                            {blog.faqs && blog.faqs.length > 0 && (
                                <div className="mt-20 pt-16 border-t border-neutral-100">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Tag size={24} />
                                        </div>
                                        <h3 className="text-3xl text-neutral-800">
                                            Frequently Asked <span className="text-primary italic">Questions</span>
                                        </h3>
                                    </div>

                                    <div className="space-y-2">
                                        {blog.faqs.map((faq: any, index: number) => (
                                            <FAQItem key={index} faq={faq} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <BlogInteractions blogId={blog._id} initialLikes={blog.likes} blogTitle={blog.title} blogDesc={blog.miniDescription} />
                        </div>
                    </div>

                    {/* Sidebar (Right) */}
                    <aside className="lg:w-[30%] space-y-8">
                        {/* Similar Section */}
                        <div className="bg-white rounded-[40px] p-8 md:p-10 border border-neutral-100 shadow-2xl shadow-neutral-200/40">
                            <h3 className="text-xl text-neutral-800 mb-2 pb-4 border-b border-neutral-100 uppercase tracking-tighter flex items-center justify-between">
                                Similar Blogs
                                <span className="w-12 h-1.5 bg-primary rounded-full"></span>
                            </h3>
                            <div className="space-y-8">
                                {relatedFiltered.length === 0 ? (
                                    <div className="py-1 px-4 text-center space-y-4">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                                            <SearchX size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-neutral-800 tracking-tight">No other stories yet</p>
                                        </div>
                                    </div>
                                ) : (
                                    relatedFiltered.map((item: any) => (
                                        <Link key={item._id} href={`/blogs/${item.slug}`} className="flex gap-5 group">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 shadow-sm">
                                                <img src={item.thumbnailImage?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <span className="text-[9px] text-primary uppercase tracking-widest mb-1.5 block">
                                                    {item.category}
                                                </span>
                                                <h4 className="text-sm text-neutral-800 line-clamp-2 leading-snug group-hover:text-primary transition-all tracking-tight">
                                                    {item.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recently Added Section */}
                        {recentFiltered.length > 0 && (
                            <div className="bg-neutral-50 rounded-[40px] p-8 md:p-10 border border-neutral-200">
                                <h3 className="text-lg text-neutral-800 mb-8 uppercase tracking-tighter flex items-center justify-between">
                                    Recent Stories
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                    </div>
                                </h3>
                                <div className="space-y-6">
                                    {recentFiltered.map((recentItem: any) => (
                                        <Link key={recentItem._id} href={`/blogs/${recentItem.slug}`} className="flex gap-5 group items-start">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 bg-white">
                                                <img src={recentItem.thumbnailImage?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={recentItem.title} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <h4 className="text-[13px] text-neutral-700 line-clamp-2 leading-tight group-hover:text-primary transition-all tracking-tight">
                                                    {recentItem.title}
                                                </h4>
                                                <span className="text-[9px] text-neutral-400 mt-1 font-bold">
                                                    {new Date(recentItem.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Newsletter / CTA Section */}
                        <div className="bg-neutral-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>

                            <div className="relative z-10 text-center">
                                <h3 className="text-3xl mb-4 tracking-tighter leading-tight">
                                    Follow <span className="text-primary text-4xl block mt-2">Our Journey</span>
                                </h3>
                                <p className="text-white/40 text-[13px] mb-10 font-bold leading-relaxed px-4">
                                    Join our global community for daily inspiration and exclusive stories.
                                </p>

                                <div className="flex flex-wrap justify-center gap-4">
                                    {footerData.social.map(social => {
                                        const Icon = iconMap[social.icon] || Twitter;
                                        return (
                                            <a
                                                key={social.name}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-primary flex items-center justify-center transition-all border border-white/10 hover:border-primary group hover:scale-110 shadow-xl"
                                                title={social.name}
                                            >
                                                <Icon size={20} className="text-white group-hover:scale-110 transition-all" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
