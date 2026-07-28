"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDestination, updateDestination } from "../api/destinations.api";
import { Loader2, X, Check, Image as ImageIcon, Type } from "lucide-react";
import { showToast } from "@/lib/toast";
import axiosClient from '@/lib/apiClient';
import { SelectField } from "@travelagency/forms";
import { GLOBAL_CONFIG } from "@/config/globalConfig";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Destination, destinationSchema, DestinationFormValues } from "../validation/destination.schema";

import { DestinationImageUpload } from "./DestinationImageUpload";

export default function DestinationFormClient({
  initialData,
  totalDestinations,
}: {
  initialData?: Destination | null;
  totalDestinations: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    control,
  } = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      title: "",
      location: "",
      url: "",
      alt: "Popular Destination",
    },
  });

  const imageUrl = watch("url");

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        location: (initialData.location || initialData.Location || "").toLowerCase().trim(),
        url: initialData.url,
        alt: initialData.alt || "Popular Destination",
      });

      if (initialData.url?.includes("cloudinary")) {
        setImageSource("upload");
      } else if (initialData.url) {
        setImageSource("url");
      }
    }
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: (data: DestinationFormValues) => {
      if (initialData?._id) {
        return updateDestination(initialData._id, data);
      }
      return createDestination({ ...data, orderNumber: totalDestinations + 1 });
    },
    onSuccess: () => {
      showToast({ type: "success", content: "Destination saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["adminDestinations"] });
      router.push(ROUTES.destinations.list);
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
      formData.append("folder", "destinations");

      const { data } = await axiosClient.post(ENDPOINTS.client.upload.image, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.url) {
        setValue("url", data.url);
        showToast({ type: "success", content: "Image uploaded successfully" });
      }
    } catch (error: any) {
      showToast({ type: "error", content: "Upload failed: " + error.message });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: DestinationFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
        <div className="p-10 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <ImageIcon size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-neutral-800 tracking-tight">{initialData ? "Edit Destination" : "Add New Destination"}</h2>
              <p className="text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">Manage popular destination tiles</p>
            </div>
          </div>
          <button onClick={() => router.push(ROUTES.destinations.list)} className="p-3 rounded-2xl text-neutral-400 hover:bg-neutral-100 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Image Selector */}
            <DestinationImageUpload 
              imageUrl={imageUrl}
              imageSource={imageSource}
              setImageSource={setImageSource}
              uploading={uploading}
              handleImageUpload={handleImageUpload}
              setValue={setValue}
              register={register}
              errors={errors}
            />

            {/* Right Column: Text Inputs */}
            <div className="space-y-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Type size={16} className="text-primary" />
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none">Destination Name</label>
                </div>
                <input
                  {...register("title")}
                  className="w-full px-6 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                  placeholder="e.g., Kuala Lumpur"
                />
                {errors.title && <p className="text-red-500 text-xs font-bold pl-2">{errors.title.message}</p>}
              </div>

              <div className="space-y-4">
                <SelectField
                  control={control as any}
                  name="location"
                  label="City"
                  variant="floating"
                  options={GLOBAL_CONFIG.destinations.map(d => ({ value: d.value, label: d.label }))}
                />
                <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1 px-1 italic">Selecting a city automatically maps the search navigation link.</p>
                {errors.location && <p className="text-red-500 text-xs font-bold pl-2">{errors.location.message}</p>}
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={mutation.isPending || uploading}
                  className="w-full bg-primary text-white h-16 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {mutation.isPending ? <Loader2 size={24} className="animate-spin mx-auto" /> : (initialData ? "UPDATE DESTINATION" : "SAVE DESTINATION")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

