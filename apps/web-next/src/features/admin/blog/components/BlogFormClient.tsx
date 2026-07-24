"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { Loader2, ArrowLeft, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/common/RichTextEditor";
import { blogSchema } from "../validation/blog.schema";
import { BlogFormValues, BlogResponse } from "../types/blog.types";
import { createBlog, updateBlog } from "@/api/admin/blog.api";

interface BlogFormClientProps {
  initialData?: BlogResponse | null;
  isEdit?: boolean;
}

export default function BlogFormClient({ initialData, isEdit = false }: BlogFormClientProps) {
  const router = useRouter();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      author: "",
      miniDescription: "",
      content: "",
      thumbnailImageUrl: "",
      thumbnailImageAlt: "",
      bannerImageUrl: "",
      bannerImageAlt: "",
      faqs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const watchTitle = watch("title");

  useEffect(() => {
    if (!isEdit && watchTitle) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [watchTitle, setValue, isEdit]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        category: initialData.category,
        author: initialData.author,
        miniDescription: initialData.miniDescription,
        content: initialData.content,
        thumbnailImageUrl: initialData.thumbnailImage?.url || "",
        thumbnailImageAlt: initialData.thumbnailImage?.alt || "",
        bannerImageUrl: initialData.bannerImage?.url || "",
        bannerImageAlt: initialData.bannerImage?.alt || "",
        faqs: initialData.faqs || [],
      });
      setStatus(initialData.status);
      if (initialData.thumbnailImage?.url) {
        setThumbnailPreview(initialData.thumbnailImage.url);
        if (!initialData.thumbnailImage.url.includes("cloudinary")) setThumbMode("url");
      }
      if (initialData.bannerImage?.url) {
        setBannerPreview(initialData.bannerImage.url);
        if (!initialData.bannerImage.url.includes("cloudinary")) setBannerMode("url");
      }
    }
  }, [initialData, reset]);

  const onDropThumbnail = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setThumbnailFile(acceptedFiles[0]);
      setThumbnailPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropBanner = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setBannerFile(acceptedFiles[0]);
      setBannerPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps: getThumbProps, getInputProps: getThumbInput } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const { getRootProps: getBannerProps, getInputProps: getBannerInput } = useDropzone({
    onDrop: onDropBanner,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const onSubmit = async (values: BlogFormValues, submitStatus: "Draft" | "Published") => {
    if (!thumbnailPreview && !thumbnailFile && !isEdit) {
      toast.error("Thumbnail image is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "faqs") return; 
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });
      formData.append("status", submitStatus);

      if (values.faqs && values.faqs.length > 0) {
        formData.append("faqs", JSON.stringify(values.faqs));
      } else {
        formData.append("faqs", "[]");
      }

      if (thumbnailFile) formData.append("thumbnailImage", thumbnailFile);
      if (bannerFile) formData.append("bannerImage", bannerFile);

      if (isEdit && initialData?._id) {
        await updateBlog(initialData._id, formData);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(formData);
        toast.success("Blog created successfully");
      }
      
      router.push("/admin/blogs");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to save blog");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/blogs")}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">
          {isEdit ? "Edit Blog" : "Create New Blog"}
        </h2>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-700">6. Thumbnail Image *</label>
              <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setThumbMode("upload")}
                  className={`px-3 py-1 rounded-md transition-all ${thumbMode === "upload" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}
                >UPLOAD</button>
                <button
                  type="button"
                  onClick={() => setThumbMode("url")}
                  className={`px-3 py-1 rounded-md transition-all ${thumbMode === "url" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}
                >URL</button>
              </div>
            </div>

            {thumbMode === "upload" ? (
              <div
                {...getThumbProps()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${
                  thumbnailPreview ? "border-primary/50 bg-primary/5" : "border-neutral-300 hover:border-primary/50 hover:bg-neutral-50"
                }`}
              >
                <input {...getThumbInput()} />
                {thumbnailPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Click or drag to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm text-neutral-600 font-medium">Drop thumbnail image here</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  {...register("thumbnailImageUrl")}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Paste image URL here..."
                  onChange={(e) => setThumbnailPreview(e.target.value)}
                />
                {thumbnailPreview && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
                    <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Thumbnail Alt Text</p>
              <input
                {...register("thumbnailImageAlt")}
                className="w-full px-4 py-2 text-sm rounded-lg border border-neutral-200 focus:border-primary outline-none"
                placeholder="Describe this image for SEO..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-700">7. Banner Image (Big Header)</label>
              <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setBannerMode("upload")}
                  className={`px-3 py-1 rounded-md transition-all ${bannerMode === "upload" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}
                >UPLOAD</button>
                <button
                  type="button"
                  onClick={() => setBannerMode("url")}
                  className={`px-3 py-1 rounded-md transition-all ${bannerMode === "url" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}
                >URL</button>
              </div>
            </div>

            {bannerMode === "upload" ? (
              <div
                {...getBannerProps()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${
                  bannerPreview ? "border-primary/50 bg-primary/5" : "border-neutral-300 hover:border-primary/50 hover:bg-neutral-50"
                }`}
              >
                <input {...getBannerInput()} />
                {bannerPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Click or drag to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400">
                      <ImageIcon size={24} />
                    </div>
                    <p className="text-sm text-neutral-600 font-medium">Drop banner image here</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  {...register("bannerImageUrl")}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Paste banner URL here..."
                  onChange={(e) => setBannerPreview(e.target.value)}
                />
                {bannerPreview && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
                    <img src={bannerPreview} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Banner Alt Text</p>
              <input
                {...register("bannerImageAlt")}
                className="w-full px-4 py-2 text-sm rounded-lg border border-neutral-200 focus:border-primary outline-none"
                placeholder="Describe this header image..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-700">8. Blog Content *</label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
        </div>

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
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 transition-colors"
                >
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

        <div className="flex items-center justify-end gap-4 pt-8 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "Draft"))}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all disabled:opacity-50"
          >
            {isSubmitting && status === "Draft" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "Published"))}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting && status === "Published" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}
