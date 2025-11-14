"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useCallback } from "react";
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
import { CreatePackage } from "@/api/admin/auth.api";

const slotSchema = z.object({
  slotType: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.object()
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

export default function AdminUploadPackageForm() {
  const [mainImages, setMainImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate } = useMutationAPIQuery(CreatePackage, {
    onSuccess: (data) => {
      console.log('data: ', data);

    }
  })

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isBestPackage: false,
      days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "" }] }],
    },
  });

  const { control, handleSubmit, watch } = methods
  console.log('watch: ', watch());


  const {
    fields: dayFields,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "days",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setMainImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const removeMainImage = (file: File) => {
    setMainImages((prev) => prev.filter((f) => f !== file));
  };
  const onSubmit = async () => {
    const data = watch()
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // Normal Fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "days") {
          formData.append(key, value.toString());
        }
      });

      // Append MAIN IMAGES
      mainImages.forEach((img) => {
        formData.append("images", img);
      });

      // DAYS + SLOT FILES
      formData.append("days", JSON.stringify(data.days));

      data.days.forEach((day, dayIndex) => {
        day.slots.forEach((slot, slotIndex) => {
          if (slot.imageUrl instanceof File) {
            formData.append(
              `slotImage_${dayIndex}_${slotIndex}`,
              slot.imageUrl
            );
          }
        });
      });

      const res = await mutate(formData);
      console.log("Response:", res);

    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <FormProvider {...methods}>
      <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">🧳 Add New Travel Package</h2>

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

          {/* --- Main Image Upload --- */}
          <div {...getRootProps()} className="border-2 border-dashed p-6 rounded-lg text-center">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-yellow-600 font-medium">Drop the images here...</p>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-500" />
                <p className="text-gray-600">Drag & drop images here, or click to select</p>
              </div>
            )}
          </div>

          {mainImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {mainImages.map((file) => (
                <div key={file.name} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Uploaded"
                    className="rounded-lg object-cover w-full h-32"
                  />
                  <button
                    type="button"
                    onClick={() => removeMainImage(file)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

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
            onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "",imageUrl: '' }] })}
            className="text-blue-600"
          >
            + Add New Day
          </Button>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
            {isSubmitting ? "Uploading..." : "Upload Package"}
          </Button>
        </form>
      </Card>
    </FormProvider>
  );
}
