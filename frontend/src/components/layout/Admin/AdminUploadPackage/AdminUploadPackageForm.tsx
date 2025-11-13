"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

import { ReusableInput } from "@/components/forms/ReusableInput";
import { SelectField } from "@/components/forms/SelectField";
import { ReusableCheckbox } from "@/components/forms/ReusableCheckbox";
import { daysOptions, packageTypes, rankOptions } from "./constant";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { CreatePackage } from "@/api/admin/auth.api";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  packageType: z.string().min(1, "Package type is required"),
  days: z.string().min(1, "Days/Nights selection is required"),
  price: z.string().min(1, "Price is required").regex(/^\d+$/, "Price must be a number"),
  offerPrice: z.string().min(1, "Offer Price is required").regex(/^\d+$/, "Offer Price must be a number"),
  rating: z.string().min(1, "Rating is required").regex(/^[0-5](\.\d)?$/, "Rating must be between 0 and 5"),
  isBestPackage: z.boolean(),
  bestRank: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const AdminUploadPackageForm = () => {
  const {mutate} = useMutationAPIQuery(CreatePackage,{
    onSuccess: (data) => {
      console.log('data: ', data);
      
    }
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isBestPackage: false,
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const removeImage = (file: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // ✅ Build FormData for multer
      const formData = new FormData();

      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Append files (images)
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      // ✅ Send multipart/form-data request
      const res = await mutate(formData)
      console.log('res: ', res);

  

  
    } catch (error) {
      console.error("❌ Error submitting package:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg border border-gray-200 bg-white rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        🧳 Upload New Travel Package
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <ReusableInput control={control} name="location" label="Location" required />

        <SelectField
          control={control}
          name="packageType"
          label="Package Type"
          options={packageTypes}
          required
        />

        <SelectField
          control={control}
          name="days"
          label="Days & Nights"
          options={daysOptions}
          required
        />

        <ReusableInput control={control} name="rating" label="Rating (0–5)" required />

        <div className="grid grid-cols-2 gap-4">
          <ReusableInput control={control} name="price" label="Price (₹)" required />
          <ReusableInput control={control} name="offerPrice" label="Offer Price (₹)" required />
        </div>

        <ReusableCheckbox control={control} name="isBestPackage" label="Mark as best package" />

        {watch("isBestPackage") && (
          <SelectField
            control={control}
            name="bestRank"
            label="Best Package Rank (1–5)"
            options={rankOptions}
            required
          />
        )}

        {/* ✅ Drag & Drop Image Section */}
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:border-yellow-500 transition"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-yellow-600 font-medium">Drop the images here...</p>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-500" />
              <p className="text-gray-600">Drag & drop images here, or click to select</p>
              <p className="text-xs text-gray-400">(Supports: JPG, PNG, WebP)</p>
            </div>
          )}
        </div>

        {/* ✅ Preview Images */}
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {selectedFiles.map((file) => (
              <div key={file.name} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Uploaded"
                  className="rounded-lg object-cover w-full h-32"
                />
                <button
                  type="button"
                  onClick={() => removeImage(file)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-semibold py-3 rounded-md transition tracking-wider shadow"
        >
          {isSubmitting ? "Uploading..." : "Upload Package"}
        </Button>
      </form>
    </Card>
  );
};

export default AdminUploadPackageForm;
