import { UseFormRegister, FieldErrors, UseFieldArrayRemove } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { BlogFormValues } from "../../types/blog.types";

interface BlogFormFAQProps {
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  fields: Record<"id", string>[];
  append: (value: { question: string; answer: string }) => void;
  remove: UseFieldArrayRemove;
}

export const BlogFormFAQ: React.FC<BlogFormFAQProps> = ({ register, errors, fields, append, remove }) => {
  return (
    <div className="space-y-6 pt-8 border-t border-neutral-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-800">9. Blog FAQs (Optional)</h3>
          <p className="text-xs text-neutral-500 mt-1">Add common questions and answers for this blog post.</p>
        </div>
        <button
          type="button"
          onClick={() => append({ question: "", answer: "" })}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xs hover:bg-primary/20 transition-all border border-primary/20 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          ADD FAQ
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 relative animate-in slide-in-from-right duration-300">
            <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Question {index + 1}</label>
                <input
                  {...register(`faqs.${index}.question` as const)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Enter the question here..."
                />
                {errors.faqs?.[index]?.question && <p className="text-red-500 text-[10px] mt-1">{errors.faqs[index]?.question?.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Answer {index + 1}</label>
                <textarea
                  {...register(`faqs.${index}.answer` as const)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  placeholder="Enter the answer here..."
                />
                {errors.faqs?.[index]?.answer && <p className="text-red-500 text-[10px] mt-1">{errors.faqs[index]?.answer?.message}</p>}
              </div>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
            <p className="text-neutral-400 text-sm font-medium italic">No FAQs added yet. Click 'ADD FAQ' to start.</p>
          </div>
        )}
      </div>
    </div>
  );
};
