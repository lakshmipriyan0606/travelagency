// @ts-nocheck
import { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext } from "react"; export const AdminPanelContext = createContext<any>(null);
import { getAdminBlogs, deleteBlog, updateBlog } from "../../../../api/admin/blog.api";
import { Edit, Trash2, Plus, Search, FileText, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@travelagency/ui";
import { NiceSelect } from "@/components/common/NiceSelect";

const BlogAdminList = () => {
  const context = useContext(AdminPanelContext);
  const setActive = context?.setActive;
  const setEditId = context?.setEditId;

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["adminBlogs", search, statusFilter],
    queryFn: () => getAdminBlogs({ search, status: statusFilter === "all" ? "" : statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      toast.success("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
    },
    onError: () => toast.error("Failed to delete blog"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (blog: any) => {
      const newStatus = blog.status === "Published" ? "Draft" : "Published";
      const formData = new FormData();
      formData.append("status", newStatus);
      return updateBlog(blog._id, formData);
    },
    onSuccess: () => {
      toast.success("Blog status updated");
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditId?.(id);
    setActive?.("CreateBlog");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Blog Manager</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage your website's articles and news.</p>
        </div>
        <button
          onClick={() => {
            setEditId?.(null);
            setActive?.("CreateBlog");
          }}
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
          <NiceSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "Published", label: "Published" },
              { value: "Draft", label: "Draft" }
            ]}
            triggerClassName=" w-[150px] bg-white border border-neutral-300 rounded-xl px-4 py-2.5 shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : blogsData?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-200 rounded-xl">
          <FileText className="w-16 h-16 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-700">No blogs found</h3>
          <p className="text-sm text-neutral-500 mt-1">Get started by creating your first blog post.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50 text-neutral-700 text-xs uppercase font-bold border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">Blog Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {blogsData?.data?.map((blog: any) => (
                <tr key={blog._id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                        {blog.thumbnailImage?.url ? (
                          <img src={blog.thumbnailImage.url} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 m-auto text-neutral-400 mt-2.5" />
                        )}
                      </div>
                      <div className="font-bold text-neutral-800 line-clamp-2 max-w-[200px]" title={blog.title}>
                        {blog.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs font-bold">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{blog.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
                    {new Date(blog.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatusMutation.mutate(blog)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${blog.status === "Published"
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                    >
                      {blog.status === "Published" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {blog.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(blog._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Blog"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(blog._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Blog"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-neutral-800 tracking-tight">
              Delete this article?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-base font-medium mt-2">
              This action cannot be undone. This post will be permanently removed from your website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-4">
            <AlertDialogCancel className="rounded-2xl px-6 py-3 font-bold text-neutral-500 hover:bg-neutral-100 border-none transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-2xl px-6 py-3 font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogAdminList;




