"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBlogs, deleteBlog, updateBlog } from "../api/blogs.api";
import { BlogListTable } from "./BlogListTable";
import { BlogListCards } from "./BlogListCards";
import { Plus, Search, FileText } from "lucide-react";
import { AirplaneLoader } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { ViewMode, ViewModeToggle } from "@/components/common/ViewModeToggle";

export default function BlogListClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["adminBlogs", search, statusFilter],
    queryFn: () => getAdminBlogs({ search, status: statusFilter === "all" ? "" : statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      showToast({ type: "success", content: "Blog deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
    },
    onError: () => showToast({ type: "error", content: "Failed to delete blog" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (blog: any) => {
      const newStatus = blog.status === "Published" ? "Draft" : "Published";
      const formData = new FormData();
      formData.append("status", newStatus);
      return updateBlog(blog._id, formData);
    },
    onSuccess: () => {
      showToast({ type: "success", content: "Blog status updated" });
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
    },
    onError: () => showToast({ type: "error", content: "Failed to update status" }),
  });

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const blogs = blogsData?.data ?? [];
  const total = blogs.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="ent-gold-bar h-7 shrink-0" />
            Blog Manager
          </h2>
          <p className="text-sm text-white/60 mt-1.5 ml-[15px]">
            Manage your website&apos;s articles and news.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(ROUTES.blogs.new)}
          className="inline-flex items-center gap-2 bg-[#F8B400] hover:bg-[#e0a200] text-black px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(248,180,0,0.15)]"
        >
          <Plus size={18} />
          Create New Blog
        </button>
      </div>

      <div className="admin-surface p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                size={16}
              />
              <input
                type="text"
                placeholder="Search blogs by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-field w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-field w-full sm:w-[160px] px-4 py-2.5 text-sm text-white outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        {isLoading ? (
          <AirplaneLoader size="lg" label="Loading blogs…" fullPage className="py-20" />
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
            <FileText className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-base font-semibold text-white/80">No blogs found</h3>
            <p className="text-sm text-white/45 mt-1">Get started by creating your first blog post.</p>
          </div>
        ) : viewMode === "list" ? (
          <BlogListTable
            blogs={blogs}
            onDelete={(id) => setDeleteId(id)}
            onToggleStatus={(blog) => toggleStatusMutation.mutate(blog)}
            onEdit={(id) => router.push(ROUTES.blogs.edit(id))}
          />
        ) : (
          <BlogListCards
            blogs={blogs}
            onDelete={(id) => setDeleteId(id)}
            onToggleStatus={(blog) => toggleStatusMutation.mutate(blog)}
            onEdit={(id) => router.push(ROUTES.blogs.edit(id))}
          />
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative bg-[var(--ent-card,#16161b)] border border-white/[0.1] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.55)] p-7 max-w-sm w-full animate-in zoom-in-95 duration-200 overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent">
            <h3 className="text-xl font-bold text-white tracking-tight">Delete this article?</h3>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">
              This action cannot be undone. This post will be permanently removed.
            </p>
            <div className="flex gap-3 mt-7">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm text-white/60 border border-white/[0.1] hover:bg-white/[0.04] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl px-4 py-2.5 font-semibold text-sm bg-red-500/90 text-white hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
