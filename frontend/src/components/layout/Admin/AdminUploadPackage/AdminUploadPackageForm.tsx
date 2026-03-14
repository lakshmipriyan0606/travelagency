import {
  Package,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Tag,
  Upload,
  X,
  Plus,
  Loader2,
  ArrowRight
} from "lucide-react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { SelectField } from "@/components/forms/SelectField";
import { ReusableTextArea } from "@/components/forms/ReusableTextArea";
import { ReusableCheckbox } from "@/components/forms/ReusableCheckbox";
import { packageTypes, daysOptions, rankOptions, statusOptions } from "./constant";
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
  rating: z.string().min(1, "Required"),
  price: z.string().min(1, "Required"),
  offerPrice: z.string().min(1, "Required"),
  isBestPackage: z.boolean(),
  bestRank: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isActive: z.boolean().default(true),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  days: z.array(daySchema),
});

type FormData = z.infer<typeof formSchema>;

interface MainImagesUploaderProps {
  mainImageFiles: File[];
  setMainImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  mainImageUrls: string[];
  setMainImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
}

function MainImagesUploader({ mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls }: MainImagesUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setMainImageFiles(prev => [...prev, ...acceptedFiles]);
  }, [setMainImageFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const removeFile = (file: File) => {
    setMainImageFiles(prev => prev.filter(f => f !== file));
  };

  const removeUrl = (url: string) => {
    setMainImageUrls(prev => prev.filter(u => u !== url));
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${isDragActive ? "border-primary bg-primary/5 shadow-inner" : "border-neutral-200 hover:border-primary/50 hover:bg-neutral-50"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
            <Upload size={28} />
          </div>
          <div>
            <p className="text-neutral-700 font-bold">Upload Gallery Images</p>
            <p className="text-neutral-400 text-sm mt-1">Drag and drop or click to browse</p>
          </div>
        </div>
      </div>

      {(mainImageUrls.length > 0 || mainImageFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mainImageUrls.map((url) => (
            <div key={url} className="relative aspect-square group rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
              <img src={url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {mainImageFiles.map((file) => (
            <div key={file.name} className="relative aspect-square group rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
              <img src={URL.createObjectURL(file)} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
              >
                <X size={16} />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-bold rounded uppercase">New</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminUploadPackageForm() {
  const context = useContext(AdminPanelContext);
  if (!context) throw new Error("AdminUploadPackageForm must be used within AdminPanelContext");
  const { editPackageId: id, setActive, packageAPIDetail } = context;

  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Core Details", subtitle: "Identity & Location", icon: Package },
    { title: "Pricing & Visibility", subtitle: "Rates & Status", icon: Tag },
    { title: "Media Gallery", subtitle: "Visual Assets", icon: ImageIcon },
    { title: "Journey Roadmap", subtitle: "Daily Itinerary", icon: Calendar },
  ];

  const { mutate } = useMutationAPIQuery(CreatePackage, {
    onSuccess: () => {
      reset();
      setActive("AllPackages");
      packageAPIDetail?.refetch();
    }
  });
  const { mutate: updateMutate } = useMutationAPIQuery((data: any) => UpdatePackage(data, id), {
    onSuccess: () => {
      reset();
      setActive("AllPackages");
      packageAPIDetail?.refetch();
    }
  });

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
      rating: "",
      price: "",
      offerPrice: "",
      isBestPackage: false,
      isActive: true,
      country: "Malaysia",
      bestRank: "",
      status: "Active",
      days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "" }] }]
    },
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
      rating: pkg.rating?.toString() || "",
      price: pkg.price?.toString() || "",
      offerPrice: pkg.offerPrice?.toString() || "",
      isBestPackage: pkg.isBestPackage || false,
      bestRank: pkg.bestRank?.toString() || "",
      country: pkg.country || "Malaysia",
      isActive: pkg.isActive !== false,
      status: pkg.status || "Active",
      days: (pkg.days || []).map((day: any) => ({
        dayTitle: day.dayTitle || "",
        slots: (day.slots || []).map((slot: any) => ({
          slotType: slot.slotType || "",
          title: slot.title || "",
          description: slot.description || "",
          imageUrl: slot.imageUrl || "",
        })),
      })),
    });
    setMainImageUrls(pkg.images || []);
    setMainImageFiles([]);
  }, [id, data?.data, reset]);

  const onSubmit = (values: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (key !== "days") formData.append(key, val as any);
    });
    formData.append("existingImages", JSON.stringify(mainImageUrls));
    mainImageFiles.forEach(file => formData.append("images", file));
    const daysClean = values.days.map((day: any) => ({
      dayTitle: day.dayTitle,
      slots: day.slots.map((slot: any) => ({
        slotType: slot.slotType,
        title: slot.title,
        description: slot.description,
        imageUrl: slot.imageUrl instanceof File ? undefined : slot.imageUrl,
      }))
    }));
    formData.append("days", JSON.stringify(daysClean));
    values.days.forEach((day: any, dIndex: number) => {
      day.slots.forEach((slot: any, sIndex: number) => {
        if (slot.imageUrl instanceof File) formData.append(`slotImage_${dIndex}_${sIndex}`, slot.imageUrl);
      });
    });
    id ? updateMutate(formData) : mutate(formData);
    setIsSubmitting(false);
  };

  const nextStep = async () => {
    // Only validate the fields in the current step if needed, or validate all for simplicity
    const fieldsByStep = [
      ["packageName", "packageDescription", "location", "country", "packageType", "daysAndNights"],
      ["price", "offerPrice", "rating", "status", "isActive", "isBestPackage", "bestRank"],
      [], // Media step doesn't have zod fields in this schema
      ["days"]
    ];

    const isStepValid = await methods.trigger(fieldsByStep[activeStep] as any);
    if (isStepValid) setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const { fields: dayFields, append: addDay, remove: removeDay } = useFieldArray({ control, name: "days" });

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-3 justify-center">
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

  return (
    <FormProvider {...methods}>
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              {id ? "Sync Changes" : "Create Adventure"}
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
                    <p className={`text-[8px] font-bold uppercase tracking-wider ${isActive ? "text-primary scale-105" : "text-neutral-400 opacity-60"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      <ReusableInput control={control} name="packageDescription" label="Detailed Description" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="location" label="Main Location" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="country" label="Country" required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <SelectField control={control} name="packageType" label="Category" options={packageTypes} required variant="floating" />
                    </StyledField>
                    <StyledField>
                      <SelectField control={control} name="daysAndNights" label="Duration" options={daysOptions} required variant="floating" />
                    </StyledField>
                  </div>
                </Card>
              </div>
            )}

            {activeStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] bg-white/80 backdrop-blur-md">
                  <SectionHeader icon={Tag} title="Pricing Details" subtitle="Set the value and competitive offers" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <StyledField>
                      <ReusableInput control={control} name="price" label="Price (₹)" required type="number" variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="offerPrice" label="Offer (₹)" required type="number" variant="floating" />
                    </StyledField>
                    <StyledField>
                      <ReusableInput control={control} name="rating" label="Rating (0-5)" required type="number" variant="floating" />
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
                  <SectionHeader icon={TrendingUp} title="Visibility" subtitle="Platform status" />
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
                  <SectionHeader icon={ImageIcon} title="Media Library" subtitle="High-quality visuals for your package" />
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
                    onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "" }] })}
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
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-xl font-bold text-[10px] tracking-wider uppercase text-white bg-neutral-800 hover:bg-neutral-900 shadow-lg shadow-neutral-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight size={14} className="rotate-45" />
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
