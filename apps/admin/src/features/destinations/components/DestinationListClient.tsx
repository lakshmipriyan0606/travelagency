"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { deleteDestination, moveDestination, normalizeDestinationsOrder, getDestinations } from "../api/destinations.api";
import { Loader2, Trash2, ArrowUp, ArrowDown, ListOrdered, ImageIcon, Pencil, Plus, Check, MapPin } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { Destination } from "../validation/destination.schema";
import { ROUTES } from "@/lib/routes";

import { DestinationCard } from "./DestinationCard";

export default function DestinationListClient({ initialDestinations }: { initialDestinations: Destination[] }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: destinations = initialDestinations, isLoading } = useQuery({
        queryKey: ["adminDestinations"],
        queryFn: getDestinations,
        initialData: initialDestinations
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteDestination(id),
        onSuccess: () => {
            showToast({ type: "success", content: "Destination removed" });
            queryClient.invalidateQueries({ queryKey: ["adminDestinations"] });
        },
    });

    const moveMutation = useMutation({
        mutationFn: moveDestination,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminDestinations"] });
        },
        onError: (err: any) => {
            showToast({ type: "error", content: err.message || "Failed to move destination" });
        }
    });

    const normalizeMutation = useMutation({
        mutationFn: () => normalizeDestinationsOrder(),
        onSuccess: () => {
            showToast({ type: "success", content: "Destination order normalized" });
            queryClient.invalidateQueries({ queryKey: ["adminDestinations"] });
        },
    });

    const handleEdit = (id: string) => {
        router.push(ROUTES.destinations.edit(id));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-neutral-500 font-medium">Loading items...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/30 border border-neutral-100 overflow-hidden">
                <div className="p-8 sm:p-10 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center bg-neutral-50/50 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <ImageIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Popular Destinations</h2>
                            <p className="text-[11px] text-neutral-400 font-black uppercase tracking-[0.25em] mt-1">Manage the 4 tiles on your homepage</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => normalizeMutation.mutate()}
                            disabled={normalizeMutation.isPending}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-neutral-600 border border-neutral-200 px-6 py-4 rounded-[20px] text-xs font-black hover:bg-neutral-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            {normalizeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ListOrdered size={16} />}
                            FIX ORDER
                        </button>
                        
                        {destinations.length < 4 ? (
                            <button
                                onClick={() => router.push(ROUTES.destinations.new)}
                                className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-[20px] text-sm font-black shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                                <Plus size={18} /> ADD DESTINATION
                            </button>
                        ) : (
                            <div className="px-6 py-4 bg-neutral-100 text-neutral-400 rounded-[20px] text-xs font-black border border-neutral-200 flex items-center gap-2 opacity-60 grayscale cursor-not-allowed" title="Limit of 4 reached">
                                <Check size={16} /> POPULAR DESTINATIONS FULL
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {destinations.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 rounded-[40px] bg-neutral-50/20 text-neutral-400">
                                <ImageIcon size={64} className="mb-4 opacity-10" />
                                <p className="italic text-sm font-medium">No destinations managed yet</p>
                                <p className="text-[10px] uppercase font-black tracking-widest mt-2">{4 - destinations.length} slots remaining</p>
                            </div>
                        ) : (
                            destinations.map((dest: Destination, index: number) => (
                                <DestinationCard 
                                    key={dest._id}
                                    dest={dest}
                                    index={index}
                                    totalLength={destinations.length}
                                    onMove={(id, dir) => moveMutation.mutate({ id, direction: dir })}
                                    onEdit={handleEdit}
                                    onDelete={(id) => {
                                        if (window.confirm("Delete this destination from elite 4?")) deleteMutation.mutate(id);
                                    }}
                                />
                            ))
                        )}
                        
                        {destinations.length > 0 && destinations.length < 4 && (
                            <button 
                                onClick={() => router.push(ROUTES.destinations.new)}
                                className="border-2 border-dashed border-neutral-100 rounded-[32px] p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center gap-3 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-black text-neutral-400 uppercase tracking-widest group-hover:text-primary transition-colors">Add Destination Slot</span>
                                <span className="text-[10px] font-bold text-neutral-300">{4 - destinations.length} remaining</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
