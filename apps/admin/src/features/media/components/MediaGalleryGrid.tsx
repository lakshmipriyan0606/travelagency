import { Image as ImageIcon, ExternalLink, Copy, Check } from "lucide-react";
import { MediaAsset } from "../api/media.api";

interface MediaGalleryGridProps {
  filteredImages: MediaAsset[];
  loading: boolean;
  copyingId: string | null;
  handleCopy: (url: string, id: string) => void;
}

export const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({ filteredImages, loading, copyingId, handleCopy }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/40 w-6 h-6" />
        </div>
        <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em]">Synchronizing Assets...</p>
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[48px] border-4 border-dashed border-neutral-100">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon size={32} className="text-neutral-200" />
        </div>
        <h4 className="text-neutral-800 font-black text-lg tracking-tight">No assets in this category</h4>
        <p className="text-neutral-400 text-[10px] uppercase font-black tracking-[0.2em] mt-2">Try selecting another category or upload above</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {filteredImages.map((img) => (
        <div key={img.publicId} className="flex flex-col gap-3 group animate-in zoom-in-95 duration-300">
          <div className="overflow-hidden border border-neutral-200/60 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 transition-all duration-500 rounded-[24px] bg-white aspect-square relative cursor-pointer shadow-sm">
            <img src={img.url} alt={img.publicId} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
            
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <a href={img.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white text-neutral-800 flex items-center justify-center hover:bg-primary hover:text-white shadow-xl transition-all" title="View Original">
                <ExternalLink size={16} />
              </a>
            </div>

            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest text-center truncate">
                {img.publicId.split('/').pop()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-200/50 group-hover:border-primary/20 group-hover:bg-primary/[0.02] transition-all">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-neutral-400 truncate font-mono select-all leading-none pb-0.5" title={img.url}>{img.url}</p>
            </div>
            <button onClick={() => handleCopy(img.url, img.publicId)} className={`p-2 rounded-xl transition-all ${copyingId === img.publicId ? 'text-emerald-500 bg-emerald-50 border border-emerald-100' : 'text-neutral-400 hover:text-primary hover:bg-white hover:shadow-sm border border-transparent'}`} title="Copy Link">
              {copyingId === img.publicId ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
