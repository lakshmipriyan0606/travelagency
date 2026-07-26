'use client';

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicBlogs, toggleBlogLike } from "@/api/admin/blog.api";
import BlogCard, { BlogCardSkeleton } from "@/components/layout/blog/BlogCard";
import BlogEmptyState from "@/components/layout/blog/BlogEmptyState";
import { Search } from "lucide-react";
import { showToast } from "@/lib/toast";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";

const BlogsClient = () => {
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Run on client side only to avoid hydration mismatch
    const id = localStorage.getItem("userId") || "";
    setUserId(id);
  }, []);

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["publicBlogs", search],
    queryFn: () => getPublicBlogs({ search }),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (blogId: string) => toggleBlogLike(blogId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
    },
    onError: () => {
      if (!userId || userId.startsWith("user_")) {
        showToast({ type: "error", content: "Please login to like a blog post." });
      } else {
        showToast({ type: "error", content: "Failed to like blog post." });
      }
    },
  });

  const handleLike = (id: string) => {
    if (!userId) {
      showToast({ type: "error", content: "Please login to like a blog post." });
      return;
    }
    toggleLikeMutation.mutate(id);
  };

  return (
    <main className="min-h-screen bg-[#F6F8FC] pt-28 pb-12 md:pt-32 md:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog" }
            ]}
            className="font-black text-neutral-400 uppercase tracking-widest text-[10px]"
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mx-auto mb-16 animate-in slide-in-from-bottom flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl mb-6 tracking-tight leading-none font-heading">
          Our Latest <span className="text-primary">Stories</span>
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl px-4 font-body">
          Dive into our curated collection of travel experiences, tips, and destination guides designed to inspire your next great adventure.
        </p>

        {/* Search Bar */}
        {blogsData?.data?.length !== 0 && (
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-4 pl-12 rounded-full border-2 border-white bg-white shadow-xl shadow-neutral-200/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all text-neutral-700 font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          </div>
        )}

        {/* Grid Area */}
        <div className="w-full max-w-7xl mx-auto mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-8">
              {[...Array(6)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogsData?.data?.length === 0 ? (
            <BlogEmptyState hasSearch={!!search} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 sm:px-8">
              {blogsData?.data?.map((blog: any, index: number) => {
                const hasLiked = userId
                  ? blog.likes?.some((like: any) => like.userId === userId)
                  : false;

                return (
                  <div
                    key={blog._id}
                    className="animate-in fade-in slide-in-from-bottom duration-700 text-left"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <BlogCard
                      _id={blog._id}
                      title={blog.title}
                      slug={blog.slug}
                      miniDescription={blog.miniDescription}
                      thumbnailImage={blog.thumbnailImage}
                      author={blog.author}
                      readTime={blog.readTime}
                      hasLiked={hasLiked}
                      onLike={handleLike}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default BlogsClient;
