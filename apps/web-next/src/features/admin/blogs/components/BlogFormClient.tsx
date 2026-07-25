"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { createBlog, updateBlog, getBlogById } from "../api/blogs.api";
import { blogSchema, BlogFormValues } from "../validation/blog.schema";
import { BlogFormImageUpload } from "./BlogFormImageUpload";
import { BlogFormFaqs } from "./BlogFormFaqs";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/common/RichTextEditor"), { ssr: false });

export default function BlogFormClient({ editBlogId }: { editBlogId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: { title: "", slug: "", category: "", author: "", miniDescription: "", content: "", faqs: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  const { data: blogData, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["adminBlog", editBlogId],
    queryFn: () => getBlogById(editBlogId as string),
    enabled: !!editBlogId,
  });

  const watchTitle = watch("title");
  const watchStatus = watch("status") || "Draft";

  useEffect(() => {
    if (!editBlogId && watchTitle) setValue("slug", watchTitle.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, ""));
  }, [watchTitle, setValue, editBlogId]);

  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data;
      reset({ ...blog, thumbnailImageUrl: blog.thumbnailImage?.url || "", thumbnailImageAlt: blog.thumbnailImage?.alt || "", bannerImageUrl: blog.bannerImage?.url || "", bannerImageAlt: blog.bannerImage?.alt || "", faqs: blog.faqs || [] });
      if (blog.thumbnailImage?.url) { setThumbPreview(blog.thumbnailImage.url); if (!blog.thumbnailImage.url.includes("cloudinary")) setThumbMode("url"); }
      if (blog.bannerImage?.url) { setBannerPreview(blog.bannerImage.url); if (!blog.bannerImage.url.includes("cloudinary")) setBannerMode("url"); }
    }
  }, [blogData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (k !== "faqs" && v !== undefined && v !== null) formData.append(k, v as string); });
      formData.append("faqs", values.faqs?.length ? JSON.stringify(values.faqs) : "[]");
      if (thumbFile) formData.append("thumbnailImage", thumbFile);
      if (bannerFile) formData.append("bannerImage", bannerFile);
      return editBlogId ? updateBlog(editBlogId, formData) : createBlog(formData);
    },
    onSuccess: (_, vars) => {
      showToast({ type: "success", content: `Blog ${editBlogId ? "updated" : "created"} and ${vars.status === "Draft" ? "saved as draft" : "published"}!` });
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      router.push("/admin/blogs");
    },
    onError: (e: any) => showToast({ type: "error", content: e.message || "Something went wrong!" }),
  });

  const onSubmit = (values: BlogFormValues, submitStatus: "Draft" | "Published") => {
    if (!thumbPreview && !thumbFile && !editBlogId) return showToast({ type: "error", content: "Thumbnail is required" });
    mutation.mutate({ ...values, status: submitStatus });
  };

  if (isLoadingBlog) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin/blogs")} className="p-2 hover:bg-neutral-100 rounded-full"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-bold text-neutral-800">{editBlogId ? "Edit Blog" : "Create New Blog"}</h2>
      </div>
      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-sm font-semibold">1. Blog Title *</label><input {...register("title")} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary outline-none" />{errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}</div>
          <div className="space-y-2"><label className="text-sm font-semibold">2. Category *</label><input {...register("category")} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary outline-none" />{errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}</div>
          <div className="space-y-2"><label className="text-sm font-semibold">3. Author *</label><input {...register("author")} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary outline-none" />{errors.author && <p className="text-red-500 text-xs">{errors.author.message}</p>}</div>
          <div className="space-y-2"><label className="text-sm font-semibold">4. Slug</label><input {...register("slug")} onChange={e => setValue("slug", e.target.value.toLowerCase().replace(/[\s_-]+/g, '-').replace(/[^\w-]/g, ''))} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary outline-none" /></div>
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold">5. Mini Description *</label><textarea {...register("miniDescription")} rows={3} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-primary outline-none resize-none" />{errors.miniDescription && <p className="text-red-500 text-xs">{errors.miniDescription.message}</p>}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BlogFormImageUpload label="6. Thumbnail *" register={register} urlFieldName="thumbnailImageUrl" altFieldName="thumbnailImageAlt" mode={thumbMode} setMode={setThumbMode} preview={thumbPreview} setPreview={setThumbPreview} setFile={setThumbFile} />
          <BlogFormImageUpload label="7. Banner" register={register} urlFieldName="bannerImageUrl" altFieldName="bannerImageAlt" mode={bannerMode} setMode={setBannerMode} preview={bannerPreview} setPreview={setBannerPreview} setFile={setBannerFile} />
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold">8. Blog Content *</label><Controller name="content" control={control} render={({ field }) => <RichTextEditor content={field.value} onChange={field.onChange} />} />{errors.content && <p className="text-red-500 text-xs">{errors.content.message}</p>}</div>
        <BlogFormFaqs fields={fields} append={append} remove={remove} register={register} errors={errors} />
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row gap-4 justify-end items-center sticky bottom-0 bg-white/80 backdrop-blur pb-4">
          <div className="flex-1 text-sm font-medium">Status: <span className={watchStatus === "Published" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>{watchStatus}</span></div>
          <button type="button" onClick={handleSubmit((d) => onSubmit(d, "Draft"))} disabled={mutation.isPending} className="px-6 py-3 rounded-xl border border-neutral-300 font-bold hover:bg-neutral-50">{mutation.isPending && watchStatus === "Draft" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save as Draft"}</button>
          <button type="button" onClick={handleSubmit((d) => onSubmit(d, "Published"))} disabled={mutation.isPending} className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg">{mutation.isPending && watchStatus === "Published" ? <Loader2 className="w-5 h-5 animate-spin" /> : (editBlogId ? "Update & Publish" : "Publish Blog")}</button>
        </div>
      </form>
    </div>
  );
}
