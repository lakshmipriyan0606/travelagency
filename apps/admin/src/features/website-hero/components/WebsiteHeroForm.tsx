import { Plus, Save, Trash2, UploadCloud, FolderOpen, ImageIcon } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { WebsiteHeroCard } from "../api/website-hero.api";

type FormValues = Omit<WebsiteHeroCard, "_id"> & { _id?: string };

interface WebsiteHeroFormProps {
  register: UseFormRegister<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  images: { url?: string; alt?: string }[];
  addImage: () => void;
  removeImage: (idx: number) => void;
  openPicker: (idx: number) => void;
  uploadLocalFile: (idx: number, file: File | null) => Promise<void>;
  uploadingIndex: number | null;
  handleDelete: () => void;
  isPending: boolean;
  selectedId: string | "__new__" | null;
}

const secondaryBtn =
  "h-10 px-3.5 rounded-lg border border-white/[0.1] bg-white/[0.04] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/30 hover:text-[#F8B400] text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60 transition-all inline-flex items-center gap-2";

const fieldLabel = "text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";

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
  selectedId,
}: WebsiteHeroFormProps) => {
  const isDraft = selectedId === "__new__";

  return (
    <div className="lg:col-span-8">
      <form onSubmit={handleSubmit(onSubmit)} className="admin-surface p-5 sm:p-7">
        <div className="mb-6 pb-5 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F8B400]/80">
            {isDraft ? "New configuration" : "Editing configuration"}
          </p>
          <h3 className="text-lg font-bold text-white tracking-tight mt-1">
            {isDraft ? "Create Hero Section" : "Hero Details"}
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <label className={fieldLabel}>Title</label>
            <input
              {...register("title")}
              className="admin-field mt-2 w-full h-11 px-4 text-sm text-white placeholder:text-white/30 outline-none"
              placeholder="Hero headline"
            />
          </div>
          <div>
            <label className={fieldLabel}>Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="admin-field mt-2 w-full px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none resize-none"
              placeholder="Supporting copy shown on the hero"
            />
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className={fieldLabel}>Background images (up to 5)</p>
            <button type="button" onClick={addImage} className={secondaryBtn}>
              <Plus size={14} /> Add image
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => {
              const url = (img?.url || "").trim();
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 sm:p-3.5 space-y-2.5"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-lg overflow-hidden shrink-0 border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)] flex items-center justify-center">
                      {url ? (
                        <img
                          src={url}
                          alt={img?.alt || `Background ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-white/20" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          {...register(`backgroundImages.${idx}.url` as const)}
                          placeholder={`Image URL ${idx + 1}`}
                          className="admin-field flex-1 min-w-[140px] h-10 px-3 text-sm text-white placeholder:text-white/30 outline-none"
                        />
                        <button type="button" onClick={() => openPicker(idx)} className={secondaryBtn}>
                          <FolderOpen size={14} /> Browse
                        </button>
                        <label
                          className={`${secondaryBtn} cursor-pointer ${
                            uploadingIndex === idx ? "opacity-60 pointer-events-none" : ""
                          }`}
                        >
                          <UploadCloud size={14} />
                          {uploadingIndex === idx ? "Uploading…" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadLocalFile(idx, e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="h-10 w-10 rounded-lg border border-white/[0.1] bg-white/[0.03] text-white/45 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all inline-flex items-center justify-center"
                          title="Remove image"
                          aria-label={`Remove image ${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <input
                        {...register(`backgroundImages.${idx}.alt` as const)}
                        placeholder="Alt text"
                        className="admin-field w-full h-10 px-3 text-sm text-white placeholder:text-white/30 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 pt-5 border-t border-white/[0.06] flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="h-11 px-5 rounded-lg bg-[#F8B400] hover:bg-[#e0a200] text-black font-semibold text-sm transition-colors shadow-[0_0_20px_rgba(248,180,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedId || selectedId === "__new__" || isPending}
            className="h-11 px-5 rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </form>
    </div>
  );
};
