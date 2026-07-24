// @ts-nocheck
import { useState, useEffect, useContext, useCallback } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { showToast } from "../../../../lib/utils";
import { Loader2, ArrowLeft, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { AdminPanelContext } from "../../../../pages/Admin/AdminPanel/AdminPanel";
import { createBlog, updateBlog, getBlogById } from "../../../../api/admin/blog.api";
import RichTextEditor from "../../../common/RichTextEditor";

const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  author: z.string().min(2, "Author is required"),
  miniDescription: z.string().min(10, "Mini description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  thumbnailImageUrl: z.string().optional(),
  thumbnailImageAlt: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  bannerImageAlt: z.string().optional(),
  faqs: z.array(z.object({
    question: z.string().min(5, "Question must be at least 5 characters"),
    answer: z.string().min(5, "Answer must be at least 5 characters"),
  })).optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

const BlogForm = () => {
  const context = useContext(AdminPanelContext);
  const editBlogId = context?.editId;
  const setActive = context?.setActive;
  const setEditId = context?.setEditId;
  const queryClient = useQueryClient();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");

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

  const { data: blogData, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["adminBlog", editBlogId],
    queryFn: () => getBlogById(editBlogId as string),
    enabled: !!editBlogId,
  });

  const watchTitle = watch("title");

  useEffect(() => {
    if (!editBlogId && watchTitle) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [watchTitle, setValue, editBlogId]);

  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data;
      reset({
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        author: blog.author,
        miniDescription: blog.miniDescription,
        content: blog.content,
        thumbnailImageUrl: blog.thumbnailImage?.url || "",
        thumbnailImageAlt: blog.thumbnailImage?.alt || "",
        bannerImageUrl: blog.bannerImage?.url || "",
        bannerImageAlt: blog.bannerImage?.alt || "",
        faqs: blog.faqs || [],
      });
      setStatus(blog.status as "Draft" | "Published");
      if (blog.thumbnailImage?.url) {
        setThumbnailPreview(blog.thumbnailImage.url);
        if (!blog.thumbnailImage.url.includes("cloudinary")) setThumbMode("url");
      }
      if (blog.bannerImage?.url) {
        setBannerPreview(blog.bannerImage.url);
        if (!blog.bannerImage.url.includes("cloudinary")) setBannerMode("url");
      }
    }
  }, [blogData, reset]);

  const mutation = useMutation({
    mutationFn: async (data: { values: BlogFormValues, submitStatus: "Draft" | "Published" }) => {
      const formData = new FormData();
      Object.entries(data.values).forEach(([key, value]) => {
        if (key === "faqs") return; // Skip faqs here, handle specifically below
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });
      formData.append("status", data.submitStatus);

      if (data.values.faqs && data.values.faqs.length > 0) {
        formData.append("faqs", JSON.stringify(data.values.faqs));
      } else {
        formData.append("faqs", "[]");
      }

      if (thumbnailFile) formData.append("thumbnailImage", thumbnailFile);
      if (bannerFile) formData.append("bannerImage", bannerFile);

      if (editBlogId) {
        return updateBlog(editBlogId, formData);
      } else {
        return createBlog(formData);
      }
    },
    onSuccess: (_, variables) => {
      const isDraft = variables.submitStatus === "Draft";
      const action = editBlogId ? "updated" : "created";
      
      showToast({
        type: "success",
        content: isDraft 
          ? `Blog ${action} and saved as draft!` 
          : `Blog ${action} and published successfully!`
      });

      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      setEditId?.(null);
      setActive?.("AllBlogs");
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        content: error?.response?.data?.error || error.message || "Something went wrong!"
      });
    },
  });

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

  const onSubmit = (values: BlogFormValues, submitStatus: "Draft" | "Published") => {
    if (!thumbnailPreview && !thumbnailFile && !editBlogId) {
      showToast({ type: "error", content: "Thumbnail image is required" });
      return;
    }
    mutation.mutate({ values, submitStatus });
  };

  if (isLoadingBlog) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => {
            setEditId?.(null);
            setActive?.("AllBlogs");
          }}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">
          {editBlogId ? "Edit Blog" : "Create New Blog"}
        </h2>
      </div>

      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">1. Blog Title *</label>
            <input
              {...register("title")}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="e.g. Which is the best area to live in Chennai?"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">2. Category *</label>
            <input
              {...register("category")}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="e.g. Travel Tips"
            />
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">3. Author *</label>
            <input
              {...register("author")}
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="e.g. BY DHATCHIKA"
            />
            {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
          </div>

          {/* Slug (Optional) */}
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

        {/* Mini Description */}
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
          {/* Thumbnail Image Section */}
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

          {/* Banner Image Section */}
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

        {/* Rich Text Editor for Content */}
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

        {/* FAQ Section */}
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
                    {errors.faqs?.[index]?.question && <p className="text-red-500 text-[10px] mt-1">{errors.faqs[index].question?.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Answer {index + 1}</label>
                    <textarea
                      {...register(`faqs.${index}.answer` as const)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                      placeholder="Enter the answer here..."
                    />
                    {errors.faqs?.[index]?.answer && <p className="text-red-500 text-[10px] mt-1">{errors.faqs[index].answer?.message}</p>}
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

        {/* Action Buttons */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-4 justify-end items-center sticky bottom-0 bg-white/80 backdrop-blur pb-4">
            <div className="flex-1 text-sm text-neutral-500 font-medium">
                Current Status: <span className={status === "Published" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>{status}</span>
            </div>
            <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-neutral-300 font-bold text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                onClick={handleSubmit((data) => onSubmit(data, "Draft"))}
                disabled={mutation.isPending}
            >
                {mutation.isPending && status === "Draft" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save as Draft"}
            </button>
            <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                onClick={handleSubmit((data) => onSubmit(data, "Published"))}
                disabled={mutation.isPending}
            >
                {mutation.isPending && status === "Published" ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editBlogId ? "Update & Publish" : "Publish Blog")}
            </button>
        </div>

      </form>
    </div>
  );
};

export default BlogForm;


