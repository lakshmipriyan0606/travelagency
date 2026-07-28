"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Image as ImageIcon, X } from "lucide-react";

import { storySchema, StoryFormValues } from "../validation/story.schema";
import { createStory } from "@/api/story.api";
import { StoryVisualInput } from "./StoryVisualInput";
import { StoryConfigInput } from "./StoryConfigInput";
import { showToast } from "@/lib/toast";

export default function StoryFormClient() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      url: "",
      row: 1,
      alt: "Customer Story",
    },
  });

  const mutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      showToast({ type: "success", content: "Story added to marquee!" });
      queryClient.invalidateQueries({ queryKey: ["adminStories"] });
      router.push(ROUTES.stories.list);
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err.message || "Failed to add story" });
    },
  });

  const onSubmit = (data: StoryFormValues) => {
    mutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
          <div className="p-10 bg-neutral-50/50 border-b border-neutral-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                <ImageIcon size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-neutral-800 tracking-tight">Add New Story</h2>
                <p className="text-[11px] text-neutral-400 font-black uppercase tracking-[0.2em] mt-1">Enhance your homepage marquee</p>
              </div>
            </div>
            <button onClick={() => router.push(ROUTES.stories.list)} className="p-3 rounded-2xl text-neutral-400 hover:bg-neutral-100 transition-all cursor-pointer">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={methods.handleSubmit(onSubmit)} className="p-10 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <StoryVisualInput />
              <StoryConfigInput isPending={mutation.isPending} />
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
