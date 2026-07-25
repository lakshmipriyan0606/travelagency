"use client";

import { Controller } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/common/RichTextEditor";
import { BlogResponse } from "../types/blog.types";
import { useBlogForm } from "./BlogForm/useBlogForm";
import { BlogFormBasicInfo } from "./BlogForm/BlogFormBasicInfo";
import { BlogFormImages } from "./BlogForm/BlogFormImages";
import { BlogFormFAQ } from "./BlogForm/BlogFormFAQ";

interface BlogFormClientProps {
  initialData?: BlogResponse | null;
  isEdit?: boolean;
}

export default function BlogFormClient({ initialData, isEdit = false }: BlogFormClientProps) {
  const {
    methods, register, handleSubmit, errors, fields, append, remove, setValue, control,
    thumbnailPreview, setThumbnailPreview, bannerPreview, setBannerPreview,
    thumbMode, setThumbMode, bannerMode, setBannerMode,
    getThumbProps, getThumbInput, getBannerProps, getBannerInput,
    onSubmit, isSubmitting, status, router
  } = useBlogForm({ initialData, isEdit });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => router.push("/admin/blogs")} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">{isEdit ? "Edit Blog" : "Create New Blog"}</h2>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <BlogFormBasicInfo register={register} errors={errors} setValue={setValue} />
        
        <BlogFormImages
          register={register}
          thumbMode={thumbMode} setThumbMode={setThumbMode}
          thumbnailPreview={thumbnailPreview} setThumbnailPreview={setThumbnailPreview}
          getThumbProps={getThumbProps} getThumbInput={getThumbInput}
          bannerMode={bannerMode} setBannerMode={setBannerMode}
          bannerPreview={bannerPreview} setBannerPreview={setBannerPreview}
          getBannerProps={getBannerProps} getBannerInput={getBannerInput}
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">8. Blog Content *</label>
          <Controller name="content" control={control} render={({ field }) => <RichTextEditor content={field.value} onChange={field.onChange} />} />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
        </div>

        <BlogFormFAQ register={register} errors={errors} fields={fields} append={append} remove={remove} />

        <div className="flex items-center justify-end gap-4 pt-8 border-t border-neutral-100">
          <button type="button" onClick={handleSubmit((data) => onSubmit(data, "Draft"))} disabled={isSubmitting} className="px-6 py-3 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all disabled:opacity-50">
            {isSubmitting && status === "Draft" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save as Draft"}
          </button>
          <button type="button" onClick={handleSubmit((data) => onSubmit(data, "Published"))} disabled={isSubmitting} className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
            {isSubmitting && status === "Published" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}
