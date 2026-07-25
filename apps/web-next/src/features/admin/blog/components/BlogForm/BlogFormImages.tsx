import { UseFormRegister } from "react-hook-form";
import { Image as ImageIcon } from "lucide-react";
import { BlogFormValues } from "../../types/blog.types";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

interface BlogFormImagesProps {
  register: UseFormRegister<BlogFormValues>;
  thumbMode: "upload" | "url";
  setThumbMode: (mode: "upload" | "url") => void;
  thumbnailPreview: string | null;
  setThumbnailPreview: (val: string | null) => void;
  getThumbProps: <T extends DropzoneRootProps>(props?: T) => T;
  getThumbInput: <T extends DropzoneInputProps>(props?: T) => T;
  
  bannerMode: "upload" | "url";
  setBannerMode: (mode: "upload" | "url") => void;
  bannerPreview: string | null;
  setBannerPreview: (val: string | null) => void;
  getBannerProps: <T extends DropzoneRootProps>(props?: T) => T;
  getBannerInput: <T extends DropzoneInputProps>(props?: T) => T;
}

export const BlogFormImages: React.FC<BlogFormImagesProps> = ({
  register, thumbMode, setThumbMode, thumbnailPreview, setThumbnailPreview, getThumbProps, getThumbInput,
  bannerMode, setBannerMode, bannerPreview, setBannerPreview, getBannerProps, getBannerInput
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-700">6. Thumbnail Image *</label>
          <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-bold">
            <button type="button" onClick={() => setThumbMode("upload")} className={`px-3 py-1 rounded-md transition-all ${thumbMode === "upload" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>UPLOAD</button>
            <button type="button" onClick={() => setThumbMode("url")} className={`px-3 py-1 rounded-md transition-all ${thumbMode === "url" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>URL</button>
          </div>
        </div>

        {thumbMode === "upload" ? (
          <div {...getThumbProps()} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${thumbnailPreview ? "border-primary/50 bg-primary/5" : "border-neutral-300 hover:border-primary/50 hover:bg-neutral-50"}`}>
            <input {...getThumbInput()} />
            {thumbnailPreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click or drag to replace</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400"><ImageIcon size={24} /></div>
                <p className="text-sm text-neutral-600 font-medium">Drop thumbnail image here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input {...register("thumbnailImageUrl")} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Paste image URL here..." onChange={(e) => setThumbnailPreview(e.target.value)} />
            {thumbnailPreview && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
                <img src={thumbnailPreview} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-1">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Thumbnail Alt Text</p>
          <input {...register("thumbnailImageAlt")} className="w-full px-4 py-2 text-sm rounded-lg border border-neutral-200 focus:border-primary outline-none" placeholder="Describe this image for SEO..." />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-700">7. Banner Image (Big Header)</label>
          <div className="flex bg-neutral-100 p-1 rounded-lg text-[10px] font-bold">
            <button type="button" onClick={() => setBannerMode("upload")} className={`px-3 py-1 rounded-md transition-all ${bannerMode === "upload" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>UPLOAD</button>
            <button type="button" onClick={() => setBannerMode("url")} className={`px-3 py-1 rounded-md transition-all ${bannerMode === "url" ? "bg-white shadow-sm text-primary" : "text-neutral-500"}`}>URL</button>
          </div>
        </div>

        {bannerMode === "upload" ? (
          <div {...getBannerProps()} className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[200px] ${bannerPreview ? "border-primary/50 bg-primary/5" : "border-neutral-300 hover:border-primary/50 hover:bg-neutral-50"}`}>
            <input {...getBannerInput()} />
            {bannerPreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium">Click or drag to replace</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3 text-neutral-400"><ImageIcon size={24} /></div>
                <p className="text-sm text-neutral-600 font-medium">Drop banner image here</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <input {...register("bannerImageUrl")} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Paste banner URL here..." onChange={(e) => setBannerPreview(e.target.value)} />
            {bannerPreview && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-neutral-200">
                <img src={bannerPreview} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Banner Alt Text</p>
          <input {...register("bannerImageAlt")} className="w-full px-4 py-2 text-sm rounded-lg border border-neutral-200 focus:border-primary outline-none" placeholder="Describe this header image..." />
        </div>
      </div>
    </div>
  );
};
