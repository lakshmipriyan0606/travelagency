import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Circle, Image as ImageIcon, Search, X, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { useQueryClient } from "@tanstack/react-query";
import {
  CreateWebsiteHero,
  DeleteWebsiteHero,
  GetAllWebsiteHeroes,
  UpdateWebsiteHero,
  type WebsiteHeroCard,
} from "@/api/admin/websiteHero.api";
import axiosClient from "@/api/axiosClient";

type FormValues = Omit<WebsiteHeroCard, "_id"> & { _id?: string };

const emptyCard = (): FormValues => ({
  _id: undefined,
  title: "Best Travel Agency in Malaysia",
  description: "",
  backgroundImages: [{ url: "", alt: "" }],
});

export default function WebsiteHeroManager({ startWithNew = false }: { startWithNew?: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = UseFetchAPIQuery({
    key: ["websiteHeroes"],
    queryFn: GetAllWebsiteHeroes,
    options: { enabled: true },
  });

  const heroes: WebsiteHeroCard[] = data?.data || [];

  // Use a sentinel to prevent auto-selecting an existing card while creating a new draft.
  const [selectedId, setSelectedId] = useState<string | "__new__" | null>(null);
  const selected = useMemo(
    () => (typeof selectedId === "string" ? heroes.find((h) => h._id === selectedId) || null : null),
    [heroes, selectedId]
  );
  const isDraft = selectedId === "__new__";

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: emptyCard(),
  });

  useEffect(() => {
    // If current selection no longer exists, clear it.
    if (typeof selectedId === "string" && !heroes.some((h) => h._id === selectedId)) {
      setSelectedId(null);
      return;
    }
    // Auto-select first only when user hasn't chosen anything (null). Don't override "__new__".
    if (selectedId === null && heroes.length) setSelectedId(heroes[0]._id);
  }, [heroes, selectedId]);

  useEffect(() => {
    if (selected) reset(selected);
  }, [selected, reset]);

  const images = watch("backgroundImages") || [];

  // Media gallery picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [gallerySearch, setGallerySearch] = useState("");
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const openPicker = async (idx: number) => {
    setPickerIndex(idx);
    setPickerOpen(true);
    if (galleryImages.length) return;
    try {
      setGalleryLoading(true);
      const { data } = await axiosClient.get("/upload/all", { params: { folder: "" } });
      setGalleryImages(data?.images || []);
    } catch {
      toast.error("Failed to load media gallery");
    } finally {
      setGalleryLoading(false);
    }
  };

  const closePicker = () => {
    setPickerOpen(false);
    setPickerIndex(null);
    setGallerySearch("");
  };

  const uploadLocalFile = async (idx: number, file: File | null) => {
    if (!file) return;
    try {
      setUploadingIndex(idx);
      const form = new FormData();
      form.append("image", file);
      form.append("folder", "websiteHero");
      const { data } = await axiosClient.post("/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data?.url;
      if (url) {
        setValue(`backgroundImages.${idx}.url` as const, url, { shouldDirty: true });
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploadingIndex(null);
    }
  };

  const { mutateAsync: createHero, isPending: creating } = useMutationAPIQuery(CreateWebsiteHero, {
    onSuccess: () => toast.success("Hero created"),
    onError: (e: any) => toast.error(e?.message || "Create failed"),
  });
  const { mutateAsync: updateHero, isPending: updating } = useMutationAPIQuery(UpdateWebsiteHero, {
    onSuccess: () => toast.success("Hero updated"),
    onError: (e: any) => toast.error(e?.message || "Update failed"),
  });
  const { mutateAsync: deleteHero, isPending: deleting } = useMutationAPIQuery(DeleteWebsiteHero, {
    onSuccess: () => toast.success("Hero deleted"),
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  const addImage = () => {
    const curr = watch("backgroundImages") || [];
    if (curr.length >= 5) return toast.warn("Maximum 5 images");
    setValue("backgroundImages", [...curr, { url: "", alt: "" }]);
  };
  const removeImage = (idx: number) => {
    const curr = watch("backgroundImages") || [];
    const next = curr.filter((_, i) => i !== idx);
    setValue("backgroundImages", next.length ? next : [{ url: "", alt: "" }]);
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description,
      backgroundImages: (values.backgroundImages || []).filter((x) => (x.url || "").trim()),
    };

    if (!payload.backgroundImages.length) {
      toast.warn("Add at least 1 image URL");
      return;
    }

    if (values._id) {
      await updateHero({ id: values._id, payload });
    } else {
      const created = await createHero(payload);
      const doc = created?.data;
      const id = doc?._id;
      if (id) {
        // Immediately bind the form to the created doc so subsequent saves won't update an old record
        reset(doc);
        setSelectedId(id);
      }
    }

    // Ensure list updates instantly even with staleTime
    await queryClient.invalidateQueries({ queryKey: ["websiteHeroes"] });
    await refetch();
  };

  const handleNew = () => {
    setSelectedId("__new__");
    reset(emptyCard());
  };

  useEffect(() => {
    if (startWithNew) {
      handleNew();
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    if (!selectedId || selectedId === "__new__") return;
    await deleteHero(selectedId);
    setSelectedId(null);
    await refetch();
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Website</p>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mt-2">
              Hero Sections
            </h2>
            <p className="text-neutral-500 mt-2 max-w-2xl">
              Create multiple hero cards. Toggle Active to decide what renders on the website.
            </p>
          </div>

          {heroes.length === 0 && (
            <button
              type="button"
              onClick={handleNew}
              className="h-11 px-4 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 hover:brightness-95 transition self-start lg:self-auto"
            >
              <Plus size={16} /> New hero
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-neutral-600">
                  All hero cards
                </p>
                <span className="text-xs text-neutral-400 font-bold">{heroes.length}</span>
              </div>

              <div className="max-h-[70vh] overflow-auto">
                {isLoading ? (
                  <div className="p-6 text-neutral-500">Loading…</div>
                ) : (
                  <>
                    {/* Draft row (shows immediately when user clicks "New hero") */}
                    {isDraft && (
                      <button
                        type="button"
                        onClick={() => setSelectedId("__new__")}
                        className="w-full text-left p-4 border-b border-neutral-100 bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-black text-neutral-800 truncate">New Hero (Draft)</p>
                            <p className="text-xs text-neutral-500 line-clamp-2 mt-1">Fill details and click Save.</p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                              <span>Draft</span>
                              <span>•</span>
                              <span>{(watch("backgroundImages") || []).length} images</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Circle className="text-primary" size={18} />
                          </div>
                        </div>
                      </button>
                    )}

                    {heroes.length ? (
                      heroes.map((h) => (
                        <button
                          key={h._id}
                          type="button"
                          onClick={() => setSelectedId(h._id)}
                          className={`w-full text-left p-4 border-b border-neutral-100 hover:bg-neutral-50 transition ${selectedId === h._id ? "bg-primary/5" : ""
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-black text-neutral-800 truncate">{h.title || "Untitled"}</p>
                              <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{h.description || "—"}</p>
                              <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                <span>{h.backgroundImages?.length || 0} images</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="text-neutral-300" size={18} />
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-neutral-500">No hero cards yet.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-neutral-600">
                    Title
                  </label>
                  <input
                    {...register("title")}
                    className="mt-2 w-full h-12 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-neutral-600">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="mt-2 w-full px-4 py-3 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-neutral-600">
                    Background images (up to 5)
                  </p>
                  <button
                    type="button"
                    onClick={addImage}
                    className="h-10 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> Add image
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {images.map((_, idx) => (
                    <div key={idx} className="rounded-2xl border border-neutral-200 p-3">
                      <div className="flex gap-2">
                        <input
                          {...register(`backgroundImages.${idx}.url` as const)}
                          placeholder={`Image URL ${idx + 1}`}
                          className="flex-1 h-11 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                        />
                        <button
                          type="button"
                          onClick={() => openPicker(idx)}
                          className="h-11 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition"
                        >
                          Browse
                        </button>
                        <label
                          className={`h-11 px-4 rounded-2xl border border-neutral-200 bg-gray-50 hover:bg-gray-100 text-xs font-black uppercase tracking-widest text-neutral-700 transition inline-flex items-center gap-2 cursor-pointer ${uploadingIndex === idx ? "opacity-60 pointer-events-none" : ""}`}
                          title="Upload from your computer"
                        >
                          <UploadCloud size={16} />
                          {uploadingIndex === idx ? "Uploading" : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => uploadLocalFile(idx, e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="w-11 h-11 rounded-2xl border border-neutral-200 bg-white hover:bg-red-50 text-neutral-500 hover:text-red-600 transition flex items-center justify-center"
                          title="Remove image"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <input
                        {...register(`backgroundImages.${idx}.alt` as const)}
                        placeholder="Alt text"
                        className="mt-2 w-full h-11 px-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={creating || updating || isLoading}
                  className="h-12 px-6 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Save size={16} />
                  Save
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!selectedId || selectedId === "__new__" || deleting}
                  className="h-12 px-6 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-black uppercase tracking-widest text-xs hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

                <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-neutral-500">
                  <ImageIcon size={16} />
                  Active hero renders on website home.
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Media picker modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Media Gallery</p>
                <h3 className="text-lg font-black text-neutral-900 mt-1">Select an image</h3>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="w-10 h-10 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search by public id..."
                  className="w-full h-11 pl-10 pr-4 rounded-2xl border border-neutral-200 bg-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
                />
              </div>

              {galleryLoading ? (
                <div className="py-20 text-center text-neutral-500 font-medium">Loading images...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-h-[60vh] overflow-auto pr-1">
                  {galleryImages
                    .filter((img) =>
                      (img.publicId || "").toLowerCase().includes(gallerySearch.toLowerCase())
                    )
                    .map((img) => (
                      <button
                        key={img.publicId}
                        type="button"
                        onClick={() => {
                          const idx = pickerIndex;
                          if (idx === null) return;
                          setValue(`backgroundImages.${idx}.url` as const, img.url, { shouldDirty: true });
                          closePicker();
                        }}
                        className="group text-left rounded-2xl overflow-hidden border border-neutral-200 hover:border-primary/40 hover:shadow-lg transition bg-white"
                        title={img.publicId}
                      >
                        <div className="aspect-square bg-neutral-100 overflow-hidden">
                          <img src={img.url} alt={img.publicId} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] font-black text-neutral-700 truncate">
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
      )}
    </div>
  );
}

