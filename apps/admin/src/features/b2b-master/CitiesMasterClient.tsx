"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Pencil, X } from "lucide-react";
import { CountrySelect } from "@travelagency/forms";
import { showToast } from "@/lib/toast";
import {
  createB2BCity,
  deleteB2BCity,
  getB2BCities,
  updateB2BCity,
  type B2BCity,
} from "@/api/b2bAdmin.api";

const emptyForm = {
  name: "",
  countryCode: "MY",
  region: "",
  isActive: true,
};

export default function CitiesMasterClient() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<B2BCity | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["b2b-cities"],
    queryFn: () => getB2BCities({ active: "false" }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        countryCode: form.countryCode,
        region: form.region.trim(),
        isActive: form.isActive,
      };
      if (editing) return updateB2BCity(editing._id, payload);
      return createB2BCity(payload);
    },
    onSuccess: () => {
      showToast({ type: "success", content: editing ? "City updated" : "City created" });
      qc.invalidateQueries({ queryKey: ["b2b-cities"] });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => showToast({ type: "error", content: e.message || "Save failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteB2BCity(id),
    onSuccess: () => {
      showToast({ type: "success", content: "City deleted" });
      qc.invalidateQueries({ queryKey: ["b2b-cities"] });
    },
    onError: () => showToast({ type: "error", content: "Delete failed" }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (city: B2BCity) => {
    setEditing(city);
    setForm({
      name: city.name,
      countryCode: city.countryCode || "MY",
      region: city.region || "",
      isActive: city.isActive !== false,
    });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F8B400]" />
            City Master
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Global cities shared by all agencies in Portal Create Custom Package dropdowns.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F8B400] px-4 py-2 text-sm font-bold text-black hover:bg-[#FFD54A]"
        >
          <Plus className="w-4 h-4" /> Add City
        </button>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0c0c0f] overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading cities…
                </td>
              </tr>
            )}
            {!isLoading && cities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No cities yet. Add one to feed portal dropdowns.
                </td>
              </tr>
            )}
            {cities.map((city) => (
              <tr key={city._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold text-white">{city.name}</td>
                <td className="px-4 py-3 text-zinc-400">{city.countryCode}</td>
                <td className="px-4 py-3 text-zinc-400">{city.region || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      city.isActive
                        ? "text-emerald-400 text-xs font-bold"
                        : "text-zinc-500 text-xs font-bold"
                    }
                  >
                    {city.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(city)}
                    className="inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-[#F8B400] hover:bg-white/5"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${city.name}?`)) deleteMutation.mutate(city._id);
                    }}
                    className="inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-white/5"
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
          <div className="w-full max-w-md my-8 max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editing ? "Edit City" : "Add City"}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                City name
              </span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[#F8B400]/40 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#F8B400]"
                placeholder="e.g. Kuala Lumpur"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Country / Nationality
              </span>
              <CountrySelect
                value={form.countryCode}
                onChange={(code) => setForm((f) => ({ ...f, countryCode: code }))}
                highlight="gold"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Region
              </span>
              <input
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#F8B400]/50"
                placeholder="Optional region"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-[#F8B400]"
              />
              Active
            </label>
            <button
              type="button"
              disabled={!form.name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="w-full rounded-xl bg-[#F8B400] py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              {saveMutation.isPending ? "Saving…" : "Save City"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
