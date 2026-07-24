import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteBlog, updateBlog } from "@/api/admin/blog.api";

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onMutate: () => {
      toast.info("Deleting blog...");
    },
    onSuccess: () => {
      toast.success("Blog deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete blog");
    },
  });
}

export function useToggleBlogStatus() {
  return useMutation({
    mutationFn: async (blog: { _id: string, status: string }) => {
      const newStatus = blog.status === "Published" ? "Draft" : "Published";
      const formData = new FormData();
      formData.append("status", newStatus);
      return updateBlog(blog._id, formData);
    },
    onSuccess: () => {
      toast.success("Blog status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}
