import { X, Search, ImageIcon } from "lucide-react";

interface MediaPickerModalProps {
  pickerOpen: boolean;
  closePicker: () => void;
  gallerySearch: string;
  setGallerySearch: (s: string) => void;
  galleryLoading: boolean;
  galleryImages: any[];
  pickerIndex: number | null;
  onSelect: (url: string) => void;
}

export const MediaPickerModal = ({
  pickerOpen,
  closePicker,
  gallerySearch,
  setGallerySearch,
  galleryLoading,
  galleryImages,
  pickerIndex,
  onSelect,
}: MediaPickerModalProps) => {
  if (!pickerOpen) return null;

  const filtered = galleryImages.filter((img) =>
    (img.publicId || "").toLowerCase().includes(gallerySearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/[0.1] bg-[var(--ent-card,#16161b)] shadow-[0_16px_48px_rgba(0,0,0,0.55)] animate-in zoom-in-95 duration-200 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F8B400]/80">
              Media Gallery
            </p>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1">Select an image</h3>
          </div>
          <button
            type="button"
            onClick={closePicker}
            className="w-10 h-10 rounded-lg border border-white/[0.1] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white transition-all flex items-center justify-center"
            aria-label="Close media picker"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="relative mb-4 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none group-focus-within:text-[#F8B400] transition-colors" />
            <input
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
              placeholder="Search by public id…"
              className="admin-field w-full h-11 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none"
            />
          </div>

          {galleryLoading ? (
            <div className="py-20 text-center text-white/45 text-sm font-medium">Loading images…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              <ImageIcon className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-sm text-white/55 font-medium">No images found</p>
              <p className="text-xs text-white/35 mt-1">Try a different search or upload first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-auto pr-1">
              {filtered.map((img) => (
                <button
                  key={img.publicId}
                  type="button"
                  onClick={() => {
                    if (pickerIndex !== null) onSelect(img.url);
                  }}
                  className="group text-left rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] hover:border-[#F8B400]/40 hover:shadow-[0_0_20px_rgba(248,180,0,0.1)] transition-all"
                  title={img.publicId}
                >
                  <div className="aspect-square bg-[var(--ent-elevated,#1c1c22)] overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.publicId}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-white/55 truncate group-hover:text-[#F8B400]/90 transition-colors">
                      {(img.publicId || "").split("/").pop()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
