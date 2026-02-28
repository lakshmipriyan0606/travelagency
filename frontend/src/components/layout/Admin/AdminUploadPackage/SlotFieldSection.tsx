import { Controller, useFormContext } from "react-hook-form";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { Button } from "@/components/ui/button";
import { slotTypeOptions } from "./constant";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { ReusableTextArea } from "@/components/forms/ReusableTextArea";

interface SlotFieldProps {
    control: any;
    dayIndex: number;
    slotIndex: number;
    removeSlot: (index: number) => void;
}

export const SlotFieldSection = ({ control, dayIndex, slotIndex, removeSlot }: SlotFieldProps) => {
    const { setValue, watch } = useFormContext();

    const currentImage = watch(`days.${dayIndex}.slots.${slotIndex}.imageUrl`);

    const onDrop = useCallback((files: File[]) => {
        if (files.length === 0) return;

        setValue(`days.${dayIndex}.slots.${slotIndex}.imageUrl`, files[0]);
    }, []);

    const removeImage = () => {
        setValue(`days.${dayIndex}.slots.${slotIndex}.imageUrl`, "");
    };

    const isFile = currentImage instanceof File;
    const imagePreview = isFile ? URL.createObjectURL(currentImage) : currentImage;

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        maxFiles: 1,
        onDrop,
    });

    return (
        <div className="border p-4 rounded-md mb-4 bg-white shadow-sm">

            {/* SLOT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Controller
                    name={`days.${dayIndex}.slots.${slotIndex}.slotType`}
                    control={control}
                    render={({ field }) => (
                        <select {...field} className="border rounded-md p-2">
                            <option value="">Select Slot Type</option>
                            {slotTypeOptions.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    )}
                />

                <ReusableInput
                    control={control}
                    name={`days.${dayIndex}.slots.${slotIndex}.title`}
                    label="Slot Title"
                />

                <Button type="button" variant="outline" className="text-red-500" onClick={() => removeSlot(slotIndex)}>
                    Remove Slot
                </Button>
            </div>

            {/* IMAGE UPLOAD + PREVIEW */}
            <div className="grid grid-cols-12 gap-5 mt-4">

                <div className="col-span-7">
                    <ReusableTextArea
                        control={control}
                        name={`days.${dayIndex}.slots.${slotIndex}.description`}
                        label="Slot Description"
                    />
                </div>

                <div {...getRootProps()} className="border-2 border-dashed p-4 rounded-lg col-span-5 cursor-pointer">
                    <input {...getInputProps()} />

                    {imagePreview ? (
                        <div className="relative">
                            <img src={imagePreview} className="w-full h-40 object-cover rounded-md" />
                            <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">
                            {isDragActive ? "Drop image here..." : "Upload Slot Image"}
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};