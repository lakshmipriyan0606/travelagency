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
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/40 shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <table className="min-w-full divide-y divide-white/[0.06] text-left">
        <thead className="bg-[var(--ent-elevated,#1c1c22)]/70">
          <tr>
            {["Blog Title", "Category", "Author", "Date", "Status", "Actions"].map((label) => (
              <th
                key={label}
                className={`px-5 py-3.5 text-[11px] font-semibold text-white/55 uppercase tracking-wider ${
                  label === "Actions" ? "text-right" : "text-left"
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {blogs.map((blog) => (
            <tr
              key={blog._id}
              className="group hover:bg-white/[0.035] transition-colors duration-150"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.1] ring-1 ring-white/[0.04] flex-shrink-0 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(0,0,0,0.25)]">
                    {blog.thumbnailImage?.url ? (
                      <img
                        src={blog.thumbnailImage.url}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div
                    className="font-semibold text-white text-sm leading-snug line-clamp-2 max-w-[240px]"
                    title={blog.title}
                  >
                    {blog.title}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.06] text-white/75 border border-white/[0.08]">
                  {blog.category}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-white/70 font-medium">
                {blog.author}
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-sm text-white/55 tabular-nums">
                {new Date(blog.date).toLocaleDateString()}
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onToggleStatus(blog)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors border ${
                    blog.status === "Published"
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/25"
                      : "bg-[#F8B400]/12 text-[#F8B400] border-[#F8B400]/20 hover:bg-[#F8B400]/20"
                  }`}
                >
                  {blog.status === "Published" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  {blog.status}
                </button>
              </td>
              <td className="px-5 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEdit(blog._id)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/20 transition-all"
                    title="Edit Blog"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(blog._id)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
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
  );
};
