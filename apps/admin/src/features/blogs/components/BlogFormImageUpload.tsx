import { Image as ImageIcon } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { BlogFormValues } from "../validation/blog.schema";
import { useDropzone } from "react-dropzone";
import { cn } from "@travelagency/utils";

interface BlogFormImageUploadProps {
  label: string;
  register: UseFormRegister<BlogFormValues>;
  urlFieldName: "thumbnailImageUrl" | "bannerImageUrl";
  altFieldName: "thumbnailImageAlt" | "bannerImageAlt";
  mode: "upload" | "url";
  setMode: (mode: "upload" | "url") => void;
  preview: string | null;
  setPreview: (url: string | null) => void;
  setFile: (file: File | null) => void;
  required?: boolean;
  hint?: string;
}

export const BlogFormImageUpload: React.FC<BlogFormImageUploadProps> = ({
  label,
  register,
  urlFieldName,
  altFieldName,
  mode,
  setMode,
  preview,
  setPreview,
  setFile,
  required,
  hint,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        setPreview(URL.createObjectURL(acceptedFiles[0]));
      }
    },
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            {label}
            {required && <span className="text-[#F8B400] ml-1">*</span>}
          </label>
          {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
        </div>
        <div className="flex shrink-0 bg-white/[0.04] border border-white/[0.08] p-1 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all tracking-wider",
              mode === "upload"
                ? "bg-[#F8B400] text-black shadow-[0_0_12px_rgba(248,180,0,0.25)]"
                : "text-white/45 hover:text-white/70"
            )}
          >
            UPLOAD
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "px-3 py-1.5 rounded-md transition-all tracking-wider",
              mode === "url"
                ? "bg-[#F8B400] text-black shadow-[0_0_12px_rgba(248,180,0,0.25)]"
                : "text-white/45 hover:text-white/70"
            )}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px]",
            preview
              ? "border-[#F8B400]/40 bg-[#F8B400]/05"
              : isDragActive
                ? "border-[#F8B400]/60 bg-[#F8B400]/08"
                : "border-white/[0.12] hover:border-[#F8B400]/40 hover:bg-white/[0.03]"
          )}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Click or drag to replace</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-[#F8B400]/10 border border-[#F8B400]/25 rounded-full flex items-center justify-center mx-auto mb-3 text-[#F8B400]">
                <ImageIcon size={22} />
              </div>
              <p className="text-sm text-white/70 font-medium">Drop image here</p>
              <p className="text-xs text-white/35 mt-1">or click to browse</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            {...register(urlFieldName)}
            className="admin-field w-full h-11 px-4 text-sm text-white placeholder:text-white/30 outline-none"
            placeholder="Paste image URL here…"
            onChange={(e) => setPreview(e.target.value)}
          />
          {preview && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/[0.1]">
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">Alt text</p>
        <input
          {...register(altFieldName)}
          className="admin-field w-full h-10 px-4 text-sm text-white placeholder:text-white/30 outline-none"
          placeholder="Describe this image for SEO…"
        />
      </div>
    </div>
  );
};
