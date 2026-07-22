import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createDestination, updateDestination, getDestinations } from "@/api/admin/destination.api";
import { Loader2, X, Check, Image as ImageIcon, Type } from "lucide-react";
import { showToast } from "@/lib/utils";
import axiosClient from "@/api/axiosClient";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";
import { SelectField } from "@/components/forms/SelectField";
import { GLOBAL_CONFIG } from "@/config/globalConfig";

const destinationSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  location: z.string().min(1, "Please select a target city"),
  url: z.string().url("Please upload or provide a valid image URL"),
  alt: z.string().optional(),
});

type DestinationFormValues = z.infer<typeof destinationSchema>;

export default function DestinationForm() {
  const context = useContext(AdminPanelContext);
  const setActive = context?.setActive;
  const editId = context?.editId;
  const setEditId = context?.setEditId;

  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [initializedId, setInitializedId] = useState<string | null | "new">(null);

  const { data: destinations = [] } = useQuery({
    queryKey: ["adminDestinations"],
    queryFn: getDestinations,
  });

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
    if (editId) {
      // If we've already initialized this specific edit, skip
      if (initializedId === editId) return;
      const destToEdit = destinations.find((d: any) => d._id === editId);
      if (destToEdit) {
        reset({
          title: destToEdit.title,
          location: (destToEdit.location || destToEdit.Location || "").toLowerCase().trim(),
          url: destToEdit.url,
          alt: destToEdit.alt || "Popular Destination",
        });

        // Auto-detect source
        if (destToEdit.url.includes("cloudinary")) {
          setImageSource("upload");
        } else if (destToEdit.url) {
          setImageSource("url");
        }

        setInitializedId(editId);
      }
    } else {
      // If we are already in 'new' mode, skip
      if (initializedId === "new") return;

      reset({
        title: "",
        location: "",
        url: "",
        alt: "Popular Destination",
      });
      setImageSource("upload");
      setInitializedId("new");
    }
  }, [editId, destinations, reset, initializedId]);

  const mutation = useMutation({
    mutationFn: (data: DestinationFormValues) => {
      if (editId) {
        return updateDestination(editId, data);
      }
      return createDestination({ ...data, orderNumber: destinations.length + 1 });
    },
    onSuccess: () => {
      showToast({ type: "success", content: `Destination ${editId ? "updated" : "added"} successfully!` });
      queryClient.invalidateQueries({ queryKey: ["adminDestinations"] });
      setEditId?.(null);
      setActive?.("AllDestinations");
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

      const { data } = await axiosClient.post("/upload/image", formData, {
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

  const handleBack = () => {
    setEditId?.(null);
    setActive?.("AllDestinations");
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
              <h2 className="text-3xl font-black text-neutral-800 tracking-tight">{editId ? "Edit Destination" : "Add New Destination"}</h2>
              <p className="text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">Manage popular destination tiles</p>
            </div>
          </div>
          <button onClick={handleBack} className="p-3 rounded-2xl text-neutral-400 hover:bg-neutral-100 transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Image Selector */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Destination Visual</label>
                <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
                  {(["upload", "url"] as const).map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setImageSource(source)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${imageSource === source
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
                !imageUrl ? (
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                    />
                    <div className="h-[320px] rounded-[32px] border-4 border-dashed border-neutral-100 bg-neutral-50/50 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5">
                      {uploading ? (
                        <Loader2 size={48} className="text-primary/40 animate-spin" />
                      ) : (
                        <>
                          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                            <ImageIcon size={32} className="text-primary/40" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-neutral-800 tracking-tight">Click to Upload Image</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">Recommended: High Resolution</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative group rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-neutral-200">
                    <img src={imageUrl} alt="Preview" className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button type="button" onClick={() => setValue("url", "")} className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <X size={20} />
                      </button>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                        <Check size={20} />
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="h-[240px] rounded-[32px] overflow-hidden border border-neutral-100 bg-neutral-50 relative group">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Link Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+URL")} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      {...register("url")}
                      className="w-full px-6 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
                      placeholder="Paste external image URL here..."
                    />
                  </div>
                </div>
              )}
              {errors.url && <p className="text-red-500 text-xs font-bold pl-2">{errors.url.message}</p>}
            </div>

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
                  control={control}
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
                  {mutation.isPending ? <Loader2 size={24} className="animate-spin mx-auto" /> : (editId ? "UPDATE DESTINATION" : "SAVE DESTINATION")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
