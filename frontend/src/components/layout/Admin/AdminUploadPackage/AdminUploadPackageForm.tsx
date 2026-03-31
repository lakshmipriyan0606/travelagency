import {
  Package,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  Tag,
  Upload,
  X,
  Plus,
  Loader2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { ReusableTextArea } from "@/components/forms/ReusableTextArea";
import { SelectField } from "@/components/forms/SelectField";
import { ReusableCheckbox } from "@/components/forms/ReusableCheckbox";
import { packageTypes, rankOptions, statusOptions, activityCategoryOptions } from "./constant";
import { destinationOptions } from "@/config/destinations";
import { ItineraryDaySection } from "./ItineraryDaySection";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { CreatePackage, UpdatePackage, GetCurrentPackageDetail } from "@/api/admin/auth.api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";

// ... schemas remain the same ...
const slotSchema = z.object({
  slotType: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.any().optional(),
  imageAlt: z.string().optional(), // Added imageAlt
});

const daySchema = z.object({
  dayTitle: z.string(),
  slots: z.array(slotSchema),
});

const formSchema = z.object({
  packageName: z.string().min(1, "Required"),
  packageDescription: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  packageType: z.string().min(1, "Required"),
  daysAndNights: z.string().min(1, "Required"),
  hotelName: z.string().min(1, "Required"),
  price: z.string().min(1, "Required"),
  offerPrice: z.string().min(1, "Required"),
  isBestPackage: z.boolean(),
  bestRank: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isActive: z.boolean().default(true),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  activityCategory: z.string().optional(),
  days: z.array(daySchema),
  seo: z.object({ // Added SEO
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }).optional(),
});


type FormData = z.infer<typeof formSchema>;

interface MainImagesUploaderProps {
  mainImageFiles: { file: File; alt: string }[];
  setMainImageFiles: React.Dispatch<React.SetStateAction<{ file: File; alt: string }[]>>;
  mainImageUrls: { url: string; alt: string }[];
  setMainImageUrls: React.Dispatch<React.SetStateAction<{ url: string; alt: string }[]>>;
}

function MainImagesUploader({ mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls }: MainImagesUploaderProps) {
  const [urlInput, setUrlInput] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ file, alt: "" }));
    setMainImageFiles(prev => [...prev, ...newFiles]);
  }, [setMainImageFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setMainImageUrls(prev => [...prev, { url: urlInput.trim(), alt: "" }]);
    setUrlInput("");
  };

  const removeFile = (index: number) => {
    setMainImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUrl = (index: number) => {
    setMainImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateUrlAlt = (index: number, alt: string) => {
    setMainImageUrls(prev => prev.map((item, i) => i === index ? { ...item, alt } : item));
  };

  const updateFileAlt = (index: number, alt: string) => {
    setMainImageFiles(prev => prev.map((item, i) => i === index ? { ...item, alt } : item));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Box */}
        <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${isDragActive ? "border-primary bg-primary/5 shadow-inner" : "border-neutral-200 hover:border-primary/50 hover:bg-neutral-50"}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-neutral-700 text-xs font-bold uppercase tracking-tight">Drop Image Here</p>
              <p className="text-neutral-400 text-[10px] mt-0.5 font-medium">Click to browse your files</p>
            </div>
          </div>
        </div>

        {/* URL Box */}
        <div className="border border-neutral-200 rounded-3xl p-6 bg-neutral-50/30 flex flex-col justify-center">
          <p className="text-neutral-700 text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Pasted URL from Gallery</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://cloudinary.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
              className="flex-1 bg-white border border-neutral-200 px-3 py-2 rounded-xl text-xs focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
            />
            <Button type="button" onClick={handleAddUrl} size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase">Add</Button>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2 font-medium italic">Paste images from your Media Gallery here</p>
        </div>
      </div>

      {(mainImageUrls.length > 0 || mainImageFiles.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mainImageUrls.map((item, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-sm border border-neutral-200 bg-white">
              <div className="aspect-video relative">
                <img src={item.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-tighter shadow-sm z-10">By URL</span>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Image Alt Text..."
                  value={item.alt}
                  onChange={(e) => updateUrlAlt(idx, e.target.value)}
                  className="w-full text-[10px] border border-neutral-100 rounded-lg px-2 py-1.5 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          ))}

          {mainImageFiles.map((item, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-sm border border-neutral-200 bg-white">
              <div className="aspect-video relative">
                <img src={URL.createObjectURL(item.file)} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded uppercase tracking-tighter shadow-sm z-10">Uploaded</span>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Image Alt Text..."
                  value={item.alt}
                  onChange={(e) => updateFileAlt(idx, e.target.value)}
                  className="w-full text-[10px] border border-neutral-100 rounded-lg px-2 py-1.5 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-3 justify-center pt-4">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
      <Icon size={18} />
    </div>
    <div>
      <h3 className="text-[15px] font-bold text-neutral-800 tracking-tight leading-none">{title}</h3>
      {subtitle && <p className="text-[9px] text-neutral-400 mt-1 font-medium italic">{subtitle}</p>}
    </div>
  </div>
);

const StyledField = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-2 rounded-lg hover:bg-neutral-50/10 transition-all group ${className}`}>
    {children}
  </div>
);

export default function AdminUploadPackageForm({ isActivity = false }: { isActivity?: boolean }) {
  const context = useContext(AdminPanelContext);
  if (!context) throw new Error("AdminUploadPackageForm must be used within AdminPanelContext");
  const { editId: id, setActive, triggerRefresh } = context;

  const [mainImageFiles, setMainImageFiles] = useState<{ file: File; alt: string }[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<{ url: string; alt: string }[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Core Details", subtitle: "Identity & Location", icon: Package },
    { title: "Pricing & Visibility", subtitle: "Rates & Status", icon: Tag },
    { title: "Media Gallery", subtitle: "Visual Assets", icon: ImageIcon },
    { title: "Journey Roadmap", subtitle: "Daily Itinerary", icon: Calendar },
  ];

  const createMutation = useMutationAPIQuery(CreatePackage, {
    onSuccess: () => {
      toast.success("Package created successfully!");
      reset();
      setActive("AllPackages");
      triggerRefresh?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create package");
    }
  });

  const updateMutation = useMutationAPIQuery((data: any) => UpdatePackage(data, id), {
    onSuccess: () => {
      toast.success("Package updated successfully!");
      reset();
      setActive("AllPackages");
      triggerRefresh?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update package");
    }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { data } = UseFetchAPIQuery({
    key: ["currentPackageDetail", { id }],
    queryFn: async () => GetCurrentPackageDetail(id),
    options: { enabled: !!id }
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      packageName: "",
      packageDescription: "",
      location: "",
      packageType: "",
      daysAndNights: "",
      hotelName: "",
      price: "",
      offerPrice: "",
      isBestPackage: false,
      isActive: true,
      country: "Malaysia",
      bestRank: "",
      status: "Active",
      activityCategory: "",
      days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "", imageAlt: "" }] }],
      seo: { title: "", description: "", keywords: "" }
    },
    mode: 'onChange'
  });


  const { control, handleSubmit, watch, reset, formState } = methods;

  useEffect(() => {
    if (!id || !data?.data) return;
    const pkg = data.data;
    reset({
      packageName: pkg.packageName || '',
      packageDescription: pkg.packageDescription || '',
      location: pkg.location || "",
      packageType: pkg.packageType || "",
      daysAndNights: pkg.daysAndNights || "",
      hotelName: pkg.hotelName || "",
      price: pkg.price?.toString() || "",
      offerPrice: pkg.offerPrice?.toString() || "",
      isBestPackage: pkg.isBestPackage || false,
      bestRank: pkg.bestRank?.toString() || "",
      country: pkg.country || "Malaysia",
      isActive: pkg.isActive !== false,
      status: pkg.status || "Active",
      activityCategory: pkg.activityCategory || "",
      days: (pkg.days || []).map((day: any) => ({
        dayTitle: day.dayTitle || "",
        slots: (day.slots || []).map((slot: any) => ({
          slotType: slot.slotType || "",
          title: slot.title || "",
          description: slot.description || "",
          imageUrl: slot.imageUrl || "",
          imageAlt: slot.imageAlt || "",
        })),
      })),
      seo: {
        title: pkg.seo?.title || "",
        description: pkg.seo?.description || "",
        keywords: pkg.seo?.keywords || "",
      }
    });
    setMainImageUrls(pkg.images?.map((img: any) => typeof img === 'string' ? { url: img, alt: "" } : img) || []);
    setMainImageFiles([]);
  }, [id, data?.data, reset]);

  const onSubmit = async (values: any) => {
    // SECURITY: Ensure we are absolutely on the last step before submitting
    const isLastStep = activeStep === steps.length - 1;
    if (!isLastStep) return;

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key !== "days" && key !== "seo") {
          // "none" means the user chose "No Activity" — send empty string to backend
          const sanitized = key === "activityCategory" && val === "none" ? "" : val;
          formData.append(key, sanitized as any);
        }
      });

      formData.append("seo", JSON.stringify(values.seo));
      formData.append("existingImages", JSON.stringify(mainImageUrls));

      const newFiles = mainImageFiles.map(f => f.file);
      const newAlts = mainImageFiles.map(f => f.alt);

      newFiles.forEach(file => formData.append("images", file));
      formData.append("mainImageAlts", JSON.stringify(newAlts));

      const daysClean = values.days.map((day: any) => ({
        dayTitle: day.dayTitle,
        slots: day.slots.map((slot: any) => ({
          slotType: slot.slotType,
          title: slot.title,
          description: slot.description,
          imageUrl: slot.imageUrl instanceof File ? undefined : slot.imageUrl,
          imageAlt: slot.imageAlt,
        }))
      }));
      formData.append("days", JSON.stringify(daysClean));

      values.days.forEach((day: any, dIndex: number) => {
        day.slots.forEach((slot: any, sIndex: number) => {
          if (slot.imageUrl instanceof File) {
            formData.append(`slotImage_${dIndex}_${sIndex}`, slot.imageUrl);
          }
        });
      });

      if (id) {
        await updateMutation.mutateAsync(formData);
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };


  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    // Only validate the fields in the current step if needed, or validate all for simplicity
    const fieldsByStep = [
      ["packageName", "packageDescription", "location", "country", "packageType", "daysAndNights"],
      ["price", "offerPrice", "hotelName", "status", "isActive", "isBestPackage", "bestRank"],
      [], // Media step
      ["days"]
    ];

    const isStepValid = await methods.trigger(fieldsByStep[activeStep] as any);
    if (isStepValid) setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const { fields: dayFields, append: addDay, remove: removeDay } = useFieldArray({ control, name: "days" });


  return (
    <FormProvider {...methods}>
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              {isActivity ? "Create Activity" : (id ? "Sync Changes" : "Create Adventure")}
            </h1>
            <p className="text-[10px] text-neutral-500 mt-1 font-semibold ml-4 uppercase tracking-wider opacity-70">
              Step {activeStep + 1} of {steps.length}: {steps[activeStep].title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${id ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-primary/10 text-primary border-primary/20"}`}>
              {id ? "Update Mode" : "New Package"}
            </span>
            {formState.isDirty && (
              <div className="flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Unsaved</span>
              </div>
            )}
          </div>
        </div>

        {/* Stepper Logic */}
        <div className="px-4">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto mb-6">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = activeStep > idx;
              const isActive = activeStep === idx;

              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => idx < activeStep && setActiveStep(idx)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${isActive ? "bg-primary text-white border-white shadow-xl shadow-primary/30 scale-110" :
                      isCompleted ? "bg-neutral-800 text-white border-white shadow-lg" :
                        "bg-white text-neutral-300 border-neutral-50 shadow-sm"
                      }`}
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </button>
                  <div className="absolute -bottom-8 whitespace-nowrap text-center">
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-primary scale-105" : "text-neutral-400 opacity-60"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
        >
          <div className="px-4">
            {activeStep === 0 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                {/* General Information */}
                <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all">
                  <SectionHeader icon={Package} title="General Information" subtitle="Define the core identity of this travel package" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
                    <StyledField className="md:col-span-2">
                      <ReusableInput control={control} name="packageName" label="Package Name" required variant="floating" />
                    </StyledField>
                    <StyledField className="md:col-span-2">
                      <ReusableTextArea control={control} name="packageDescription" label="Detailed Description" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <SelectField control={control} name="location" label="Main Location" options={destinationOptions} required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="country" label="Country" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <SelectField control={control} name="packageType" label="Category" options={packageTypes} required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="daysAndNights" label="Duration" placeholder="e.g. 3 Days, 2 Nights" required variant="floating" />
                    </StyledField>
                    {/* Only show activity category if in Create Activity mode OR if editing an existing activity package */}
                    {(isActivity || (id && data?.data?.activityCategory && data?.data?.activityCategory !== "none")) && (
                      <StyledField>
                        <SelectField
                          control={control}
                          name="activityCategory"
                          label="Activity Category"
                          options={activityCategoryOptions}
                          variant="floating"
                          required
                        />
                        {!watch("activityCategory") && (
                          <p className="text-[10px] text-amber-600 font-bold mt-1 animate-pulse">
                            ⚠️ Please select an activity category for this to show in the Activity section!
                          </p>
                        )}
                      </StyledField>
                    )}
                  </div>
                </Card>

                {/* SEO Configuration */}
                <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all mt-6">
                  <SectionHeader icon={Tag} title="SEO Configuration" subtitle="Optimize your package for search engines" />
                  <div className="grid grid-cols-1 gap-1 mt-2">
                    <StyledField>
                      <ReusableInput control={control} name="seo.title" label="SEO Title" variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableTextArea control={control} name="seo.description" label="SEO Description" variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="seo.keywords" label="SEO Keywords" variant="floating" />
                    </StyledField>
                  </div>
                </Card>
              </div>
            )}


            {activeStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-2">
                <Card className="lg:col-span-2 p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] bg-white/80 backdrop-blur-md">
                  <SectionHeader icon={Tag} title="Pricing Details" subtitle="Set the value and competitive offers" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <StyledField>
                      <ReusableInput control={control} name="price" label="Price (RM)" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="offerPrice" label="Offer (RM)" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="hotelName" label="Hotel Name" placeholder="e.g. Grand Mercure" required variant="floating" />
                    </StyledField>
                  </div>
                  <div className="mt-8 flex items-center justify-between bg-primary/5 rounded-2xl border border-primary/10 border-dashed p-5">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Recommended Discount</p>
                      <p className="text-xs text-neutral-500 font-medium italic">Automatically calculated based on pricing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-neutral-800 tracking-tighter">
                        {Number(watch("price")) > 0 ? Math.round(((Number(watch("price")) - Number(watch("offerPrice"))) / Number(watch("price"))) * 100) : 0}%
                        <span className="text-lg text-primary ml-1">OFF</span>
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border border-neutral-200/60 shadow-2xl shadow-neutral-200/40 rounded-[32px] bg-white/80 backdrop-blur-md">
                  <SectionHeader icon={Eye} title="Visibility" subtitle="Platform status" />
                  <div className="space-y-5 mt-6">
                    <StyledField>
                      <SelectField control={control} name="status" label="System Status" options={statusOptions} required variant="floating" />
                    </StyledField>
                    <div className="flex items-center gap-3">
                      <StyledField className="flex-1">
                        <ReusableCheckbox control={control} name="isActive" label="Live Website" />
                      </StyledField>
                      <StyledField className={`flex-1 ${watch("isBestPackage") ? "border-primary/50 bg-primary/5 shadow-inner" : ""}`}>
                        <ReusableCheckbox control={control} name="isBestPackage" label="Promoted" />
                      </StyledField>
                    </div>
                    {watch("isBestPackage") && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <SelectField control={control} name="bestRank" label="Promotion Rank" options={rankOptions} required variant="floating" />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {activeStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="p-8 border border-neutral-200/60 shadow-2xl shadow-neutral-200/40 rounded-[32px] bg-white/80 backdrop-blur-md">
                  <SectionHeader icon={ImageIcon} title="Main Image" subtitle="High-quality visuals for your package" />
                  <div className="mt-6">
                    <MainImagesUploader
                      mainImageFiles={mainImageFiles}
                      setMainImageFiles={setMainImageFiles}
                      mainImageUrls={mainImageUrls}
                      setMainImageUrls={setMainImageUrls}
                    />
                  </div>
                </Card>
              </div>
            )}

            {activeStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <SectionHeader icon={Calendar} title="Journey Roadmap" subtitle="Day-by-day experience plan" />
                  <Button
                    type="button"
                    onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "", imageAlt: "" }] })}
                    className="bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl font-bold text-[10px] gap-2 py-4 px-6 shadow-lg shadow-neutral-200 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-neutral-700 uppercase tracking-wider"
                  >
                    <Plus size={14} /> Add Day
                  </Button>
                </div>

                <div className="space-y-6">
                  {dayFields.map((day, index) => (
                    <ItineraryDaySection key={day.id} control={control} dayIndex={index} removeDay={removeDay} />
                  ))}
                  {dayFields.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-neutral-100 rounded-[24px] bg-neutral-50/50">
                      <Calendar size={32} className="mx-auto text-neutral-200 mb-3" />
                      <p className="text-neutral-400 font-semibold uppercase tracking-wider text-[9px]">No days added yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="sticky bottom-6 z-50 px-4 mt-12">
            <div className="max-w-3xl mx-auto flex items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-[24px] border border-white shadow-xl shadow-neutral-200">
              {activeStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-all"
                >
                  Back
                </button>
              )}

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="flex-1 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-white bg-neutral-800 hover:bg-neutral-900 shadow-lg shadow-neutral-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !formState.isDirty}
                  className={`flex-1 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${isSubmitting || !formState.isDirty ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" : "bg-gradient-to-r from-primary to-[#F69520] text-white hover:shadow-primary/40 active:scale-[0.99]"}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>{id ? "Sync Changes" : "Launch Package"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
