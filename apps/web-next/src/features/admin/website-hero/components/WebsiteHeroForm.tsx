import { Plus, Save, Trash2, UploadCloud } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit, FieldValues } from "react-hook-form";
import { WebsiteHeroCard } from "../api/website-hero.api";

type FormValues = Omit<WebsiteHeroCard, "_id"> & { _id?: string };

interface WebsiteHeroFormProps {
  register: UseFormRegister<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  images: any[];
  addImage: () => void;
  removeImage: (idx: number) => void;
  openPicker: (idx: number) => void;
  uploadLocalFile: (idx: number, file: File | null) => Promise<void>;
  uploadingIndex: number | null;
  handleDelete: () => void;
  isPending: boolean;
  selectedId: string | "__new__" | null;
}

export const WebsiteHeroForm = ({
  register,
  handleSubmit,
  onSubmit,
  images,
  addImage,
  removeImage,
  openPicker,
  uploadLocalFile,
  uploadingIndex,
  handleDelete,
  isPending,
  selectedId
}: WebsiteHeroFormProps) => {
  return (
    <div className="lg:col-span-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-neutral-600">Title</label>
            <input {...register("title")} className="mt-2 w-full h-12 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-neutral-600">Description</label>
            <textarea {...register("description")} rows={4} className="mt-2 w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition resize-none" />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-widest text-neutral-600">Background images (up to 5)</p>
            <button type="button" onClick={addImage} className="h-10 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition inline-flex items-center gap-2">
              <Plus size={16} /> Add image
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {images.map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-neutral-200 p-3">
                <div className="flex gap-2">
                  <input {...register(`backgroundImages.${idx}.url` as const)} placeholder={`Image URL ${idx + 1}`} className="flex-1 h-11 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition" />
                  <button type="button" onClick={() => openPicker(idx)} className="h-11 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition">Browse</button>
                  <label className={`h-11 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition inline-flex items-center gap-2 cursor-pointer ${uploadingIndex === idx ? "opacity-60 pointer-events-none" : ""}`}>
                    <UploadCloud size={16} />
                    {uploadingIndex === idx ? "Uploading" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLocalFile(idx, e.target.files?.[0] || null)} />
                  </label>
                  <button type="button" onClick={() => removeImage(idx)} className="w-11 h-11 rounded-2xl border border-neutral-200 bg-white hover:bg-red-50 text-neutral-500 hover:text-red-600 transition flex items-center justify-center">
                    <Trash2 size={18} />
                  </button>
                </div>
                <input {...register(`backgroundImages.${idx}.alt` as const)} placeholder="Alt text" className="mt-2 w-full h-11 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={isPending} className="h-12 px-6 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2">
            <Save size={16} /> Save
          </button>
          <button type="button" onClick={handleDelete} disabled={!selectedId || selectedId === "__new__" || isPending} className="h-12 px-6 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-black uppercase tracking-widest text-xs hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </form>
    </div>
  );
};
