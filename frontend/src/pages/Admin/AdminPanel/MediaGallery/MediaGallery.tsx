import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Search, Image as ImageIcon, ExternalLink, Filter } from "lucide-react";
import { showToast } from "@/lib/utils";
import axiosClient from "@/api/axiosClient";
import UploadImagePage from "../UploadImage/UploadImage";

const CATEGORIES = [
    { id: "all", label: "🌐 ALL", folder: "" },
    { id: "packages", label: "📦 Packages", folder: "packages" },
    { id: "blogs", label: "📝 Blogs", folder: "blogs" },
    { id: "activities", label: "🗺️ Activities", folder: "activities" },
    { id: "travelExperience", label: "📸 Reviews", folder: "travelExperience" },
    { id: "uploads", label: "📁 General", folder: "uploads" },
];

export default function MediaGallery() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

    const fetchImages = async (folder?: string) => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get("/upload/all", {
                params: { folder: folder || "" }
            });
            setImages(data?.images || []);
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
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header & Category Selection */}
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

            {/* Upload Section - Context Aware */}
            <section className="bg-neutral-50/50 p-6 rounded-[32px] border border-neutral-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pl-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                        Uploading to: <span className="text-primary">{selectedCategory.label}</span> Folder
                    </h4>
                </div>
                <UploadImagePage folder={selectedCategory.folder || "uploads"} />
                <div className="flex justify-center mt-6">
                    <Button 
                        variant="outline" 
                        onClick={() => fetchImages(selectedCategory.folder)} 
                        className="gap-2 rounded-xl text-xs font-extrabold border-neutral-200 bg-white hover:bg-neutral-50"
                    >
                        <Loader2 className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        REFRESH GALLERY
                    </Button>
                </div>
            </section>

            <hr className="border-neutral-100 mx-10" />

            {/* Gallery Grid */}
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40 w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Assets...</p>
                    </div>
                ) : filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {filteredImages.map((img) => (
                            <div key={img.publicId} className="flex flex-col gap-3 group animate-in zoom-in-95 duration-300">
                                <Card className="overflow-hidden border-neutral-200/60 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-500 rounded-[24px] bg-white aspect-square relative cursor-pointer shadow-sm">
                                    <img
                                        src={img.url}
                                        alt={img.publicId}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                    
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                        <a
                                            href={img.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-10 h-10 rounded-xl bg-white text-neutral-800 flex items-center justify-center hover:bg-primary hover:text-white shadow-xl transition-all"
                                            title="View Original"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                        <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest text-center truncate">
                                            {img.publicId.split('/').pop()}
                                        </div>
                                    </div>
                                </Card>
                                
                                <div className="flex items-center gap-2 bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-200/50 group-hover:border-primary/20 group-hover:bg-primary/[0.02] transition-all">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-neutral-400 truncate font-mono select-all leading-none pb-0.5" title={img.url}>{img.url}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(img.url, img.publicId)}
                                        className={`p-2 rounded-xl transition-all ${copyingId === img.publicId ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-neutral-400 hover:text-primary hover:bg-white hover:shadow-sm border border-transparent'}`}
                                        title="Copy Link"
                                    >
                                        {copyingId === img.publicId ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[48px] border-4 border-dashed border-neutral-100">
                        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ImageIcon size={32} className="text-neutral-200" />
                        </div>
                        <h4 className="text-neutral-800 font-black text-lg tracking-tight">No assets in this category</h4>
                        <p className="text-neutral-400 text-[10px] uppercase font-black tracking-[0.2em] mt-2">Try selecting another category or upload above</p>
                    </div>
                )}
            </section>
        </div>
    );
}
