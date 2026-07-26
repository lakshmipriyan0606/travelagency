import { Image as ImageIcon } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { BlogFormValues } from "../validation/blog.schema";
import { useDropzone } from "react-dropzone";

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
}

export const BlogFormImageUpload: React.FC<BlogFormImageUploadProps> = ({
  label, register, urlFieldName, altFieldName, mode, setMode, preview, setPreview, setFile
}) => {
  const { getRootProps, getInputProps } = useDropzone({
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
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-700">{label}</label>
        <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-bold">
          <button type="button" onClick={() => setMode("upload")} className={`px-3 py-1 rounded-md transition-all ${mode === "upload" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>UPLOAD</button>
          <button type="button" onClick={() => setMode("url")} className={`px-3 py-1 rounded-md transition-all ${mode === "url" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>URL</button>
        </div>
      </div>

      {mode === "upload" ? (
        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${preview ? "border-primary/50 bg-primary/5" : "border-neutral-300 hover:border-primary/50 hover:bg-neutral-50"}`}>
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Click or drag to replace</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400"><ImageIcon size={24} /></div>
              <p className="text-sm text-neutral-600 font-medium">Drop image here</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input {...register(urlFieldName)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Paste URL here..." onChange={(e) => setPreview(e.target.value)} />
          {preview && (
            <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Alt Text</p>
        <input {...register(altFieldName)} className="w-full px-4 py-2 text-sm rounded-lg border border-neutral-200 focus:border-primary outline-none" placeholder="Describe this image for SEO..." />
      </div>
    </div>
  );
};
