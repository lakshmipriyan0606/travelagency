import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Trash2, Search, Image as ImageIcon, ExternalLink } from "lucide-react";
import { showToast } from "@/lib/utils";
import axiosClient from "@/api/axiosClient";
import UploadImagePage from "../UploadImage/UploadImage";

export default function MediaGallery() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchImages = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get("/upload/all");
            setImages(data?.images || []);
        } catch (err: any) {
            showToast({ type: "error", content: "Failed to load media gallery" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

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
            {/* Upload Section */}
            <section>
                <UploadImagePage />
                <div className="flex justify-center mt-4">
                     <Button variant="outline" onClick={fetchImages} className="gap-2 rounded-xl">
                        Refresh Gallery
                     </Button>
                </div>
            </section>

            <hr className="border-neutral-200" />

            {/* Gallery Section */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-800 tracking-tight">Your Media Assets</h3>
                            <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-widest font-bold">Total {images.length} items</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Find image..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-neutral-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm w-full sm:w-64 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-neutral-500 font-medium">Fetching your assets...</p>
                    </div>
                ) : filteredImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredImages.map((img) => (
                            <div key={img.publicId} className="flex flex-col gap-2 group">
                                <Card className="overflow-hidden border-neutral-200 group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300 rounded-2xl bg-white aspect-square relative cursor-pointer">
                                    <img 
                                        src={img.url} 
                                        alt={img.publicId} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a 
                                            href={img.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-md text-neutral-800 flex items-center justify-center hover:bg-primary hover:text-white shadow-sm transition-all"
                                            title="Open full image"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest">
                                            {img.publicId.split('/').pop()}
                                        </div>
                                    </div>
                                </Card>
                                <div className="flex items-center gap-2 bg-neutral-100/50 px-3 py-2 rounded-xl border border-neutral-100 group-hover:border-primary/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-neutral-500 truncate font-mono select-all" title={img.url}>{img.url}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(img.url, img.publicId)}
                                        className={`p-1 rounded-md transition-all ${copyingId === img.publicId ? 'text-emerald-500 bg-emerald-50' : 'text-neutral-400 hover:text-primary hover:bg-primary/10'}`}
                                        title="Copy Image URL"
                                    >
                                        {copyingId === img.publicId ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-neutral-50 rounded-[32px] border-2 border-dashed border-neutral-100">
                        <ImageIcon size={48} className="mx-auto text-neutral-200 mb-4" />
                        <h4 className="text-neutral-800 font-bold tracking-tight">Gallery is empty</h4>
                        <p className="text-neutral-400 text-[10px] uppercase font-bold tracking-widest mt-1">Upload your first image above</p>
                    </div>
                )}
            </section>
        </div>
    );
}
