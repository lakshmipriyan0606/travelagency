import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStories, deleteStory, moveStory, normalizeStoriesOrder } from "@/api/admin/story.api";
import { Loader2, Trash2, ArrowUp, ArrowDown, ListOrdered, ImageIcon, Pencil } from "lucide-react";
import { showToast } from "@/lib/utils";
import { useContext } from "react";
import { AdminPanelContext } from "@/pages/Admin/AdminPanel/AdminPanel";

export default function StoryAdminList() {
    const context = useContext(AdminPanelContext);
    const setActive = context?.setActive;
    const setEditId = context?.setEditId;
    const queryClient = useQueryClient();

    const { data: stories = [], isLoading } = useQuery({
        queryKey: ["adminStories"],
        queryFn: getStories,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteStory(id),
        onSuccess: () => {
            showToast({ type: "success", content: "Story removed successfully" });
            queryClient.invalidateQueries({ queryKey: ["adminStories"] });
        },
    });

    const moveMutation = useMutation({
        mutationFn: moveStory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminStories"] });
        },
        onError: (err: any) => {
            showToast({ type: "error", content: err.message || "Failed to move story" });
        }
    });

    const normalizeMutation = useMutation({
        mutationFn: () => normalizeStoriesOrder(),
        onSuccess: () => {
            showToast({ type: "success", content: "Story orders fixed!" });
            queryClient.invalidateQueries({ queryKey: ["adminStories"] });
        },
    });

    const handleEdit = (id: string) => {
        setEditId?.(id);
        setActive?.("CreateStory");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-neutral-500 font-medium">Loading stories...</p>
            </div>
        );
    }

    const row1Stories = stories.filter((s: any) => s.row === 1);
    const row2Stories = stories.filter((s: any) => s.row === 2);

    const renderRowTable = (rowStories: any[], title: string, rowNum: number) => (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-6 pt-8">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shadow-sm animate-pulse ${rowNum === 1 ? 'bg-primary' : 'bg-[#D94E4E]'}`} />
                    <h3 className="font-black text-neutral-800 uppercase tracking-[0.2em] text-[11px]">{title}</h3>
                </div>
                <span className="text-[10px] font-black text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full uppercase tracking-widest">
                    {rowStories.length} {rowStories.length === 1 ? 'Story' : 'Stories'}
                </span>
            </div>
            
            <div className="px-6 pb-2">
                <div className="grid grid-cols-1 gap-4">
                    {rowStories.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-neutral-100 rounded-[40px] bg-neutral-50/30 text-neutral-400">
                            <ImageIcon size={48} className="mb-4 opacity-10" />
                            <p className="italic text-sm font-medium">No stories assigned to this lane yet</p>
                        </div>
                    ) : (
                        rowStories.map((story, index) => (
                            <div key={story._id} className="group relative bg-white border border-neutral-100 rounded-[32px] p-5 shadow-sm hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500">
                                <div className="flex gap-6">
                                    <div className="relative w-28 h-28 rounded-3xl overflow-hidden border border-neutral-100 shadow-inner shrink-0">
                                        <img src={story.url} alt={story.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-2 left-2 px-2 h-6 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black flex items-center justify-center border border-white/20 shadow-lg">
                                            #{story.orderNumber}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                    {rowNum === 1 ? "Top Lane" : "Bottom Lane"}
                                                </p>
                                                <span className={`w-2 h-2 rounded-full ${rowNum === 1 ? 'bg-primary' : 'bg-[#D94E4E]'}`} />
                                            </div>
                                            <p className="text-sm font-bold text-neutral-600 line-clamp-2 italic leading-relaxed pr-4">
                                                "{story.alt || "No description provided"}"
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-end gap-1.5 mt-3">
                                            <button
                                                onClick={() => moveMutation.mutate({ id: story._id, direction: "up" })}
                                                disabled={index === 0}
                                                className="p-2 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-primary transition-all disabled:opacity-10 cursor-pointer shadow-sm border border-neutral-50 bg-white"
                                                title="Move Up"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => moveMutation.mutate({ id: story._id, direction: "down" })}
                                                disabled={index === rowStories.length - 1}
                                                className="p-2 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-primary transition-all disabled:opacity-10 cursor-pointer shadow-sm border border-neutral-50 bg-white"
                                                title="Move Down"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <div className="w-px h-5 bg-neutral-100 mx-2" />
                                            <button
                                                onClick={() => handleEdit(story._id)}
                                                className="p-2 rounded-xl hover:bg-blue-50 text-neutral-400 hover:text-blue-500 transition-all cursor-pointer shadow-sm border border-neutral-50 bg-white"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if(window.confirm("Delete this customer story?")) deleteMutation.mutate(story._id);
                                                }}
                                                className="p-2 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-all cursor-pointer shadow-sm border border-neutral-50 bg-white"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/30 border border-neutral-100 overflow-hidden">
                <div className="p-8 sm:p-10 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-center bg-neutral-50/50 gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <ImageIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Happy Stories</h2>
                            <p className="text-[11px] text-neutral-400 font-black uppercase tracking-[0.25em] mt-1">Manage your customer marquee</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => normalizeMutation.mutate()}
                            disabled={normalizeMutation.isPending}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-neutral-600 border border-neutral-200 px-6 py-4 rounded-[20px] text-xs font-black hover:bg-neutral-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            {normalizeMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ListOrdered size={16} />}
                            FIX ORDERING
                        </button>
                        <button
                            onClick={() => {
                                setEditId?.(null);
                                setActive?.("CreateStory");
                            }}
                            className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-[20px] text-sm font-black shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
                        >
                            + ADD STORY
                        </button>
                    </div>
                </div>

                <div className="p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-neutral-50/10">
                    <div className="space-y-4 bg-white rounded-[32px] border border-neutral-100 shadow-xl shadow-neutral-100/50 pb-8 overflow-hidden">
                        {renderRowTable(row1Stories, "Lane 1 (Horizontal Scroll - Top)", 1)}
                    </div>
                    <div className="space-y-4 bg-white rounded-[32px] border border-neutral-100 shadow-xl shadow-neutral-100/50 pb-8 overflow-hidden">
                        {renderRowTable(row2Stories, "Lane 2 (Horizontal Scroll - Bottom)", 2)}
                    </div>
                </div>
            </div>
        </div>
    );
}
