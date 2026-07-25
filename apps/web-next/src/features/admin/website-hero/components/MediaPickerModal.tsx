import { X, Search } from "lucide-react";

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
  onSelect
}: MediaPickerModalProps) => {
  if (!pickerOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Media Gallery</p>
            <h3 className="text-lg font-black text-neutral-900 mt-1">Select an image</h3>
          </div>
          <button type="button" onClick={closePicker} className="w-10 h-10 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input value={gallerySearch} onChange={(e) => setGallerySearch(e.target.value)} placeholder="Search by public id..." className="w-full h-11 pl-10 pr-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition" />
          </div>
          {galleryLoading ? (
            <div className="py-20 text-center text-neutral-500 font-medium">Loading images...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-auto pr-1">
              {galleryImages.filter((img) => (img.publicId || "").toLowerCase().includes(gallerySearch.toLowerCase())).map((img) => (
                <button key={img.publicId} type="button" onClick={() => { if (pickerIndex !== null) onSelect(img.url); }} className="group text-left rounded-2xl overflow-hidden border border-neutral-200 hover:border-primary/40 hover:shadow-lg transition bg-white" title={img.publicId}>
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    <img src={img.url} alt={img.publicId} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-black text-neutral-700 truncate">{(img.publicId || "").split("/").pop()}</p>
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
