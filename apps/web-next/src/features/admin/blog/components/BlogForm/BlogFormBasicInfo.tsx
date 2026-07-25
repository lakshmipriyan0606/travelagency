import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { BlogFormValues } from "../../types/blog.types";

interface BlogFormBasicInfoProps {
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  setValue: UseFormSetValue<BlogFormValues>;
}

export const BlogFormBasicInfo: React.FC<BlogFormBasicInfoProps> = ({ register, errors, setValue }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">1. Blog Title *</label>
          <input
            {...register("title")}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="e.g. Which is the best area to live in Chennai?"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">2. Category *</label>
          <input
            {...register("category")}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="e.g. Travel Tips"
          />
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">3. Author *</label>
          <input
            {...register("author")}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="e.g. BY DHATCHIKA"
          />
          {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">4. Slug (Optional URL path)</label>
          <input
            {...register("slug")}
            onChange={(e) => {
              const val = e.target.value.toLowerCase().replace(/[\s_-]+/g, '-').replace(/[^\w-]/g, '');
              setValue("slug", val);
            }}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="e.g. best-area-chennai (Auto-generated if empty)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-700">5. Mini Description * (For Blog Card)</label>
        <textarea
          {...register("miniDescription")}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
          placeholder="Short summary appearing on the blog listing card..."
        />
        {errors.miniDescription && <p className="text-red-500 text-xs mt-1">{errors.miniDescription.message}</p>}
      </div>
    </>
  );
};
