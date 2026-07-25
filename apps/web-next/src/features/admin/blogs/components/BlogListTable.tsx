import { FileText, CheckCircle2, Clock, Edit, Trash2 } from "lucide-react";
import { Blog } from "../validation/blog.schema";

interface BlogListTableProps {
  blogs: Blog[];
  onDelete: (id: string) => void;
  onToggleStatus: (blog: Blog) => void;
  onEdit: (id: string) => void;
}

export const BlogListTable: React.FC<BlogListTableProps> = ({ blogs, onDelete, onToggleStatus, onEdit }) => {
  return (
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
          {blogs.map((blog) => (
            <tr key={blog._id} className="hover:bg-neutral-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                    {blog.thumbnailImage?.url ? (
                      <img src={blog.thumbnailImage.url} alt={blog.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-neutral-400" />
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
                  onClick={() => onToggleStatus(blog)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    blog.status === "Published"
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
                  <button onClick={() => onEdit(blog._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Blog">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(blog._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Blog">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
