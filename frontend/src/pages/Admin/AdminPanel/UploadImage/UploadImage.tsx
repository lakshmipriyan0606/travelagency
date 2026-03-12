import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      maxSize: 5 * 1024 * 1024, // 5MB
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Image</h1>
      <Card className="shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl p-10 text-center cursor-pointer transition border-2 ${borderClass} bg-white`}
          >
            <input {...getInputProps()} />
            <div className="text-6xl">🖼️</div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the image here..." : "Drag & drop image here"}
            </p>
            <p className="text-sm text-neutral-500">or click to browse</p>
            <p className="text-xs text-neutral-400">Max size: 5 MB</p>
          </div>

          {preview && (
            <div className="flex items-center gap-4">
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <p className="font-medium truncate">{file?.name}</p>
                <p className="text-sm text-neutral-500">
                  {(file?.size || 0) / 1024 < 1024
                    ? `${Math.round((file?.size || 0) / 1024)} KB`
                    : `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setPreview(null);
                setUrl(null);
              }}
            >
              Reset
            </Button>
          </div>

          {url && (
            <div className="space-y-2">
              <label className="text-sm text-neutral-600">Image URL</label>
              <div className="flex gap-2">
                <Input value={url} readOnly />
                <Button onClick={handleCopy} variant="outline">
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
