import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBlogBySlug, toggleBlogLike, getPublicBlogs } from "../../api/admin/blog.api";
import { ArrowLeft, Calendar, User, Clock, Heart, Share2, SearchX } from "lucide-react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import Breadcrumb from "../../components/common/Breadcrumb/Breadcrumb";
import { footerData } from "../../components/layout/footer/constant";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const iconMap: Record<string, any> = { Facebook, Twitter, Instagram, Linkedin };

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const userId = localStorage.getItem("userId") || "";

  const { data: blogData, isLoading, isError } = useQuery({
    queryKey: ["publicBlog", slug],
    queryFn: () => getBlogBySlug(slug as string),
    enabled: !!slug,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (blogId: string) => toggleBlogLike(blogId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicBlog", slug] });
    },
    onError: () => {
      if (!userId || userId.startsWith("user_")) {
        toast.error("Please login to like this post.");
      } else {
        toast.error("Failed to like post.");
      }
    },
  });

  // Sidebar queries - Moved to top to follow Rules of Hooks
  const { data: relatedBlogs } = useQuery({
    queryKey: ["relatedBlogs", blogData?.data?.category],
    queryFn: () => getPublicBlogs({ category: blogData?.data?.category, limit: 3 }),
    enabled: !!blogData?.data?.category,
  });

  const { data: recentBlogs } = useQuery({
    queryKey: ["recentBlogs"],
    queryFn: () => getPublicBlogs({ limit: 5 }),
  });

  const { data: trendingBlogs } = useQuery({
    queryKey: ["trendingBlogs"],
    queryFn: () => getPublicBlogs({ sortBy: "likes", limit: 5 }),
  });

  const handleLike = () => {
    if (!userId) {
      toast.error("Please login to like this post.");
      return;
    }
    if (blogData?.data?._id) {
      toggleLikeMutation.mutate(blogData.data._id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blogData?.data?.title,
        text: blogData?.data?.miniDescription,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-neutral-400 uppercase tracking-[0.3em] animate-pulse">
          Loading Story...
        </p>
      </div>
    );
  }

  if (isError || !blogData?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center animate-in fade-in duration-1000">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-neutral-50 rounded-[32px] shadow-xl flex items-center justify-center border border-neutral-100">
            <SearchX size={40} className="text-primary/40 stroke-[1.5px]" />
          </div>
        </div>

        <h2 className="text-4xl mb-4 text-neutral-800 tracking-tight">Article Not Found</h2>
        <p className="text-neutral-500 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
          The story you're looking for might have been moved or removed. Let's find you another adventure.
        </p>

        <Link to="/blogs" className="px-10 py-4 bg-neutral-900 text-white rounded-[20px] font-bold text-sm uppercase tracking-[0.1em] hover:bg-black transition-all hover:scale-105 shadow-xl flex items-center gap-3">
          <ArrowLeft size={18} /> Back to Stories
        </Link>
      </div>
    );
  }

  const blog = blogData.data;
  const hasLiked = userId ? blog.likes?.some((like: any) => like.userId === userId) : false;

  return (
    <>
      <Helmet>
        <title>{blog.title} | Travel Agency</title>
        <meta name="description" content={blog.miniDescription} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.miniDescription} />
        {blog.bannerImage?.url && <meta property="og:image" content={blog.bannerImage.url} />}
      </Helmet>

      <main className="bg-[#F6F8FC] min-h-screen pb-20">
        {/* Banner Section */}
        <section className="relative w-full h-[70vh] min-h-[650px] overflow-hidden">
          <img
            src={blog.bannerImage?.url || blog.thumbnailImage?.url}
            alt={blog.bannerImage?.alt || blog.title}
            className="w-full h-full object-cover transition-transform duration-1000"
          />
          {/* Enhanced Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/95"></div>

          <div className="absolute bottom-0 left-0 top-1 w-full p-6 md:p-12 lg:p-20 pb-20 md:pb-28 ">
            <div className="container mx-auto my-10">
              <div className="flex flex-col gap-6 mb-12 translate-y-[-20px] animate-in fade-in slide-in-from-top duration-700">
                <Breadcrumb
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Blog", href: "/blogs" },
                    { label: blog.title.length > 40 ? blog.title.substring(0, 40) + "..." : blog.title }
                  ]}
                  className="text-white font-black drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-sm md:text-base"
                />
                <Link to="/blogs" className="inline-flex items-center gap-2 text-white font-black bg-white/10 backdrop-blur-md px-6 py-3 rounded-full transition-all w-fit border border-white/20 hover:bg-primary hover:border-primary transition-all duration-300 shadow-2xl">
                  <ArrowLeft size={16} /> Back to Stories
                </Link>
              </div>

              <div className="inline-block px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-md mb-6 shadow-2xl shadow-primary/40">
                {blog.category}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white max-w-5xl tracking-tighter leading-[0.9] mb-12 animate-in slide-in-from-bottom duration-700 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-white text-xs font-black uppercase tracking-[0.2em]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-xl">
                    <User size={20} className="text-primary" />
                  </div>
                  <span className="drop-shadow-lg">{blog.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-xl">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <span className="drop-shadow-lg">{new Date(blog.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-xl">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <span className="drop-shadow-lg">{blog.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Section */}
        <section className="container mx-auto px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-12 -mt-24 relative z-20">

            {/* Main Content (Left) */}
            <div className="lg:w-[68%]">
              <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl shadow-neutral-200/60 border border-neutral-100">
                <div className="prose prose-neutral prose-lg max-w-none 
                  prose-headings:text-neutral-900 prose-headings:font-black prose-headings:tracking-tighter
                  prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:text-[1.15rem]
                  prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-neutral-100
                  prose-blockquote:border-l-primary prose-blockquote:bg-neutral-50 prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-[2rem] prose-blockquote:not-italic prose-blockquote:font-black prose-blockquote:text-neutral-800
                  prose-a:text-primary prose-a:font-black hover:prose-a:text-primary/80 transition-colors
                  [&_ul]:list-disc [&_ol]:list-decimal [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Interaction Footer */}
                <div className="mt-20 pt-12 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <button
                      onClick={handleLike}
                      className="flex items-center gap-4 group transition-all"
                    >
                      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all ${hasLiked ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-neutral-50 text-neutral-400 group-hover:bg-red-50 group-hover:text-red-500 hover:scale-110 shadow-sm'}`}>
                        <Heart size={32} className={hasLiked ? "fill-red-500" : ""} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mb-1">Appreciate</span>
                        <span className="text-2xl font-black text-neutral-800 leading-none">{blog.likes?.length || 0} Likes</span>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest hidden sm:block">Spread the Word</p>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-4 px-10 py-5 bg-neutral-900 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all hover:scale-105 shadow-2xl shadow-neutral-400/50"
                    >
                      <Share2 size={20} className="text-primary" />
                      Copy Story Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar (Right) */}
            <aside className="lg:w-[32%] space-y-8">

              {/* Similar / Trending Section */}
              <div className="bg-white rounded-[40px] p-8 md:p-10 border border-neutral-100 shadow-2xl shadow-neutral-200/40">
                <h3 className="text-xl font-black text-neutral-800 mb-8 pb-4 border-b border-neutral-100 uppercase tracking-tighter flex items-center justify-between">
                  {relatedBlogs?.data?.filter((b: any) => b._id !== blog._id).length > 0 ? "Similar Blogs" : "Trending Now"}
                  <span className="w-12 h-1.5 bg-primary rounded-full"></span>
                </h3>
                <div className="space-y-8">
                  {(relatedBlogs?.data?.filter((b: any) => b._id !== blog._id).length > 0
                    ? relatedBlogs.data.filter((b: any) => b._id !== blog._id)
                    : trendingBlogs?.data?.filter((b: any) => b._id !== blog._id)
                  )?.slice(0, 4).map((item: any) => (
                    <Link key={item._id} to={`/blogs/${item.slug}`} className="flex gap-5 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 shadow-sm">
                        <img src={item.thumbnailImage?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1.5 block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-black text-neutral-800 line-clamp-2 leading-snug group-hover:text-primary transition-all tracking-tight">
                          {item.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                  {(!relatedBlogs?.data?.length && !trendingBlogs?.data?.length) && (
                    <p className="text-neutral-400 text-xs font-bold italic py-4">Stay tuned for more stories...</p>
                  )}
                </div>
              </div>

              {/* Recently Added Section */}
              {recentBlogs?.data?.filter((b: any) => b._id !== blog._id).length > 0 && (
                <div className="bg-neutral-50 rounded-[40px] p-8 md:p-10 border border-neutral-200">
                  <h3 className="text-lg font-black text-neutral-800 mb-8 uppercase tracking-tighter flex items-center justify-between">
                    Recent Stories
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                    </div>
                  </h3>
                  <div className="space-y-6">
                    {recentBlogs.data.filter((b: any) => b._id !== blog._id).slice(0, 3).map((recent: any) => (
                      <Link key={recent._id} to={`/blogs/${recent.slug}`} className="flex gap-5 group items-start">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 bg-white">
                          <img src={recent.thumbnailImage?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={recent.title} />
                        </div>
                        <div className="flex flex-col pt-1">
                          <h4 className="text-[13px] font-bold text-neutral-700 line-clamp-2 leading-tight group-hover:text-primary transition-all tracking-tight">
                            {recent.title}
                          </h4>
                          <span className="text-[9px] text-neutral-400 mt-1 font-bold">
                            {new Date(recent.date).toLocaleDateString()}
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
                  <h3 className="text-3xl font-black mb-4 tracking-tighter leading-tight">
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
    </>
  );
};

export default BlogDetailPage;
