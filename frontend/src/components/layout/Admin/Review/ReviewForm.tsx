import { useState, useEffect, useContext, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { showToast } from "@/lib/utils";
import { Loader2, ArrowLeft, Image as ImageIcon, Star, MapPin, User, FileText } from "lucide-react";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";
import { createReview, updateReview, getAdminReviews, uploadReviewImage } from "@/api/admin/review.api";

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  content: z.string().min(10, "Review content must be at least 10 characters"),
  location: z.string().min(2, "Location/Category is required"),
  rating: z.number().min(1).max(5),
  profileImageUrl: z.string().optional(),
  profileImageAlt: z.string().optional(),
  status: z.enum(["Draft", "Published"]),
  orderNumber: z.number().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewForm({ editReviewId }: { editReviewId: string | null }) {
  const context = useContext(AdminPanelContext);
  const setActive = context?.setActive;
  const setEditId = context?.setEditId;
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");

  // Fetch all reviews to find the next orderNumber if creating new
  const { data: allReviews } = useQuery({
    queryKey: ["adminReviews"],
    queryFn: () => getAdminReviews(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      content: "",
      location: "",
      rating: 5,
      profileImageUrl: "",
      profileImageAlt: "",
      status: "Draft",
    },
  });

  const watchUrl = watch("profileImageUrl");

  // Find the specific review data if editing
  const reviewToEdit = allReviews?.find((r: any) => r._id === editReviewId);

  useEffect(() => {
    if (reviewToEdit) {
      reset({
        name: reviewToEdit.name,
        content: reviewToEdit.content,
        location: reviewToEdit.location,
        rating: reviewToEdit.rating,
        profileImageUrl: reviewToEdit.profileImage?.url || "",
        profileImageAlt: reviewToEdit.profileImage?.alt || "",
        status: reviewToEdit.status as "Draft" | "Published",
        orderNumber: reviewToEdit.orderNumber,
      });
      if (reviewToEdit.profileImage?.url) {
        setImagePreview(reviewToEdit.profileImage.url);
        // Detect source
        if (reviewToEdit.profileImage.url.includes("cloudinary")) {
          setImageSource("upload");
        } else {
          setImageSource("url");
        }
      }
    } else if (!editReviewId && allReviews) {
        // Auto-increment Order Number for new review
        const nextOrder = Math.max(0, ...allReviews.map((r: any) => r.orderNumber || 0)) + 1;
        setValue("orderNumber", nextOrder);
    }
  }, [reviewToEdit, allReviews, reset, editReviewId, setValue]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setImageFile(acceptedFiles[0]);
      setImagePreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const mutation = useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      let profileImageUrl = imageSource === "url" ? values.profileImageUrl : (imagePreview?.startsWith("blob:") ? "" : imagePreview);

      if (imageFile && imageSource === "upload") {
        setUploading(true);
        try {
          const uploadRes = await uploadReviewImage(imageFile);
          profileImageUrl = uploadRes.url;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        ...values,
        profileImage: {
          url: profileImageUrl || "",
          alt: values.profileImageAlt || values.name,
        },
      };

      if (editReviewId) {
        return updateReview(editReviewId, payload);
      } else {
        return createReview(payload);
      }
    },
    onSuccess: () => {
      showToast({
        type: "success",
        content: `Review ${editReviewId ? "updated" : "created"} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      setActive?.("AllReviews");
    },
    onError: (error: any) => {
      showToast({ type: "error", content: error.message || "Failed to save review" });
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    if (imageSource === "upload" && !imagePreview && !imageFile) {
      showToast({ type: "error", content: "Profile image is required" });
      return;
    }
    if (imageSource === "url" && !values.profileImageUrl) {
        showToast({ type: "error", content: "Profile image URL is required" });
        return;
    }
    mutation.mutate(values);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setActive?.("AllReviews")}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-neutral-800">
          {editReviewId ? "Edit Testimonial" : "Create New Testimonial"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <User size={16} className="text-primary" /> Reviewer Name *
              </label>
              <input
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="e.g. John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Location / Category *
              </label>
              <input
                {...register("location")}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="e.g. Batu Caves Half Day Tour"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Star size={16} className="text-primary" /> Rating (1-5) *
                </label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-1 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className={`p-1.5 rounded-lg transition-all ${field.value >= star ? "text-amber-400 bg-amber-50" : "text-neutral-300 hover:bg-neutral-100"}`}
                        >
                          <Star size={20} fill={field.value >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="hidden">
                <input
                  type="number"
                  {...register("orderNumber", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Review Content *
              </label>
              <textarea
                {...register("content")}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none leading-relaxed"
                placeholder="What did the customer say about their experience?"
              />
              {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
            </div>
          </div>

          {/* Right Column: Image & Status */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center mr-10">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                    <ImageIcon size={16} className="text-primary" /> Profile Image *
                </label>
                <div className="flex bg-neutral-100 p-1 rounded-lg gap-1 border border-neutral-200 shadow-inner">
                    {(["upload", "url"] as const).map((source) => (
                        <button
                            key={source}
                            type="button"
                            onClick={() => setImageSource(source)}
                            className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                                imageSource === source 
                                ? "bg-white text-primary shadow-sm" 
                                : "text-neutral-400 hover:text-neutral-600"
                            }`}
                        >
                            {source}
                        </button>
                    ))}
                </div>
              </div>

              {imageSource === "upload" ? (
                <div
                    {...getRootProps()}
                    className={`border-4 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all aspect-square max-w-[350px] mx-auto border-neutral-200 hover:border-primary/40 hover:bg-primary/5 ${
                    imagePreview ? "border-primary/20 bg-neutral-50/50" : "bg-neutral-50"
                    }`}
                >
                    <input {...getInputProps()} />
                    {imagePreview ? (
                    <div className="relative w-full h-full group">
                        <img src={imagePreview} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="Preview" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                        <p className="text-white text-sm font-extrabold uppercase tracking-widest">Change Photo</p>
                        </div>
                    </div>
                    ) : (
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-neutral-100 text-neutral-300 group-hover:text-primary transition-colors">
                        <ImageIcon size={32} />
                        </div>
                        <p className="text-sm text-neutral-600 font-bold uppercase tracking-widest mb-1">Upload Photo</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Drag & drop or click to browse</p>
                    </div>
                    )}
                </div>
              ) : (
                <div className="space-y-4 max-w-[350px] mx-auto">
                    <div 
                        className={`border-2 border-neutral-200 rounded-3xl overflow-hidden aspect-square flex flex-col items-center justify-center bg-neutral-50 relative group transition-all ${watchUrl ? "ring-2 ring-primary/20" : ""}`}
                    >
                        {watchUrl ? (
                            <img src={watchUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.src = "https://placehold.co/400?text=Invalid+Image+URL")} />
                        ) : (
                            <div className="text-neutral-300">
                                <ImageIcon size={48} />
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 py-2 bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Link Preview</p>
                        </div>
                    </div>
                    <input
                        {...register("profileImageUrl")}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                        placeholder="Paste profile image URL here..."
                    />
                </div>
              )}
              <div className="space-y-1 max-w-[350px] mx-auto">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Image Alt Text (SEO)</p>
                <input
                    {...register("profileImageAlt")}
                    className="w-full px-4 py-2 text-xs rounded-lg border border-neutral-200 focus:border-primary outline-none"
                    placeholder="e.g. Happy customer at Batu Caves"
                />
              </div>
            </div>

            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="text-sm font-bold text-neutral-700 block mb-4">Post Status</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setValue("status", "Draft")}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                        watch("status") === "Draft" 
                        ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-200/50" 
                        : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    DRAFT
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("status", "Published")}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border ${
                        watch("status") === "Published" 
                        ? "bg-green-50 border-green-200 text-green-600 shadow-sm shadow-green-200/50" 
                        : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-300"
                    }`}
                  >
                    PUBLISHED
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed italic">
                    {watch("status") === "Published" 
                        ? "🚀 This review will be immediately visible on the website." 
                        : "📝 Review will be saved but won't be shown to visitors."}
                </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-10 border-t border-neutral-100 flex justify-end items-center gap-4">
            <button
                type="button"
                onClick={() => {
                    setEditId?.(null);
                    setActive?.("AllReviews");
                }}
                className="px-8 py-3.5 rounded-2xl font-bold text-sm text-neutral-500 hover:bg-neutral-50 transition-all border border-neutral-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={mutation.isPending || uploading}
                className="px-10 py-3.5 rounded-2xl bg-primary text-white font-black text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-xl shadow-primary/30 flex items-center gap-3 active:scale-[0.98]"
            >
                {(mutation.isPending || uploading) && <Loader2 size={18} className="animate-spin" />}
                {uploading ? "UPLOADING..." : (mutation.isPending ? "SAVING..." : (editReviewId ? "UPDATE REVIEW" : "CREATE REVIEW"))}
            </button>
        </div>
      </form>
    </div>
  );
}
