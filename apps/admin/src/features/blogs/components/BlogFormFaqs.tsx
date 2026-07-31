import { Plus, Trash2 } from "lucide-react";
import { UseFieldArrayReturn, UseFormRegister, FieldErrors } from "react-hook-form";
import { BlogFormValues } from "../validation/blog.schema";

interface BlogFormFaqsProps {
  fields: UseFieldArrayReturn<BlogFormValues, "faqs", "id">["fields"];
  append: UseFieldArrayReturn<BlogFormValues, "faqs", "id">["append"];
  remove: UseFieldArrayReturn<BlogFormValues, "faqs", "id">["remove"];
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
}

export const BlogFormFaqs: React.FC<BlogFormFaqsProps> = ({
  fields,
  append,
  remove,
  register,
  errors,
}) => {
  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">FAQs (optional)</h3>
          <p className="text-xs text-white/40 mt-1">
            Add common questions and answers for this blog post.
          </p>
        </div>
        <button
          type="button"
          onClick={() => append({ question: "", answer: "" })}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/30 hover:text-[#F8B400] text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60 transition-all group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
          Add FAQ
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-5 admin-surface-elevated rounded-2xl relative animate-in slide-in-from-right duration-300"
          >
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-white/35 hover:text-red-400 transition-colors"
              aria-label={`Remove FAQ ${index + 1}`}
            >
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 gap-4 pr-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                  Question {index + 1}
                </label>
                <input
                  {...register(`faqs.${index}.question` as const)}
                  className="admin-field w-full h-11 px-4 text-sm text-white placeholder:text-white/30 outline-none"
                  placeholder="Enter the question here…"
                />
                {errors.faqs?.[index]?.question && (
                  <p className="text-red-400 text-[10px] font-semibold">
                    {errors.faqs[index].question?.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                  Answer {index + 1}
                </label>
                <textarea
                  {...register(`faqs.${index}.answer` as const)}
                  rows={2}
                  className="admin-field w-full px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none"
                  placeholder="Enter the answer here…"
                />
                {errors.faqs?.[index]?.answer && (
                  <p className="text-red-400 text-[10px] font-semibold">
                    {errors.faqs[index].answer?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-white/[0.1] rounded-2xl bg-white/[0.02]">
            <p className="text-white/35 text-sm font-medium">
              No FAQs yet. Click Add FAQ to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
