"use client";

import { useFormContext } from "react-hook-form";
import { StoryFormValues } from "../validation/story.schema";
import { LayoutGrid, Loader2 } from "lucide-react";

export function StoryConfigInput({ isPending }: { isPending: boolean }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<StoryFormValues>();
  const currentRow = watch("row");

  return (
    <div className="space-y-8 flex flex-col justify-center">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid size={16} className="text-primary" />
          <label className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none">Select Display Lane</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((lane) => (
            <button
              key={lane}
              type="button"
              onClick={() => setValue("row", lane, { shouldValidate: true })}
              className={`h-24 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                currentRow === lane 
                ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                : "border-neutral-100 bg-white text-neutral-400 hover:border-neutral-200"
              }`}
            >
              <span className="text-lg font-black tracking-tight leading-none">Lane {lane}</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                {lane === 1 ? "Top (Left → Right)" : "Bottom (Right → Left)"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none pl-1">Story Context (Alt Text)</label>
        <input
          {...register("alt")}
          className="w-full px-6 py-4 rounded-2xl border border-neutral-200 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-sm font-medium"
          placeholder="e.g., Happy family at Melaka"
        />
        {errors.alt && <p className="text-red-500 text-xs font-bold pl-2">{errors.alt.message}</p>}
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white h-16 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? <Loader2 size={24} className="animate-spin mx-auto" /> : "PUBLISH STORY TO MARQUEE"}
        </button>
      </div>
    </div>
  );
}
