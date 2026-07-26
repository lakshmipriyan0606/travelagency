/* eslint-disable */
'use client';
import { useState, useEffect } from 'react';
import { Minus, Plus, Heart, Share2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBlogLike } from '@/api/blog.api';

import { showToast } from "@/lib/toast";

export const FAQItem = ({ faq }: { faq: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className={`group rounded-[0.5rem] border transition-all duration-500 overflow-hidden ${isOpen ? 'bg-neutral-50 border-primary/20 shadow-xl shadow-primary/5' : 'bg-white border-neutral-100 hover:border-primary/20 hover:shadow-lg'
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full text-left p-3 flex items-center justify-between gap-6"
            >
                <span className={`text-lg transition-all duration-300 ${isOpen ? 'text-primary' : 'text-neutral-700'}`}>
                    {faq.question}
                </span>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-neutral-100 text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-8 pb-8 text-neutral-600 leading-relaxed font-medium">
                    {faq.answer}
                </div>
            </div>
        </div>
    );
};

export const BlogInteractions = ({ blogId, initialLikes, blogTitle, blogDesc }: { blogId: string, initialLikes: any[], blogTitle: string, blogDesc: string }) => {
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        setUserId(localStorage.getItem('userId'));
    }, []);

    const hasLiked = userId ? initialLikes?.some((like: any) => like.userId === userId) : false;

    const toggleLikeMutation = useMutation({
        mutationFn: () => toggleBlogLike(blogId, userId as string),
        onSuccess: () => {
            // Usually we'd invalidate the query or use router.refresh().
            // Since data is fetched server-side, a router refresh is best for Server Components.
            window.location.reload(); 
        },
        onError: () => {
            if (!userId || userId.startsWith("user_")) {
                showToast({ type: "error", content: "Please login to like this post." });
            } else {
                showToast({ type: "error", content: "Failed to like post." });
            }
        },
    });

    const handleLike = () => {
        if (!userId) {
            showToast({ type: "error", content: "Please login to like this post." });
            return;
        }
        toggleLikeMutation.mutate();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blogTitle,
                text: blogDesc,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast({ type: "success", content: "Link copied to clipboard!" });
        }
    };

    return (
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
                        <span className="text-[10px] text-neutral-400 uppercase tracking-[0.3em] mb-1">Appreciate</span>
                        <span className="text-2xl text-neutral-800 leading-none">{initialLikes?.length || 0} Likes</span>
                    </div>
                </button>
            </div>

            <div className="flex items-center gap-6">
                <p className="text-xs text-neutral-400 uppercase tracking-widest hidden sm:block">Spread the Word</p>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-4 px-10 py-5 bg-neutral-900 text-white rounded-[20px] text-xs uppercase tracking-[0.2em] hover:bg-black transition-all hover:scale-105 shadow-2xl shadow-neutral-400/50"
                >
                    <Share2 size={20} className="text-primary" />
                    Copy Story Link
                </button>
            </div>
        </div>
    );
};

