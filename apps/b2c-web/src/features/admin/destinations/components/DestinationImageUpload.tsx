import { useState } from "react";
import { Loader2, X, Check, Image as ImageIcon } from "lucide-react";
import { UseFormSetValue } from "react-hook-form";
import { DestinationFormValues } from "../validation/destination.schema";

interface Props {
  imageUrl: string;
  imageSource: "upload" | "url";
  setImageSource: (source: "upload" | "url") => void;
  uploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setValue: UseFormSetValue<DestinationFormValues>;
  register: any;
  errors: any;
}

export function DestinationImageUpload({
  imageUrl,
  imageSource,
  setImageSource,
  uploading,
  handleImageUpload,
  setValue,
  register,
  errors,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Destination Visual</label>
        <div className="flex bg-neutral-100 p-1 rounded-xl gap-1">
          {(["upload", "url"] as const).map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => setImageSource(source)}
              className={"px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all " + (imageSource === source ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400 hover:text-neutral-600")}
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
  );
}
