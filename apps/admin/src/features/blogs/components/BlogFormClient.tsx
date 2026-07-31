"use client";

import { useState, useEffect, type ComponentType } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/toast";
import { AirplaneLoader } from "@travelagency/ui";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  FileText,
  ImageIcon,
  PenLine,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createBlog, updateBlog, getBlogById } from "../api/blogs.api";
import { blogSchema, BlogFormValues } from "../validation/blog.schema";
import { BlogFormImageUpload } from "./BlogFormImageUpload";
import { BlogFormFaqs } from "./BlogFormFaqs";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import dynamic from "next/dynamic";
import Stepper from "@/components/ui/Stepper";

const RichTextEditor = dynamic(() => import("@/components/common/RichTextEditor"), { ssr: false });

const STEPS = [
  { id: 1, name: "Basics" },
  { id: 2, name: "Media" },
  { id: 3, name: "Content" },
  { id: 4, name: "Review" },
] as const;

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";
const fieldClass =
  "admin-field w-full h-11 px-4 text-sm text-white placeholder:text-white/30 outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-red-400 text-[10px] font-semibold mt-1">{message}</p>;
}

function StepIntro({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.08] pb-4 mb-6">
      <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
        <Icon size={16} className="text-[#F8B400]" />
        {title}
      </h3>
      <p className="text-xs text-white/45 mt-1.5">{description}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
      <p className="text-sm text-white/90 break-words">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export default function BlogFormClient({ editBlogId }: { editBlogId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [thumbMode, setThumbMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  const [pendingStatus, setPendingStatus] = useState<"Draft" | "Published" | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    trigger,
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
      faqs: [],
      status: "Draft",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "faqs" });

  const { data: blogData, isLoading: isLoadingBlog } = useQuery({
    queryKey: ["adminBlog", editBlogId],
    queryFn: () => getBlogById(editBlogId as string),
    enabled: !!editBlogId,
  });

  const watchTitle = watch("title");
  const watchStatus = watch("status") || "Draft";
  const values = watch();

  useEffect(() => {
    if (!editBlogId && watchTitle) {
      setValue(
        "slug",
        watchTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }, [watchTitle, setValue, editBlogId]);

  useEffect(() => {
    if (blogData?.data) {
      const blog = blogData.data;
      reset({
        ...blog,
        thumbnailImageUrl: blog.thumbnailImage?.url || "",
        thumbnailImageAlt: blog.thumbnailImage?.alt || "",
        bannerImageUrl: blog.bannerImage?.url || "",
        bannerImageAlt: blog.bannerImage?.alt || "",
        faqs: blog.faqs || [],
      });
      if (blog.thumbnailImage?.url) {
        setThumbPreview(blog.thumbnailImage.url);
        if (!blog.thumbnailImage.url.includes("cloudinary")) setThumbMode("url");
      }
      if (blog.bannerImage?.url) {
        setBannerPreview(blog.bannerImage.url);
        if (!blog.bannerImage.url.includes("cloudinary")) setBannerMode("url");
      }
    }
  }, [blogData, reset]);

  const mutation = useMutation({
    mutationFn: async (formValues: BlogFormValues) => {
      const formData = new FormData();
      Object.entries(formValues).forEach(([k, v]) => {
        if (k !== "faqs" && v !== undefined && v !== null) formData.append(k, v as string);
      });
      formData.append("faqs", formValues.faqs?.length ? JSON.stringify(formValues.faqs) : "[]");
      if (thumbFile) formData.append("thumbnailImage", thumbFile);
      if (bannerFile) formData.append("bannerImage", bannerFile);
      return editBlogId ? updateBlog(editBlogId, formData) : createBlog(formData);
    },
    onSuccess: (_, vars) => {
      showToast({
        type: "success",
        content: `Blog ${editBlogId ? "updated" : "created"} and ${
          vars.status === "Draft" ? "saved as draft" : "published"
        }!`,
      });
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      router.push(ROUTES.blogs.list);
    },
    onError: (e: Error) => showToast({ type: "error", content: e.message || "Something went wrong!" }),
    onSettled: () => setPendingStatus(null),
  });

  const hasThumbnail = Boolean(thumbPreview || thumbFile || editBlogId);

  const markStepComplete = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const ok = await trigger(["title", "category", "author", "miniDescription"]);
      if (!ok) return;
    }
    if (currentStep === 2) {
      if (!hasThumbnail) {
        showToast({ type: "error", content: "Thumbnail is required" });
        return;
      }
    }
    if (currentStep === 3) {
      const ok = await trigger(["content", "faqs"]);
      if (!ok) return;
    }

    markStepComplete(currentStep);
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId < currentStep) {
      setDirection(stepId > currentStep ? 1 : -1);
      setCurrentStep(stepId);
    }
  };

  const onSubmit = (formValues: BlogFormValues, submitStatus: "Draft" | "Published") => {
    if (!hasThumbnail && !editBlogId) {
      showToast({ type: "error", content: "Thumbnail is required" });
      setDirection(-1);
      setCurrentStep(2);
      return;
    }
    setPendingStatus(submitStatus);
    mutation.mutate({ ...formValues, status: submitStatus });
  };

  const stripHtml = (html?: string) =>
    (html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const animatedStep = {
    initial: { opacity: 0, x: direction > 0 ? 28 : -28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction > 0 ? -20 : 28 },
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  };

  if (isLoadingBlog) {
    return <AirplaneLoader size="lg" label="Loading blog…" fullPage className="py-20" />;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTES.blogs.list)}
            className="mt-0.5 p-2 rounded-lg border border-white/[0.1] bg-white/[0.03] text-white/60 hover:text-[#F8B400] hover:border-[#F8B400]/30 hover:bg-[#F8B400]/10 transition-all"
            aria-label="Back to blogs"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="ent-gold-bar h-7 shrink-0" />
              {editBlogId ? "Edit Blog" : "Create Blog"}
            </h2>
            <p className="text-sm text-white/55 mt-1.5 ml-[15px]">
              {editBlogId
                ? "Update article details, media, and publish state."
                : "Craft a polished article in a few guided steps."}
            </p>
          </div>
        </div>
        <div className="sm:text-right ml-[15px] sm:ml-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">Status</p>
          <p
            className={
              watchStatus === "Published"
                ? "text-sm font-bold text-emerald-400 mt-0.5"
                : "text-sm font-bold text-[#F8B400] mt-0.5"
            }
          >
            {watchStatus}
          </p>
        </div>
      </div>

      <div className="admin-surface p-4 md:p-5">
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      <form className="admin-surface p-5 sm:p-7 md:p-8 space-y-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            initial={animatedStep.initial}
            animate={animatedStep.animate}
            exit={animatedStep.exit}
            transition={animatedStep.transition}
            className="min-h-[320px]"
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <StepIntro
                  icon={FileText}
                  title="Article basics"
                  description="Title, authorship, and the short summary readers see first."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelClass}>
                      Title <span className="text-[#F8B400]">*</span>
                    </label>
                    <input
                      {...register("title")}
                      className={fieldClass}
                      placeholder="e.g. 10 Hidden Gems in Kerala"
                    />
                    <FieldError message={errors.title?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Category <span className="text-[#F8B400]">*</span>
                    </label>
                    <input
                      {...register("category")}
                      className={fieldClass}
                      placeholder="Travel Tips, Destinations…"
                    />
                    <FieldError message={errors.category?.message} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>
                      Author <span className="text-[#F8B400]">*</span>
                    </label>
                    <input
                      {...register("author")}
                      className={fieldClass}
                      placeholder="Author display name"
                    />
                    <FieldError message={errors.author?.message} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelClass}>Slug</label>
                    <input
                      {...register("slug")}
                      onChange={(e) =>
                        setValue(
                          "slug",
                          e.target.value
                            .toLowerCase()
                            .replace(/[\s_-]+/g, "-")
                            .replace(/[^\w-]/g, "")
                        )
                      }
                      className={fieldClass}
                      placeholder="auto-generated-from-title"
                    />
                    <p className="text-[11px] text-white/35">
                      URL-friendly identifier. Auto-filled from the title on create.
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelClass}>
                      Mini description <span className="text-[#F8B400]">*</span>
                    </label>
                    <textarea
                      {...register("miniDescription")}
                      rows={3}
                      className="admin-field w-full px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none"
                      placeholder="A short teaser for cards and SEO snippets…"
                    />
                    <FieldError message={errors.miniDescription?.message} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <StepIntro
                  icon={ImageIcon}
                  title="Visual media"
                  description="Upload files or paste URLs. Thumbnail is required for new posts."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BlogFormImageUpload
                    label="Thumbnail"
                    required
                    hint="Shown on blog cards and social previews."
                    register={register}
                    urlFieldName="thumbnailImageUrl"
                    altFieldName="thumbnailImageAlt"
                    mode={thumbMode}
                    setMode={setThumbMode}
                    preview={thumbPreview}
                    setPreview={setThumbPreview}
                    setFile={setThumbFile}
                  />
                  <BlogFormImageUpload
                    label="Banner"
                    hint="Optional wide image for the article header."
                    register={register}
                    urlFieldName="bannerImageUrl"
                    altFieldName="bannerImageAlt"
                    mode={bannerMode}
                    setMode={setBannerMode}
                    preview={bannerPreview}
                    setPreview={setBannerPreview}
                    setFile={setBannerFile}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <StepIntro
                  icon={PenLine}
                  title="Blog content"
                  description="Write the full article body, then optionally add FAQs."
                />
                <div className="space-y-2">
                  <label className={labelClass}>
                    Article body <span className="text-[#F8B400]">*</span>
                  </label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor content={field.value} onChange={field.onChange} />
                    )}
                  />
                  <FieldError message={errors.content?.message} />
                </div>
                <div className="border-t border-white/[0.08] pt-6">
                  <BlogFormFaqs
                    fields={fields}
                    append={append}
                    remove={remove}
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <StepIntro
                  icon={Rocket}
                  title="Review & publish"
                  description="Confirm details, then save as draft or publish live."
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <div className="admin-surface-elevated rounded-2xl p-5 space-y-5">
                      <div className="flex items-center gap-2 text-[#F8B400]">
                        <CheckCircle2 size={16} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">
                          Article summary
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <ReviewRow label="Title" value={values.title} />
                        <ReviewRow label="Category" value={values.category} />
                        <ReviewRow label="Author" value={values.author} />
                        <ReviewRow label="Slug" value={values.slug} />
                      </div>
                      <ReviewRow label="Mini description" value={values.miniDescription} />
                      <ReviewRow
                        label="Content preview"
                        value={
                          stripHtml(values.content).slice(0, 220) +
                          (stripHtml(values.content).length > 220 ? "…" : "")
                        }
                      />
                      <ReviewRow
                        label="FAQs"
                        value={
                          values.faqs?.length
                            ? `${values.faqs.length} question${values.faqs.length === 1 ? "" : "s"}`
                            : "None"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="admin-surface-elevated rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                        Thumbnail
                      </p>
                      {thumbPreview ? (
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.1]">
                          <img
                            src={thumbPreview}
                            alt={values.thumbnailImageAlt || "Thumbnail preview"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-dashed border-white/[0.12] flex items-center justify-center text-white/30 text-xs">
                          No thumbnail
                        </div>
                      )}
                    </div>
                    <div className="admin-surface-elevated rounded-2xl p-4 space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                        Banner
                      </p>
                      {bannerPreview ? (
                        <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.1]">
                          <img
                            src={bannerPreview}
                            alt={values.bannerImageAlt || "Banner preview"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-dashed border-white/[0.12] flex items-center justify-center text-white/30 text-xs">
                          Optional
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit((d) => onSubmit(d, "Draft"))}
                    disabled={mutation.isPending}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.07] hover:border-white/20 transition-all disabled:opacity-60"
                  >
                    {mutation.isPending && pendingStatus === "Draft" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Save as Draft"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit((d) => onSubmit(d, "Published"))}
                    disabled={mutation.isPending}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#F8B400] hover:bg-[#e0a200] text-black font-bold text-sm transition-colors shadow-[0_0_24px_rgba(248,180,0,0.22)] disabled:opacity-60"
                  >
                    {mutation.isPending && pendingStatus === "Published" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editBlogId ? (
                      "Update & Publish"
                    ) : (
                      "Publish Blog"
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {currentStep < STEPS.length && (
          <div className="flex justify-between border-t border-white/[0.08] pt-6 gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white/80 font-semibold text-sm hover:text-[#F8B400] hover:border-[#F8B400]/30 hover:bg-[#F8B400]/10 transition-all"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#F8B400] hover:bg-[#e0a200] text-black font-bold text-sm transition-colors shadow-[0_0_20px_rgba(248,180,0,0.18)] min-w-[140px] justify-center"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {currentStep === STEPS.length && (
          <div className="flex justify-start border-t border-white/[0.08] pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white/80 font-semibold text-sm hover:text-[#F8B400] hover:border-[#F8B400]/30 hover:bg-[#F8B400]/10 transition-all"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
