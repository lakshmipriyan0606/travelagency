import { SearchX } from "lucide-react";

interface BlogEmptyStateProps {
  hasSearch?: boolean;
}

const BlogEmptyState = ({ hasSearch }: BlogEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center  px-6 text-center animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150 group-hover:scale-110 transition-transform duration-700 animate-pulse"></div>
        <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-neutral-100 group-hover:rotate-12 transition-transform duration-500">
          <SearchX size={56} className="text-primary stroke-[1.5px]" />
        </div>
      </div>

      <h2 className="text-4xl mb-4">
        No Stories Found
      </h2>
      <p className="text-neutral-500 max-w-md mx-auto mb-12 text-lg leading-relaxed font-bold">
        {hasSearch
          ? "We couldn't find any articles matching your search. Try different keywords or clear the filter."
          : "It seems our library of adventures is temporarily empty. Check back soon for new stories!"}
      </p>
      <div className="mt-20 flex gap-4 text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">
        <span>Explore Destinations</span>
        <span className="text-primary">•</span>
        <span>Travel Guides</span>
        <span className="text-primary">•</span>
        <span>Hidden Gems</span>
      </div>
    </div>
  );
};

export default BlogEmptyState;
