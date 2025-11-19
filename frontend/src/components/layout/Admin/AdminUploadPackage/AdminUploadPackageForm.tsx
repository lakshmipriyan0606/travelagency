"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { SelectField } from "@/components/forms/SelectField";
import { ReusableCheckbox } from "@/components/forms/ReusableCheckbox";
import {
  packageTypes,
  daysOptions,
  rankOptions,
} from "./constant";
import { ItineraryDaySection } from "./ItineraryDaySection";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { CreatePackage, GetCurrentPackageDetail, UpdatePackage } from "@/api/admin/auth.api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";

// ----------------- Zod schemas -----------------
const slotSchema = z.object({
  slotType: z.string(),
  title: z.string(),
  description: z.string(),
  // can be string (URL) OR File
  imageUrl: z.any().optional(),
});

const daySchema = z.object({
  dayTitle: z.string(),
  slots: z.array(slotSchema),
});

const formSchema = z.object({
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

// ----------------- Component -----------------
export default function AdminUploadPackageForm({ id }: { id?: string }) {
  const [mainImageFiles, setMainImageFiles] = useState<File[]>([]); // newly uploaded files
  const [mainImageUrls, setMainImageUrls] = useState<string[]>([]); // existing URLs from DB
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useMutationAPIQuery(CreatePackage, {
    onSuccess: (data) => {
      console.log("create/update success", data);
    },
  });
  const { mutate: updateMutate } = useMutationAPIQuery((data)=>UpdatePackage(data,id), {
    onSuccess: (data) => {
      console.log("create/update success", data);
    },
  });

  const { data } = UseFetchAPIQuery({
    key: ["currentPackageDetail", { id }],
    queryFn: async () => GetCurrentPackageDetail(id),
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isBestPackage: false,
      days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "" }] }],
    },
  });

  const { control, handleSubmit, watch, setValue,formState } = methods;

  // --- FieldArray for days (same as before) ---
  const {
    fields: dayFields,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "days",
  });

  // --- Dropzone for main images (new files) ---
  const onDropMain = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    // Append to files array
    setMainImageFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps: getRootMainProps, getInputProps: getInputMainProps, isDragActive: isMainDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: onDropMain,
  });

  // Remove main image (file or url)
  const removeMainImageFile = (file: File) => {
    setMainImageFiles((prev) => prev.filter((f) => f !== file));
  };
  const removeMainImageUrl = (url: string) => {
    setMainImageUrls((prev) => prev.filter((u) => u !== url));
  };

  // Submit handler
  const onSubmit = () => {
    const values = methods.getValues();
    const formData = new FormData();

    // ✔ Simple fields
    Object.entries(values).forEach(([key, val]) => {
      if (key !== "days") formData.append(key, val);
    });

    // ✔ Existing Main Images (URLs only)
    formData.append("existingImages", JSON.stringify(mainImageUrls));

    // ✔ New Main Images (Files only)
    mainImageFiles.forEach(file => {
      formData.append("images", file);
    });

    // ✔ Send JSON with **only URLs** (clean)
    const daysClean = values.days.map(day => ({
      dayTitle: day.dayTitle,
      slots: day.slots.map(slot => ({
        slotType: slot.slotType,
        title: slot.title,
        description: slot.description,
        imageUrl: slot.imageUrl || "", // existing only
      }))
    }));

    formData.append("days", JSON.stringify(daysClean));

    // ✔ Send Slot New Files ONLY
    values.days.forEach((day, dIndex) => {
      day.slots.forEach((slot, sIndex) => {
        if (slot.imageUrl instanceof File) {
          formData.append(`slotImage_${dIndex}_${sIndex}`, slot.imageUrl);
        }
      });
    });

    id ? updateMutate(formData) : mutate(formData);
  };


  // When fetching package data for edit, reset form values + fill mainImageUrls
  useEffect(() => {
    if (!id) return;
    if (!data?.data) return;

    const packageData = data.data;

    methods.reset({
      location: packageData.location || "",
      packageType: packageData.packageType || "",
      daysAndNights: packageData.daysAndNights || "",
      rating: packageData.rating?.toString() || "",
      price: packageData.price?.toString() || "",
      offerPrice: packageData.offerPrice?.toString() || "",
      isBestPackage: packageData.isBestPackage || false,
      bestRank: packageData.bestRank?.toString() || "",
      days: (packageData.days || []).map((day: any) => ({
        dayTitle: day.dayTitle || "",
        slots: (day.slots || []).map((slot: any) => ({
          slotType: slot.slotType || "",
          title: slot.title || "",
          description: slot.description || "",
          imageUrl: slot.imageUrl || "", // keep existing URL here
        })),
      })),
    });

    // set main images as URLs
    setMainImageUrls(packageData.images || []);
    // clear any previously selected files (fresh edit)
    setMainImageFiles([]);
  }, [id, data?.data]);

  return (
    <FormProvider {...methods}>
      <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">🧳 Add / Edit Travel Package</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* --- Main Image Upload (handles existing URLs + new files) --- */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">Main Images</label>

            <div {...getRootMainProps()} className="border-2 border-dashed p-4 rounded-lg text-center cursor-pointer">
              <input {...getInputMainProps()} />
              {isMainDragActive ? (
                <p className="text-yellow-600 font-medium">Drop the images here...</p>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-500" />
                  <p className="text-gray-600">Drag & drop images here, or click to select (new uploads)</p>
                </div>
              )}
            </div>

            {/* Previews: existing URLs first, then newly uploaded files */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {mainImageUrls.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt="Existing" className="rounded-lg object-cover w-full h-32" />
                  <button
                    type="button"
                    onClick={() => removeMainImageUrl(url)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {mainImageFiles.map((file) => (
                <div key={file.name} className="relative group">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="rounded-lg object-cover w-full h-32" />
                  <button
                    type="button"
                    onClick={() => removeMainImageFile(file)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* --- Itinerary Section --- */}
          <h3 className="text-lg font-semibold mt-6">📅 Itinerary</h3>
          {dayFields.map((day, dayIndex) => (
            <ItineraryDaySection
              key={day.id}
              day={day}
              dayIndex={dayIndex}
              removeDay={removeDay}
              {...methods}
            />
          ))}

          <Button
            type="button"
            onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: '' }] })}
            className="text-blue-600"
          >
            + Add New Day
          </Button>

          <Button type="submit" disabled={isSubmitting} className={`w-full bg-yellow-500 text-black hover:bg-yellow-600 ${formState?.isDirty ? '' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}>
            {isSubmitting ? "Uploading..." : id ? "Update Package" : "Upload Package"}
          </Button>
        </form>
      </Card>
    </FormProvider>
  );
}
