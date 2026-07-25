import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { packageFormSchema } from "@/features/admin/validation/package.schema";
import { PackageFormValues, ItineraryItem, Slot } from "../../types";
import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { CreatePackage, UpdatePackage, GetCurrentPackageDetail } from "@/api/admin/auth.api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";

export function usePackageForm(id: string, setActive: (a: string) => void, triggerRefresh: () => void, isActivityProp: boolean) {
  const [mainImageFiles, setMainImageFiles] = useState<{ file: File; alt: string }[]>([]);
  const [mainImageUrls, setMainImageUrls] = useState<{ url: string; alt: string }[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const methods = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema) as any,
    defaultValues: {
      packageName: "", packageDescription: "", location: "", packageType: "", daysAndNights: "", hotelName: "",
      price: "", offerPrice: "", isBestPackage: false, isActive: true, country: "Malaysia", bestRank: "",
      status: "Active", activityCategory: "", days: [{ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "", imageAlt: "" }] }],
      operatingHours: "", isInstantConfirmation: false, isNonRefundable: false, languages: "", highlights: [], seo: { title: "", description: "", keywords: "" }
    },
    mode: 'onChange'
  });

  const { reset, watch } = methods;
  const isActivity = isActivityProp || (watch("activityCategory") && watch("activityCategory") !== "" && watch("activityCategory") !== "none");

  const createMutation = useMutationAPIQuery(CreatePackage, {
    onSuccess: () => { toast.success("Package created successfully!"); reset(); setActive("AllPackages"); triggerRefresh?.(); },
    onError: (error: any) => { toast.error(error?.message || "Failed to create package"); }
  });

  const updateMutation = useMutationAPIQuery((data: any) => UpdatePackage(data, id), {
    onSuccess: () => { toast.success("Package updated successfully!"); reset(); setActive("AllPackages"); triggerRefresh?.(); },
    onError: (error: any) => { toast.error(error?.message || "Failed to update package"); }
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const { data } = UseFetchAPIQuery({
    key: ["currentPackageDetail", { id }],
    queryFn: async () => GetCurrentPackageDetail(id),
    options: { enabled: !!id }
  });

  useEffect(() => {
    if (!id || !data?.data) return;
    const pkg = data.data;
    reset({
      packageName: pkg.packageName || '', packageDescription: pkg.packageDescription || '', location: pkg.location || "",
      packageType: pkg.packageType || "", daysAndNights: pkg.daysAndNights || "", hotelName: pkg.hotelName || "",
      price: pkg.price?.toString() || "", offerPrice: pkg.offerPrice?.toString() || "", isBestPackage: pkg.isBestPackage || false,
      bestRank: pkg.bestRank?.toString() || "", country: pkg.country || "Malaysia", isActive: pkg.isActive !== false,
      status: pkg.status || "Active", activityCategory: pkg.activityCategory || "", operatingHours: pkg.operatingHours || "",
      isInstantConfirmation: pkg.isInstantConfirmation === true || pkg.isInstantConfirmation === "true",
      isNonRefundable: pkg.isNonRefundable === true || pkg.isNonRefundable === "true", languages: pkg.languages || "",
      highlights: (pkg.highlights || []).map((h: string) => typeof h === 'string' ? { item: h } : { item: "" }),
      days: (pkg.days || []).map((day: any) => ({
        dayTitle: day.dayTitle || "",
        slots: (day.slots || []).map((slot: any) => ({
          slotType: slot.slotType || "", title: slot.title || "", description: slot.description || "",
          imageUrl: slot.imageUrl || "", imageAlt: slot.imageAlt || "",
        })),
      })),
      seo: { title: pkg.seo?.title || "", description: pkg.seo?.description || "", keywords: pkg.seo?.keywords || "" }
    });
    setMainImageUrls(pkg.images?.map((img: any) => typeof img === 'string' ? { url: img, alt: "" } : img) || []);
    setMainImageFiles([]);
  }, [id, data?.data, reset]);

  const onSubmit = async (values: any, isLastStep: boolean) => {
    if (!isLastStep) return;
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        const excludeFields = ["days", "seo", "highlights", "operatingHours", "languages", "isInstantConfirmation", "isNonRefundable", "images"];
        if (!excludeFields.includes(key)) {
          const sanitized = key === "activityCategory" && val === "none" ? "" : val;
          formData.append(key, String(sanitized));
        }
      });
      formData.append("seo", JSON.stringify(values.seo));
      formData.append("existingImages", JSON.stringify(mainImageUrls));
      mainImageFiles.forEach(f => formData.append("images", f.file));
      formData.append("mainImageAlts", JSON.stringify(mainImageFiles.map(f => f.alt)));
      const daysClean = values.days?.map((day: ItineraryItem) => ({
        dayTitle: day.dayTitle,
        slots: day.slots.map((slot: Slot) => ({
          slotType: slot.slotType, title: slot.title, description: slot.description,
          imageUrl: slot.imageUrl instanceof File ? undefined : slot.imageUrl, imageAlt: slot.imageAlt,
        }))
      }));
      formData.append("days", JSON.stringify(daysClean));
      formData.append("highlights", JSON.stringify(values.highlights.map((h: { item: string }) => h.item)));
      formData.append("operatingHours", values.operatingHours || "");
      formData.append("languages", values.languages || "");
      formData.append("isInstantConfirmation", values.isInstantConfirmation ? "true" : "false");
      formData.append("isNonRefundable", values.isNonRefundable ? "true" : "false");
      values.days?.forEach((day: ItineraryItem, dIndex: number) => {
        day.slots.forEach((slot: Slot, sIndex: number) => {
          if (slot.imageUrl instanceof File) formData.append(`slotImage_${dIndex}_${sIndex}`, slot.imageUrl);
        });
      });
      if (id) await updateMutation.mutateAsync(formData);
      else await createMutation.mutateAsync(formData);
    } catch (error) { console.error("Submission error:", error); }
  };

  return { methods, mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls, activeStep, setActiveStep, onSubmit, isSubmitting, isActivity };
}
