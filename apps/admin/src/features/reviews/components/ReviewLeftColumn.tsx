import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { UseFormSetValue } from "react-hook-form";
import { ReviewFormValues } from "../validation/review.schema";

interface Props {
  profileImageUrl: string;
  uploading: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeImage: () => void;
  setValue: UseFormSetValue<ReviewFormValues>;
  status: "Published" | "Draft";
}

export function ReviewLeftColumn({
  profileImageUrl,
  uploading,
  handleImageUpload,
  removeImage,
  setValue,
  status,
}: Props) {
  return (
    <div className="lg:col-span-4 space-y-8">
      <div className="space-y-4">
        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Reviewer Photo</label>
        {!profileImageUrl ? (
          <div className="relative group">
            <input
              type="file"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*"
            />
            <div className="aspect-square rounded-[32px] border-4 border-dashed border-neutral-100 bg-neutral-50/50 flex flex-col items-center justify-center gap-4 transition-all group-hover:bg-white group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5">
              {uploading ? (
                <Loader2 size={32} className="text-primary/40 animate-spin" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                    <ImageIcon size={24} className="text-primary/40" />
                  </div>
                  <p className="text-xs font-black text-neutral-400 tracking-tight">Upload Photo</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative group aspect-square rounded-[32px] overflow-hidden shadow-xl ring-1 ring-neutral-200">
            <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={removeImage} className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 bg-neutral-50 p-6 rounded-[24px] border border-neutral-100">
        <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Status</label>
        <div className="flex gap-2">
          {["Published", "Draft"].map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              onClick={() => setValue("status", statusOption as "Published" | "Draft")}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                status === statusOption
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {statusOption}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
