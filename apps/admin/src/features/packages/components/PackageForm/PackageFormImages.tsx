import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@travelagency/ui";

interface MainImagesUploaderProps {
  mainImageFiles: { file: File; alt: string }[];
  setMainImageFiles: React.Dispatch<React.SetStateAction<{ file: File; alt: string }[]>>;
  mainImageUrls: { url: string; alt: string }[];
  setMainImageUrls: React.Dispatch<React.SetStateAction<{ url: string; alt: string }[]>>;
}

export function PackageFormImages({ mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls }: MainImagesUploaderProps) {
  const [urlInput, setUrlInput] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ file, alt: "" }));
    setMainImageFiles(prev => [...prev, ...newFiles]);
  }, [setMainImageFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
  });

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setMainImageUrls(prev => [...prev, { url: urlInput.trim(), alt: "" }]);
    setUrlInput("");
  };

  const removeFile = (index: number) => {
    setMainImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUrl = (index: number) => {
    setMainImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateUrlAlt = (index: number, alt: string) => {
    setMainImageUrls(prev => prev.map((item, i) => i === index ? { ...item, alt } : item));
  };

  const updateFileAlt = (index: number, alt: string) => {
    setMainImageFiles(prev => prev.map((item, i) => i === index ? { ...item, alt } : item));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-[20px] p-6 text-center transition-all cursor-pointer ${isDragActive ? "border-[#F8B400] bg-[#F8B400]/5" : "border-white/[0.12] hover:border-[#F8B400]/40 hover:bg-white/[0.02]"}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center text-zinc-400">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-zinc-200 text-xs font-bold uppercase tracking-tight">Drop Image Here</p>
              <p className="text-zinc-500 text-[10px] mt-0.5 font-medium">Click to browse your files</p>
            </div>
          </div>
        </div>

        <div className="border border-white/[0.08] rounded-[20px] p-6 bg-[var(--ent-card,#18181c)] flex flex-col justify-center">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3">Pasted URL from Gallery</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://cloudinary.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
              className="flex-1 admin-field px-3 py-2 text-xs"
            />
            <Button type="button" onClick={handleAddUrl} size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase">Add</Button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-medium">Paste images from your Media Gallery here</p>
        </div>
      </div>

      {(mainImageUrls.length > 0 || mainImageFiles.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mainImageUrls.map((item, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-white/[0.08] bg-[var(--ent-card,#18181c)]">
              <div className="aspect-video relative">
                <img src={item.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-tighter z-10">By URL</span>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Image Alt Text..."
                  value={item.alt}
                  onChange={(e) => updateUrlAlt(idx, e.target.value)}
                  className="w-full text-[10px] admin-field px-2 py-1.5"
                />
              </div>
            </div>
          ))}

          {mainImageFiles.map((item, idx) => (
            <div key={idx} className="relative group rounded-2xl overflow-hidden border border-white/[0.08] bg-[var(--ent-card,#18181c)]">
              <div className="aspect-video relative">
                <img src={URL.createObjectURL(item.file)} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-[#F8B400]/5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 z-10"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-[#F8B400] text-[#0c0c0f] text-[8px] font-black rounded uppercase tracking-tighter z-10">Uploaded</span>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Image Alt Text..."
                  value={item.alt}
                  onChange={(e) => updateFileAlt(idx, e.target.value)}
                  className="w-full text-[10px] admin-field px-2 py-1.5"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
