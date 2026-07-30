"use client";
import { useFormContext } from "react-hook-form";
import { ReusableInput } from "@travelagency/forms";
import { SelectField } from "@travelagency/forms";
import { ReusableTextArea } from "@travelagency/forms";
import { slotTypeOptions } from "./constant";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Trash2, Camera } from "lucide-react";

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
    }, [dayIndex, slotIndex, setValue]);

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
        <div className="bg-white/[0.03] border border-white/[0.08] p-5 rounded-[20px] mb-3 hover:bg-white/[0.05] hover:border-[#F8B400]/25 transition-all group/slot">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 w-full text-left">
                        <SelectField
                            name={`days.${dayIndex}.slots.${slotIndex}.slotType`}
                            control={control}
                            label="Category"
                            options={slotTypeOptions}
                            required
                            appearance="dark"
                        />
                    </div>
                    <div className="flex-[2] w-full text-left">
                        <ReusableInput
                            control={control}
                            name={`days.${dayIndex}.slots.${slotIndex}.title`}
                            label="Activity Title"
                            required
                            appearance="dark"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeSlot(slotIndex)}
                        className="w-10 h-10 rounded-lg bg-[var(--ent-elevated,#1c1c22)] border border-white/[0.08] text-zinc-400 flex items-center justify-center hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-all"
                        title="Remove Activity"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-9 text-left">
                        <ReusableTextArea
                            control={control}
                            name={`days.${dayIndex}.slots.${slotIndex}.description`}
                            label="Schedule Details"
                            appearance="dark"
                        />
                    </div>

                    <div className="lg:col-span-3 self-stretch">
                        <div className={`h-full min-h-[140px] border-2 border-dashed rounded-2xl transition-all cursor-pointer relative flex items-center justify-center overflow-hidden ${isDragActive ? "border-[#F8B400] bg-[#F8B400]/5" : "border-white/[0.12] hover:border-[#F8B400]/40 bg-[var(--ent-surface,#121216)]"}`}>
                            {!imagePreview && (
                                <div {...getRootProps()} className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-1.5 text-zinc-500 group-hover/slot:text-[#F8B400] transition-colors p-3">
                                        <Camera size={20} />
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">Drop Image</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {imagePreview ? (
                                <div className="absolute inset-0 group/img">
                                    <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt={watch(`days.${dayIndex}.slots.${slotIndex}.imageAlt`) || "Slot"} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <div {...getRootProps()} className="cursor-pointer">
                                            <input {...getInputProps()} />
                                            <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">Change File</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }} 
                                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-20"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                             ) : (
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-[var(--ent-elevated,#1c1c22)] border-t border-white/[0.08] flex gap-1 z-20">
                                    <input 
                                        type="text" 
                                        placeholder="Or Paste URL..." 
                                        value={typeof currentImage === 'string' ? currentImage : ""}
                                        onChange={(e) => setValue(`days.${dayIndex}.slots.${slotIndex}.imageUrl`, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                        className="w-full admin-field px-2 py-1 text-[8px]"
                                    />
                                </div>
                             )}
                        </div>
                        <div className="mt-2 text-left">
                            <ReusableInput
                                control={control}
                                name={`days.${dayIndex}.slots.${slotIndex}.imageAlt`}
                                label="Image Alt Text"
                                placeholder="Descriptive text for SEO"
                                appearance="dark"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
