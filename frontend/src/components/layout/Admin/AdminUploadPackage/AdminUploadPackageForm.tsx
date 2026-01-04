"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback, useEffect, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { SelectField } from "@/components/forms/SelectField";
import { ReusableCheckbox } from "@/components/forms/ReusableCheckbox";
import { packageTypes, daysOptions, rankOptions } from "./constant";
import { ItineraryDaySection } from "./ItineraryDaySection";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { CreatePackage, UpdatePackage, GetCurrentPackageDetail } from "@/api/admin/auth.api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";

// ---------------- Zod schemas ----------------
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
  packageName: z.string(),
  packageDescription: z.string(),
  location: z.string(),
  packageType: z.string(),
  daysAndNights: z.string(),
  rating: z.string(),
  price: z.string(),
  offerPrice: z.string(),
  isBestPackage: z.boolean(),
  bestRank: z.string().optional(),
  days: z.array(daySchema),
});

type FormData = z.infer<typeof formSchema>;

// ---------------- Main Images Uploader ----------------
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
    <div className="mt-4">
      <label className="block mb-2 font-medium">Main Images</label>
      <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-yellow-600 font-medium">Drop the images here...</p>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="text-gray-600">Drag & drop images here, or click to select (new uploads)</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {mainImageUrls.map((url) => (
          <div key={url} className="relative group">
            <img src={url} alt="Existing" className="rounded-lg object-cover w-full h-32" />
            <button type="button" onClick={() => removeUrl(url)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
              <X size={16} />
            </button>
          </div>
        ))}

        {mainImageFiles.map((file) => (
          <div key={file.name} className="relative group">
            <img src={URL.createObjectURL(file)} alt={file.name} className="rounded-lg object-cover w-full h-32" />
            <button type="button" onClick={() => removeFile(file)}
              className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Main Form Component ----------------
export default function AdminUploadPackageForm() {
  const context = useContext(AdminPanelContext);
  if (!context) throw new Error("AdminUploadPackageForm must be used within AdminPanelContext");
  const { editPackageId: id, setActive, packageAPIDetail } = context;

  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useMutationAPIQuery(CreatePackage, {
    onSuccess: () => {
      reset()
      setActive("AllPackages");
      packageAPIDetail?.refetch();
    }
  });
  const { mutate: updateMutate } = useMutationAPIQuery((data: any) => UpdatePackage(data, id), {
    onSuccess: () => {
      reset()
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
    resolver: zodResolver(formSchema),
    defaultValues: { isBestPackage: false, days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "" }] }] },
  });

  const { control, handleSubmit, watch, reset, formState } = methods;

  // Populate form if editing
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
  }, [id, data?.data]);

  // Submit handler
  const onSubmit = (values: FormData) => {
    setIsSubmitting(true);
    const formData = new FormData();

    Object.entries(values).forEach(([key, val]) => {
      if (key !== "days") formData.append(key, val as any);
    });

    formData.append("existingImages", JSON.stringify(mainImageUrls));

    mainImageFiles.forEach(file => formData.append("images", file));

    // Only URLs for days
    const daysClean = values.days.map(day => ({
      dayTitle: day.dayTitle,
      slots: day.slots.map(slot => ({
        slotType: slot.slotType,
        title: slot.title,
        description: slot.description,
        imageUrl: slot.imageUrl instanceof File ? undefined : slot.imageUrl,
      }))
    }));
    formData.append("days", JSON.stringify(daysClean));

    // Upload slot files
    values.days.forEach((day, dIndex) => {
      day.slots.forEach((slot, sIndex) => {
        if (slot.imageUrl instanceof File) formData.append(`slotImage_${dIndex}_${sIndex}`, slot.imageUrl);
      });
    });

    id ? updateMutate(formData) : mutate(formData);
    setIsSubmitting(false);
  };

  const { fields: dayFields, append: addDay, remove: removeDay } = useFieldArray({ control, name: "days" });

  return (
    <FormProvider {...methods}>
      <Card className="mx-auto p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">🧳 Add / Edit Travel Package</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <ReusableInput control={control} name="packageName" label="Package name" required />
          <ReusableInput control={control} name="packageDescription" label="Package description" required />
          <ReusableInput control={control} name="location" label="Location" required />
          <SelectField control={control} name="packageType" label="Package Type" options={packageTypes} required />
          <SelectField control={control} name="daysAndNights" label="Days & Nights" options={daysOptions} required />

          <div className="grid grid-cols-2 gap-4">
            <ReusableInput control={control} name="rating" label="Rating (0–5)" required />
            <ReusableInput control={control} name="price" label="Price (₹)" required />
          </div>
          <ReusableInput control={control} name="offerPrice" label="Offer Price (₹)" required />

          <ReusableCheckbox control={control} name="isBestPackage" label="Mark as Best Package" />
          {watch("isBestPackage") && (
            <SelectField control={control} name="bestRank" label="Best Package Rank" options={rankOptions} required />
          )}

          {/* Main Images Uploader */}
          <MainImagesUploader
            mainImageFiles={mainImageFiles}
            setMainImageFiles={setMainImageFiles}
            mainImageUrls={mainImageUrls}
            setMainImageUrls={setMainImageUrls}
          />

          {/* Itinerary Days */}
          <h3 className="text-lg font-semibold mt-6">📅 Itinerary</h3>
          {dayFields.map((day, index) => (
            <ItineraryDaySection key={day.id} day={day} dayIndex={index} removeDay={removeDay} {...methods} />
          ))}

          <Button type="button" onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "" }] })} className="text-blue-600">
            + Add New Day
          </Button>

          <Button type="submit" disabled={isSubmitting} className={`w-full bg-yellow-500 text-black hover:bg-yellow-600 ${formState.isDirty ? "" : "opacity-50 cursor-not-allowed pointer-events-none"}`}>
            {isSubmitting ? "Uploading..." : id ? "Update Package" : "Upload Package"}
          </Button>
        </form>
      </Card>
    </FormProvider>
  );
}
