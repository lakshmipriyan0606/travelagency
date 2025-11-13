import { Controller, useFormContext } from "react-hook-form";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { Button } from "@/components/ui/button";
import { slotTypeOptions } from "./constant";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { ReusableTextArea } from "@/components/forms/ReusableTextArea";

interface SlotFieldProps {
    control: any;
    dayIndex: number;
    slotIndex: number;
    removeSlot: (index: number) => void;
}

export const SlotFieldSection = ({
    control,
    dayIndex,
    slotIndex,
    removeSlot,
}: SlotFieldProps) => {
    const [slotImage, setSlotImage] = useState<File | null>(null);

    const { setValue } = useFormContext()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setSlotImage(acceptedFiles[0]);
        setValue(`days.${dayIndex}.slots.${slotIndex}.imageUrl`, acceptedFiles[0])
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        maxFiles: 1,
        onDrop,
    });

    const removeImage = () => {
        setSlotImage(null);
        setValue(`days.${dayIndex}.slots.${slotIndex}.imageUrl`, '')
    }

    return (
        <div className="border p-4 rounded-md mb-4 bg-white shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center">
                <Controller
                    name={`days.${dayIndex}.slots.${slotIndex}.slotType`}
                    control={control}
                    render={({ field }) => (
                        <select {...field} className="border rounded-md p-2">
                            <option value="">Select Slot Type</option>
                            {slotTypeOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    )}
                />
                <ReusableInput
                    control={control}
                    name={`days.${dayIndex}.slots.${slotIndex}.title`}
                    label="Slot Title"
                    required
                    mainContainerClassName="mb-0"
                />

                <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={() => removeSlot(slotIndex)}
                        variant="outline"
                        className="text-red-500"
                    >
                        Remove Slot
                    </Button>
                </div>

            </div>

            {/* Image Upload for Slot */}
            <div className="grid grid-cols-12 items-center gap-5">


                <div className="col-span-7">
                    <ReusableTextArea
                        control={control}
                        name={`days.${dayIndex}.slots.${slotIndex}.description`}
                        label="Slot Description"
                        required
                        mainContainerClassName="mb-0 mt-7"
                        rows={2}
                    />
                </div>

                <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 p-4 rounded-lg mt-3 cursor-pointer hover:border-yellow-500 transition col-span-5"
                >
                    <input {...getInputProps()} />
                    {slotImage ? (
                        <div className="relative">
                            <img
                                src={URL.createObjectURL(slotImage)}
                                alt="Slot"
                                className="rounded-md object-cover w-full h-40"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black bg-opacity-60 p-1 rounded-full text-white"
                            >
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
