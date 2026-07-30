"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PanelsTopLeft } from "lucide-react";
import { showToast } from "@/lib/toast";
import {
  getAllWebsiteHeroes,
  createWebsiteHero,
  updateWebsiteHero,
  deleteWebsiteHero,
  WebsiteHeroCard,
} from "../api/website-hero.api";
import { uploadMediaAsset, getMediaAssets } from "../../media/api/media.api";
import { WebsiteHeroSidebar } from "./WebsiteHeroSidebar";
import { WebsiteHeroForm } from "./WebsiteHeroForm";
import { MediaPickerModal } from "./MediaPickerModal";

type FormValues = Omit<WebsiteHeroCard, "_id"> & { _id?: string };

const emptyCard = (): FormValues => ({
  _id: undefined,
  title: "Best Travel Agency in Malaysia",
  description: "",
  backgroundImages: [{ url: "", alt: "" }],
});

export default function WebsiteHeroClient({ startWithNew = false }: { startWithNew?: boolean }) {
  const queryClient = useQueryClient();
  const { data: heroes = [], isLoading, refetch } = useQuery({
    queryKey: ["websiteHeroes"],
    queryFn: getAllWebsiteHeroes,
  });

  const [selectedId, setSelectedId] = useState<string | "__new__" | null>(
    startWithNew ? "__new__" : null
  );

  const selected = useMemo(
    () =>
      typeof selectedId === "string"
        ? heroes.find((h: WebsiteHeroCard) => h._id === selectedId) || null
        : null,
    [heroes, selectedId]
  );
  const isDraft = selectedId === "__new__";

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: emptyCard(),
  });

  useEffect(() => {
    if (typeof selectedId === "string" && !heroes.some((h: WebsiteHeroCard) => h._id === selectedId)) {
      setSelectedId(null);
      return;
    }
    if (selectedId === null && heroes.length && !startWithNew) setSelectedId(heroes[0]._id);
  }, [heroes, selectedId, startWithNew]);

  useEffect(() => {
    if (selected) reset(selected);
    else if (isDraft) reset(emptyCard());
  }, [selected, isDraft, reset]);

  const images = watch("backgroundImages") || [];

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
      const data = await getMediaAssets();
      setGalleryImages(data || []);
    } catch {
      showToast({ type: "error", content: "Failed to load media gallery" });
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
      const data = await uploadMediaAsset(file, "websiteHero");
      if (data?.url) {
        setValue(`backgroundImages.${idx}.url` as const, data.url, { shouldDirty: true });
      }
    } catch (e: any) {
      showToast({ type: "error", content: e?.message || "Upload failed" });
    } finally {
      setUploadingIndex(null);
    }
  };

  const createMutation = useMutation({
    mutationFn: createWebsiteHero,
    onSuccess: (data) => {
      showToast({ type: "success", content: "Hero created" });
      if (data?._id) {
        reset(data);
        setSelectedId(data._id);
      }
      queryClient.invalidateQueries({ queryKey: ["websiteHeroes"] });
      refetch();
    },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Create failed" }),
  });

  const updateMutation = useMutation({
    mutationFn: updateWebsiteHero,
    onSuccess: () => {
      showToast({ type: "success", content: "Hero updated" });
      queryClient.invalidateQueries({ queryKey: ["websiteHeroes"] });
      refetch();
    },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Update failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebsiteHero,
    onSuccess: () => {
      showToast({ type: "success", content: "Hero deleted" });
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["websiteHeroes"] });
      refetch();
    },
    onError: (e: any) => showToast({ type: "error", content: e?.message || "Delete failed" }),
  });

  const addImage = () => {
    const curr = watch("backgroundImages") || [];
    if (curr.length >= 5) return showToast({ type: "warning", content: "Maximum 5 images" });
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
      return showToast({ type: "warning", content: "Add at least 1 image URL" });
    }
    if (isDraft) createMutation.mutate(payload);
    else if (selectedId) updateMutation.mutate({ id: selectedId as string, payload });
  };

  const handleDelete = () => {
    if (!selectedId || selectedId === "__new__") return;
    if (window.confirm("Delete this hero config?")) {
      deleteMutation.mutate(selectedId as string);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="ent-gold-bar h-7 shrink-0" />
          <PanelsTopLeft className="text-[#F8B400] shrink-0" size={24} />
          Hero Sections
        </h1>
        <p className="text-sm text-white/60 mt-1.5 ml-[15px]">
          Manage homepage hero titles, copy, and background imagery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <WebsiteHeroSidebar heroes={heroes} selectedId={selectedId} setSelectedId={setSelectedId} />
        <WebsiteHeroForm
          register={register}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          images={images}
          addImage={addImage}
          removeImage={removeImage}
          openPicker={openPicker}
          uploadLocalFile={uploadLocalFile}
          uploadingIndex={uploadingIndex}
          handleDelete={handleDelete}
          isPending={isPending}
          selectedId={selectedId}
        />
      </div>

      <MediaPickerModal
        pickerOpen={pickerOpen}
        closePicker={closePicker}
        gallerySearch={gallerySearch}
        setGallerySearch={setGallerySearch}
        galleryLoading={galleryLoading}
        galleryImages={galleryImages}
        pickerIndex={pickerIndex}
        onSelect={(url) => {
          if (pickerIndex !== null) {
            setValue(`backgroundImages.${pickerIndex}.url` as const, url, { shouldDirty: true });
          }
          closePicker();
        }}
      />
    </div>
  );
};
