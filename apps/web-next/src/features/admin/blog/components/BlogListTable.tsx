"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteBlog, useToggleBlogStatus } from "../api/mutations";
import { BlogResponse } from "../types/blog.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function BlogListTable({ blogs, totalPages, currentPage }: { blogs: BlogResponse[], totalPages: number, currentPage: number }) {
  const router = useRouter();
  const deleteMutation = useDeleteBlog();
  const statusMutation = useToggleBlogStatus();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteMutation.mutateAsync(id);
      router.refresh();
    }
  };

  const handleToggleStatus = async (blog: BlogResponse) => {
    await statusMutation.mutateAsync({ _id: blog._id, status: blog.status });
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blog Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-300 mb-2" />
                    <p>No blogs found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                        {blog.thumbnailImage?.url ? (
                          <img src={blog.thumbnailImage.url} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 absolute inset-0 m-auto text-neutral-400" />
                        )}
                      </div>
                      <div className="font-bold text-neutral-800 line-clamp-2 max-w-[200px]" title={blog.title}>
                        {blog.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs font-bold">
                      {blog.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{blog.author}</TableCell>
                  <TableCell className="text-xs text-neutral-500">
                    {new Date(blog.date || Date.now()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(blog)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${blog.status === "Published"
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                    >
                      {blog.status === "Published" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {blog.status}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/admin/blogs/${blog._id}`}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(blog._id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="py-4 border-t border-gray-200 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/admin/blogs?page=${currentPage - 1}` : "#"} 
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <PaginationItem>
                <PaginationNext 
                  href={currentPage < totalPages ? `/admin/blogs?page=${currentPage + 1}` : "#"} 
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
