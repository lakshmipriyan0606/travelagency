"use client";

import { useState, useEffect } from "react";
import { Loader2, Copy, Check, Search, Image as ImageIcon, ExternalLink, Filter } from "lucide-react";
import { showToast } from "@/lib/toast";
import { getMediaAssets, MediaAsset } from "../api/media.api";
import { UploadImageClient } from "./UploadImageClient";
import { MediaGalleryGrid } from "./MediaGalleryGrid";

const CATEGORIES = [
  { id: "all", label: "🌐 ALL", folder: "" },
  { id: "packages", label: "📦 Packages", folder: "packages" },
  { id: "blogs", label: "📝 Blogs", folder: "blogs" },
  { id: "activities", label: "🗺️ Activities", folder: "activities" },
  { id: "travelExperience", label: "📸 Reviews", folder: "travelExperience" },
  { id: "uploads", label: "📁 General", folder: "uploads" },
];

export default function MediaGalleryClient() {
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const fetchImages = async (folder?: string) => {
    try {
      setLoading(true);
      const data = await getMediaAssets(folder);
      setImages(data);
    } catch (err: any) {
      showToast({ type: "error", content: "Failed to load media gallery" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(selectedCategory.folder);
  }, [selectedCategory]);

  const handleCopy = async (url: string, id: string) => {
    try {
      setCopyingId(id);
      await navigator.clipboard.writeText(url);
      showToast({ type: "success", content: "URL copied to clipboard!" });
      setTimeout(() => setCopyingId(null), 2000);
    } catch {
      showToast({ type: "warning", content: "Copy failed" });
    }
  };

  const filteredImages = images.filter(img =>
    img.publicId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Media Gallery</h2>
            <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">Manage your platform assets folder-wise</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-100 rounded-[20px] border border-neutral-200/50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-[14px] text-xs font-bold transition-all ${
                selectedCategory.id === cat.id
                  ? "bg-white text-primary shadow-sm shadow-primary/5 border border-primary/10"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-neutral-50/50 p-6 rounded-[32px] border border-neutral-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pl-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
            Uploading to: <span className="text-primary">{selectedCategory.label}</span> Folder
          </h4>
        </div>
        <UploadImageClient folder={selectedCategory.folder || "uploads"} onUploadSuccess={() => fetchImages(selectedCategory.folder)} />
        <div className="flex justify-center mt-6">
          <button onClick={() => fetchImages(selectedCategory.folder)} className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-xs font-extrabold border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
            <Loader2 className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            REFRESH GALLERY
          </button>
        </div>
      </section>

      <hr className="border-neutral-100" />

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-primary/60" />
            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">
              {selectedCategory.label} Assets ({images.length})
            </h3>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-neutral-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm w-full sm:w-72 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <MediaGalleryGrid filteredImages={filteredImages} loading={loading} copyingId={copyingId} handleCopy={handleCopy} />
      </section>
    </div>
  );
}
