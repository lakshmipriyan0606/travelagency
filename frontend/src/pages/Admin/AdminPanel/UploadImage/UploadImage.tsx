import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { showToast } from "@/lib/utils";
import axiosClient from "@/api/axiosClient";

export default function UploadImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setUrl(null);
    const p = URL.createObjectURL(f);
    setPreview(p);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [],
      },
      multiple: false,
      maxSize: 30 * 1024 * 1024, // 30MB
    });

  const borderClass = useMemo(() => {
    if (isDragReject) return "border-red-400";
    if (isDragAccept) return "border-green-400";
    if (isDragActive) return "border-primary";
    return "border-dashed border-neutral-300";
  }, [isDragActive, isDragAccept, isDragReject]);

  const handleUpload = async () => {
    if (!file) {
      showToast({ type: "warning", content: "Select an image first" });
      return;
    }
    try {
      setUploading(true);
      const form = new FormData();
      form.append("image", file);
      const { data } = await axiosClient.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUrl(data?.url || null);
      if (data?.url) {
        showToast({ type: "success", content: "Image uploaded successfully" });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Upload failed";
      showToast({ type: "error", content: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast({ type: "info", content: "URL copied to clipboard" });
    } catch {
      showToast({ type: "warning", content: "Copy failed, copy manually" });
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setUrl(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg rounded-2xl border-neutral-200 overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-6 text-center cursor-pointer transition border-2 ${borderClass} bg-neutral-50/50 hover:bg-white`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-1">🖼️</div>
            <p className="text-sm font-bold text-neutral-800">
              {isDragActive ? "Drop to upload" : "Click or drag to upload"}
            </p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Max size: 30 MB</p>
          </div>

          {preview && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-100 relative group">
              <img
                src={preview}
                alt="preview"
                className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-neutral-800 truncate">{file?.name}</p>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                  {(file?.size || 0) / 1024 < 1024
                    ? `${Math.round((file?.size || 0) / 1024)} KB`
                    : `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
              {!url && !uploading && (
                 <button onClick={handleReset} className="p-1 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                 </button>
              )}
            </div>
          )}

          {!url && file && (
            <div className="flex justify-center">
               <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="w-full sm:w-auto px-10 h-10 rounded-xl"
              >
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {uploading ? "Uploading..." : "Upload Now"}
              </Button>
            </div>
          )}

          {url && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 animate-in zoom-in-95">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Check size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest leading-none mb-1">Result Ready</p>
                <p className="text-xs text-neutral-600 truncate">{url}</p>
              </div>
              <Button onClick={handleCopy} size="sm" variant="outline" className="h-8 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-100">Copy URL</Button>
              <Button onClick={handleReset} size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg text-neutral-400"><X size={14}/></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
