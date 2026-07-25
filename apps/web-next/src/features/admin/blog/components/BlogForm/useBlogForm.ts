import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { blogSchema } from "../../validation/blog.schema";
import { BlogFormValues, BlogResponse } from "../../types/blog.types";
import { createBlog, updateBlog } from "@/api/admin/blog.api";
import { useDropzone } from "react-dropzone";

interface UseBlogFormProps {
  initialData?: BlogResponse | null;
  isEdit?: boolean;
}

export function useBlogForm({ initialData, isEdit = false }: UseBlogFormProps) {
  const router = useRouter();

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "", slug: "", category: "", author: "", miniDescription: "", content: "",
      thumbnailImageUrl: "", thumbnailImageAlt: "", bannerImageUrl: "", bannerImageAlt: "", faqs: [],
    },
  });

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  const watchTitle = watch("title");

  useEffect(() => {
    if (!isEdit && watchTitle) {
      const generatedSlug = watchTitle.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [watchTitle, setValue, isEdit]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title, slug: initialData.slug, category: initialData.category,
        author: initialData.author, miniDescription: initialData.miniDescription, content: initialData.content,
        thumbnailImageUrl: initialData.thumbnailImage?.url || "", thumbnailImageAlt: initialData.thumbnailImage?.alt || "",
        bannerImageUrl: initialData.bannerImage?.url || "", bannerImageAlt: initialData.bannerImage?.alt || "",
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

  const { getRootProps: getThumbProps, getInputProps: getThumbInput } = useDropzone({ onDrop: onDropThumbnail, accept: { "image/*": [] }, maxFiles: 1 });
  const { getRootProps: getBannerProps, getInputProps: getBannerInput } = useDropzone({ onDrop: onDropBanner, accept: { "image/*": [] }, maxFiles: 1 });

  const onSubmit = async (values: BlogFormValues, submitStatus: "Draft" | "Published") => {
    if (!thumbnailPreview && !thumbnailFile && !isEdit) {
      toast.error("Thumbnail image is required");
      return;
    }
    
    setIsSubmitting(true);
    setStatus(submitStatus); // Track which button was clicked
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "faqs") return; 
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });
      formData.append("status", submitStatus);

      if (values.faqs && values.faqs.length > 0) formData.append("faqs", JSON.stringify(values.faqs));
      else formData.append("faqs", "[]");

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
      if (error instanceof Error) toast.error(error.message || "Failed to save blog");
      else toast.error("An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    methods, register, handleSubmit, errors, fields, append, remove, setValue, control,
    thumbnailFile, thumbnailPreview, setThumbnailPreview, bannerFile, bannerPreview, setBannerPreview,
    thumbMode, setThumbMode, bannerMode, setBannerMode,
    getThumbProps, getThumbInput, getBannerProps, getBannerInput,
    onSubmit, isSubmitting, status, router
  };
}
