"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building, Plus, Trash2, Pencil, X } from "lucide-react";
import { SimpleSelect } from "@travelagency/ui";
import { showToast } from "@/lib/toast";
import {
  createB2BHotel,
  deleteB2BHotel,
  getB2BCities,
  getB2BHotels,
  updateB2BHotel,
  type B2BCity,
  type B2BHotel,
} from "@/api/b2bAdmin.api";

const emptyForm = {
  name: "",
  cityId: "",
  starRating: "3",
  baseNightlyRate: "0",
  currency: "USD",
  notes: "",
  isActive: true,
};

function cityIdOf(h: B2BHotel) {
  return typeof h.cityId === "string" ? h.cityId : h.cityId?._id;
}

function cityNameOf(h: B2BHotel) {
  return typeof h.cityId === "object" ? h.cityId?.name : "—";
}

export default function HotelsMasterClient() {
  const qc = useQueryClient();
  const [cityFilter, setCityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<B2BHotel | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: cities = [] } = useQuery({
    queryKey: ["b2b-cities", "all-active"],
    queryFn: () => getB2BCities({ active: "false" }),
  });

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ["b2b-hotels", cityFilter],
    queryFn: () =>
      getB2BHotels({
        cityId: cityFilter === "all" ? undefined : cityFilter,
        active: "false",
      }),
  });

  const cityOptions = useMemo(
    () => [
      { value: "all", label: "All Cities" },
      ...(cities as B2BCity[]).map((c) => ({
        value: c._id,
        label: `${c.name} (${c.countryCode})`,
      })),
    ],
    [cities]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        cityId: form.cityId,
        starRating: Number(form.starRating),
        baseNightlyRate: Number(form.baseNightlyRate) || 0,
        currency: form.currency.trim() || "USD",
        notes: form.notes.trim(),
        isActive: form.isActive,
      };
      if (editing) return updateB2BHotel(editing._id, payload);
      return createB2BHotel(payload);
    },
    onSuccess: () => {
      showToast({ type: "success", content: editing ? "Hotel updated" : "Hotel created" });
      qc.invalidateQueries({ queryKey: ["b2b-hotels"] });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => showToast({ type: "error", content: e.message || "Save failed" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteB2BHotel(id),
    onSuccess: () => {
      showToast({ type: "success", content: "Hotel deleted" });
      qc.invalidateQueries({ queryKey: ["b2b-hotels"] });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      cityId: cityFilter !== "all" ? cityFilter : "",
    });
    setFormOpen(true);
  };

  const openEdit = (hotel: B2BHotel) => {
    setEditing(hotel);
    setForm({
      name: hotel.name,
      cityId: cityIdOf(hotel) || "",
      starRating: String(hotel.starRating || 3),
      baseNightlyRate: String(hotel.baseNightlyRate ?? 0),
      currency: hotel.currency || "USD",
      notes: hotel.notes || "",
      isActive: hotel.isActive !== false,
    });
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-[#F8B400]" />
            Hotel Master
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Hotels are linked to cities. Portal hotel dropdowns load from this list.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <SimpleSelect
              value={cityFilter}
              onChange={setCityFilter}
              options={cityOptions}
              aria-label="Filter by city"
              highlight="gold"
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F8B400] px-4 py-2 text-sm font-bold text-black"
          >
            <Plus className="w-4 h-4" /> Add Hotel
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 bg-[#0c0c0f] overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Hotel</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Stars</th>
              <th className="px-4 py-3">Nightly rate</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Loading hotels…
                </td>
              </tr>
            )}
            {!isLoading && hotels.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No hotels yet. Add cities first, then hotels.
                </td>
              </tr>
            )}
            {hotels.map((hotel) => (
              <tr key={hotel._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-semibold text-white">{hotel.name}</td>
                <td className="px-4 py-3 text-zinc-400">{cityNameOf(hotel)}</td>
                <td className="px-4 py-3 text-[#F8B400]">{hotel.starRating}★</td>
                <td className="px-4 py-3 text-zinc-300">
                  {hotel.currency} {Number(hotel.baseNightlyRate || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      hotel.isActive ? "text-emerald-400 text-xs font-bold" : "text-zinc-500 text-xs"
                    }
                  >
                    {hotel.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => openEdit(hotel)}
                    className="inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-[#F8B400]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete ${hotel.name}?`)) deleteMutation.mutate(hotel._id);
                    }}
                    className="inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-red-400"
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
          <div className="w-full max-w-md my-8 max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editing ? "Edit Hotel" : "Add Hotel"}
              </h3>
              <button type="button" onClick={() => setFormOpen(false)}>
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase">Hotel name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-[#F8B400]/40 bg-black/40 px-3 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase">City</span>
              <SimpleSelect
                value={form.cityId || "none"}
                onChange={(v) => setForm((f) => ({ ...f, cityId: v === "none" ? "" : v }))}
                options={[
                  { value: "none", label: "Select city" },
                  ...(cities as B2BCity[]).map((c) => ({
                    value: c._id,
                    label: `${c.name} (${c.countryCode})`,
                  })),
                ]}
                highlight="gold"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 uppercase">Stars</span>
                <SimpleSelect
                  value={form.starRating}
                  onChange={(v) => setForm((f) => ({ ...f, starRating: v }))}
                  options={[
                    { value: "3", label: "3 Star" },
                    { value: "4", label: "4 Star" },
                    { value: "5", label: "5 Star" },
                  ]}
                  highlight="gold"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 uppercase">Nightly rate</span>
                <input
                  type="number"
                  min={0}
                  value={form.baseNightlyRate}
                  onChange={(e) => setForm((f) => ({ ...f, baseNightlyRate: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!form.name.trim() || !form.cityId || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="w-full rounded-xl bg-[#F8B400] py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              {saveMutation.isPending ? "Saving…" : "Save Hotel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
