"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview, updateReview } from "../api/reviews.api";
import { Loader2, X, Check, Image as ImageIcon, Star, MapPin, Quote } from "lucide-react";
import { showToast } from "@/lib/toast";
import axiosClient from "@/api/axiosClient";
import { useRouter } from "next/navigation";
import { Review, reviewSchema, ReviewFormValues } from "../validation/review.schema";

export default function ReviewFormClient({
  initialData,
  totalReviews,
}: {
  initialData?: Review | null;
  totalReviews: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      location: "",
      rating: 5,
      content: "",
      status: "Published",
      profileImage: { url: "", public_id: "" }
    },
  });

  const rating = watch("rating");
  const profileImageUrl = watch("profileImage.url");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        location: initialData.location,
        rating: initialData.rating,
        content: initialData.content,
        status: initialData.status,
        profileImage: initialData.profileImage || { url: "", public_id: "" }
      });
    }
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: (data: ReviewFormValues) => {
      if (initialData?._id) {
        return updateReview(initialData._id, data);
      }
      return createReview({ ...data, orderNumber: totalReviews + 1 });
    },
    onSuccess: () => {
      showToast({ type: "success", content: "Review saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      router.push("/admin/reviews");
      router.refresh();
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err.response?.data?.message || err.message || "Operation failed" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "reviews");

      const { data } = await axiosClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.url) {
        setValue("profileImage", { url: data.url, public_id: data.public_id || "" });
        showToast({ type: "success", content: "Image uploaded successfully" });
      }
    } catch (error: any) {
      showToast({ type: "error", content: "Upload failed: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setValue("profileImage", { url: "", public_id: "" });
  };

  const onSubmit = (data: ReviewFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
        <div className="p-8 sm:p-10 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Quote size={28} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-800 tracking-tight">
                {initialData ? "Edit Review" : "Add New Review"}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">
                Manage customer testimonials
              </p>
            </div>
          </div>
          <button onClick={() => router.push("/admin/reviews")} className="p-3 rounded-2xl text-neutral-400 hover:bg-neutral-100 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Image & Quick Settings */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Reviewer Photo</label>
                {!profileImageUrl ? (
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    <div className="aspect-square rounded-[32px] border-4 border-dashed border-neutral-100 bg-neutral-50/50 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5">
                      {uploading ? (
                        <Loader2 size={32} className="text-primary/40 animate-spin" />
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                            <ImageIcon size={24} className="text-primary/40" />
                          </div>
                          <p className="text-xs font-black text-neutral-400 tracking-tight">Upload Photo</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative group aspect-square rounded-[32px] overflow-hidden shadow-xl ring-1 ring-neutral-200">
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={removeImage} className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 bg-neutral-50 p-6 rounded-[24px] border border-neutral-100">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Status</label>
                <div className="flex gap-2">
                  {["Published", "Draft"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setValue("status", status as "Published" | "Draft")}
                      className={"flex-1 py-3 rounded-xl text-xs font-bold transition-all "}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Reviewer Name</label>
                  <input
                    {...register("name")}
                    className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="e.g., Sarah Johnson"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-bold">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={12} className="text-primary" /> Location
                  </label>
                  <input
                    {...register("location")}
                    className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="e.g., New York, USA"
                  />
                  {errors.location && <p className="text-red-500 text-xs font-bold">{errors.location.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      onClick={() => setValue("rating", star)}
                      className="p-2 transition-all hover:scale-110 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={"transition-colors "}
                      />
                    </button>
                  ))}
                  <span className="ml-4 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 font-black text-sm">
                    {rating} / 5
                  </span>
                </div>
                {errors.rating && <p className="text-red-500 text-xs font-bold">{errors.rating.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Review Content</label>
                <textarea
                  {...register("content")}
                  className="w-full px-5 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium min-h-[160px] resize-none"
                  placeholder="Write the customer's testimonial here..."
                />
                <div className="flex justify-between items-center">
                  {errors.content ? (
                    <p className="text-red-500 text-xs font-bold">{errors.content.message}</p>
                  ) : (
                    <p className="text-neutral-400 text-xs font-medium">Recommended: 2-3 sentences for best layout.</p>
                  )}
                  <span className={"text-xs font-bold "}>
                    {watch("content")?.length || 0} / 500
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={mutation.isPending || uploading}
                  className="w-full bg-primary text-white h-16 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? <Loader2 size={24} className="animate-spin mx-auto" /> : (initialData ? "UPDATE REVIEW" : "SAVE REVIEW")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
