"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Trash2, Pencil, X } from "lucide-react";
import { SimpleSelect } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
import {
  createB2BPackageMaster,
  deleteB2BPackageMaster,
  getB2BCities,
  getB2BHotels,
  getB2BPackagesMaster,
  updateB2BPackageMaster,
  type B2BCity,
  type B2BHotel,
  type B2BPackageMaster,
} from "@/api/b2bAdmin.api";

const emptyForm = {
  name: "",
  cityId: "",
  hotelId: "",
  nights: "1",
  description: "",
  basePrice: "0",
  perNight: "0",
  transferAddon: "0",
  activityAddon: "0",
  currency: "USD",
  isActive: true,
};

function idOf(v: string | { _id: string } | null | undefined) {
  if (!v) return "";
  return typeof v === "string" ? v : v._id;
}

function nameOf(v: string | { name?: string } | null | undefined) {
  if (!v) return "—";
  return typeof v === "object" ? v.name || "—" : "—";
}

export default function PackagesMasterClient() {
  const qc = useQueryClient();
  const [cityFilter, setCityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<B2BPackageMaster | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: cities = [] } = useQuery({
    queryKey: ["b2b-cities", "pkg"],
    queryFn: () => getB2BCities({ active: "false" }),
  });
  const { data: hotels = [] } = useQuery({
    queryKey: ["b2b-hotels", form.cityId || "none"],
    queryFn: () => getB2BHotels({ cityId: form.cityId || undefined, active: "false" }),
    enabled: Boolean(form.cityId),
  });
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["b2b-packages-master", cityFilter],
    queryFn: () =>
      getB2BPackagesMaster({
        cityId: cityFilter === "all" ? undefined : cityFilter,
        active: "false",
      }),
  });

  const cityOptions = useMemo(
    () => [
      { value: "all", label: "All Cities" },
      ...(cities as B2BCity[]).map((c) => ({ value: c._id, label: c.name })),
    ],
    [cities]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        cityId: form.cityId,
        hotelId: form.hotelId || null,
        nights: Number(form.nights) || 1,
        description: form.description.trim(),
        amounts: {
          basePrice: Number(form.basePrice) || 0,
          perNight: Number(form.perNight) || 0,
          transferAddon: Number(form.transferAddon) || 0,
          activityAddon: Number(form.activityAddon) || 0,
        },
        currency: form.currency.trim() || "USD",
        isActive: form.isActive,
      };
      if (editing) return updateB2BPackageMaster(editing._id, payload);
      return createB2BPackageMaster(payload);
    },
    onSuccess: () => {
      showToast({ type: "success", content: editing ? "Package updated" : "Package created" });
      qc.invalidateQueries({ queryKey: ["b2b-packages-master"] });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => showToast({ type: "error", content: e.message || "Save failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteB2BPackageMaster(id),
    onSuccess: () => {
      showToast({ type: "success", content: "Package deleted" });
      qc.invalidateQueries({ queryKey: ["b2b-packages-master"] });
    },
  });

  const openEdit = (pkg: B2BPackageMaster) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      cityId: idOf(pkg.cityId),
      hotelId: idOf(pkg.hotelId),
      nights: String(pkg.nights || 1),
      description: pkg.description || "",
      basePrice: String(pkg.amounts?.basePrice ?? 0),
      perNight: String(pkg.amounts?.perNight ?? 0),
      transferAddon: String(pkg.amounts?.transferAddon ?? 0),
      activityAddon: String(pkg.amounts?.activityAddon ?? 0),
      currency: pkg.currency || "USD",
      isActive: pkg.isActive !== false,
    });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#F8B400]" />
            B2B Packages & Amounts
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Global city-based packages with live amounts for Create Custom Package pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <SimpleSelect
              value={cityFilter}
              onChange={setCityFilter}
              options={cityOptions}
              highlight="gold"
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F8B400] px-4 py-2 text-sm font-bold text-black"
          >
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0c0c0f] overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">Nights</th>
              <th className="px-4 py-3">Base / Night / Transfer</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Loading packages…
                </td>
              </tr>
            )}
            {!isLoading && packages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No packages yet. Define amounts so portal pricing is dynamic.
                </td>
              </tr>
            )}
            {packages.map((pkg) => (
              <tr key={pkg._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold text-white">{pkg.name}</td>
                <td className="px-4 py-3 text-zinc-400">{nameOf(pkg.cityId)}</td>
                <td className="px-4 py-3 text-zinc-400">{nameOf(pkg.hotelId)}</td>
                <td className="px-4 py-3 text-zinc-300">{pkg.nights}</td>
                <td className="px-4 py-3 text-zinc-300 text-xs">
                  {pkg.currency} {pkg.amounts?.basePrice ?? 0} / {pkg.amounts?.perNight ?? 0} /{" "}
                  {pkg.amounts?.transferAddon ?? 0}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(pkg)}
                    className="inline-flex p-1.5 text-zinc-400 hover:text-[#F8B400]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${pkg.name}?`)) deleteMutation.mutate(pkg._id);
                    }}
                    className="inline-flex p-1.5 text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editing ? "Edit Package" : "Add Package"}
              </h3>
              <button type="button" onClick={() => setFormOpen(false)}>
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[#F8B400]/40 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 uppercase">City</span>
                <SimpleSelect
                  value={form.cityId || "none"}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      cityId: v === "none" ? "" : v,
                      hotelId: "",
                    }))
                  }
                  options={[
                    { value: "none", label: "Select city" },
                    ...(cities as B2BCity[]).map((c) => ({ value: c._id, label: c.name })),
                  ]}
                  highlight="gold"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 uppercase">Hotel</span>
                <SimpleSelect
                  value={form.hotelId || "none"}
                  onChange={(v) => setForm((f) => ({ ...f, hotelId: v === "none" ? "" : v }))}
                  options={[
                    { value: "none", label: "Optional" },
                    ...(hotels as B2BHotel[]).map((h) => ({ value: h._id, label: h.name })),
                  ]}
                  highlight="gold"
                  disabled={!form.cityId}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["nights", "Nights"],
                  ["basePrice", "Base price"],
                  ["perNight", "Per night"],
                  ["transferAddon", "Transfer addon"],
                  ["activityAddon", "Activity addon"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase">{label}</span>
                  <input
                    type="number"
                    min={0}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={!form.name.trim() || !form.cityId || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="w-full rounded-xl bg-[#F8B400] py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              {saveMutation.isPending ? "Saving…" : "Save Package"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
