"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBlogs, deleteBlog, updateBlog } from "../api/blogs.api";
import { BlogListTable } from "./BlogListTable";
import { Plus, Search, FileText } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";

export default function BlogListClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Blog Manager</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage your website's articles and news.</p>
        </div>
        <button
          onClick={() => router.push("/admin/blogs/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Create New Blog
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search blogs by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          />
        </div>
        <div className="text-end flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[150px] bg-white border border-neutral-300 rounded-xl px-4 py-2.5 shadow-sm text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : blogsData?.data?.length === 0 || !blogsData?.data ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-200 rounded-xl">
          <FileText className="w-16 h-16 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-700">No blogs found</h3>
          <p className="text-sm text-neutral-500 mt-1">Get started by creating your first blog post.</p>
        </div>
      ) : (
        <BlogListTable 
          blogs={blogsData.data} 
          onDelete={(id) => setDeleteId(id)} 
          onToggleStatus={(blog) => toggleStatusMutation.mutate(blog)} 
          onEdit={(id) => router.push(`/admin/blogs/${id}`)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-neutral-800 tracking-tight">Delete this article?</h3>
            <p className="text-neutral-500 text-sm font-medium mt-2">This action cannot be undone. This post will be permanently removed.</p>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-2xl px-4 py-3 font-bold text-neutral-500 hover:bg-neutral-100 transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 rounded-2xl px-4 py-3 font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
