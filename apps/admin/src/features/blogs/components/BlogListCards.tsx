"use client";

import { FileText, CheckCircle2, Clock, Edit, Trash2 } from "lucide-react";
import { Blog } from "../validation/blog.schema";

interface BlogListCardsProps {
  blogs: Blog[];
  onDelete: (id: string) => void;
  onToggleStatus: (blog: Blog) => void;
  onEdit: (id: string) => void;
}

export function BlogListCards({ blogs, onDelete, onToggleStatus, onEdit }: BlogListCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {blogs.map((blog) => {
        const isPublished = blog.status === "Published";

        return (
          <article
            key={blog._id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/50 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-[#F8B400]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent"
          >
            <div className="relative aspect-[16/10] bg-white/[0.03] overflow-hidden">
              {blog.thumbnailImage?.url ? (
                <img
                  src={blog.thumbnailImage.url}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="w-10 h-10 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0f]/80 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => onToggleStatus(blog)}
                className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm transition-colors ${
                  isPublished
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30"
                    : "bg-[#F8B400]/20 text-[#F8B400] border-[#F8B400]/30 hover:bg-[#F8B400]/30"
                }`}
              >
                {isPublished ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                {blog.status}
              </button>
              <span className="absolute top-3 right-3 inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/55 text-[#F8B400] border border-[#F8B400]/30 backdrop-blur-sm">
                {blog.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
              <h3
                className="text-base font-semibold text-white tracking-tight line-clamp-2 leading-snug"
                title={blog.title}
              >
                {blog.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
                <span className="font-medium text-white/70">{blog.author}</span>
                <span className="text-white/25">·</span>
                <span className="tabular-nums">{new Date(blog.date).toLocaleDateString()}</span>
              </div>

              <div className="mt-auto flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onEdit(blog._id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8B400] hover:bg-[#e0a200] text-black px-3.5 py-2 text-xs font-bold transition-colors shadow-[0_0_16px_rgba(248,180,0,0.2)]"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(blog._id)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-white/[0.08] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                  title="Delete Blog"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
