import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

interface BlogCardProps {
  _id: string;
  title: string;
  slug: string;
  miniDescription: string;
  thumbnailImage: { url: string; alt?: string };
  author: string;
  readTime: string;
  hasLiked?: boolean;
  onLike?: (id: string) => void;
}

const BlogCard = ({
  _id,
  title,
  slug,
  miniDescription,
  thumbnailImage,
  author,
  readTime,
  hasLiked,
  onLike,
}: BlogCardProps) => {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-500 group/card">
      {/* Image Container */}
      <Link to={`/blogs/${slug}`} className="relative aspect-[16/10] block overflow-hidden">
        <img
          src={thumbnailImage?.url || "https://placehold.co/600x400?text=No+Image"}
          alt={thumbnailImage?.alt || title}
          className="w-full h-full object-cover rounded-t-[32px] group-hover/card:scale-110 transition-transform duration-700"
        />
      </Link>

      {/* Content Container */}
      <div className="p-8 flex flex-col flex-grow">
        <Link to={`/blogs/${slug}`}>
          <h3 className="text-[22px] font-semibold text-neutral-800 mb-4 line-clamp-2 hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
        </Link>
        <p className="text-[15px] text-neutral-500 mb-8 line-clamp-3 flex-grow leading-relaxed">
          {miniDescription}
        </p>

        <hr className="border-neutral-100 mb-6" />

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#F69520] uppercase tracking-[0.2em] mb-1">
              BY {author}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {readTime}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={(e) => {
                e.preventDefault();
                onLike?.(_id);
              }}
              className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Heart
                size={22}
                className={hasLiked ? "fill-red-500 text-red-500" : "stroke-[1.5px]"}
              />
            </button>
            <Link
              to={`/blogs/${slug}`}
              className="px-6 py-2.5 bg-[#222] text-white text-[10px] font-bold uppercase tracking-[0.1em] rounded-md hover:bg-black transition-all shadow-md active:scale-95"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlogCardSkeleton = () => {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-neutral-100 overflow-hidden flex flex-col h-full ring-1 ring-neutral-50 shadow-neutral-200/50">
      {/* Image Skeleton */}
      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="relative h-7 bg-neutral-100 rounded-lg w-3/4 mb-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
        <div className="relative h-7 bg-neutral-100 rounded-lg w-1/2 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
        
        <div className="space-y-3 mb-8 flex-grow">
          <div className="relative h-4 bg-neutral-50 rounded w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
          <div className="relative h-4 bg-neutral-50 rounded w-[95%] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
          <div className="relative h-4 bg-neutral-50 rounded w-[80%] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <hr className="border-neutral-100 mb-6" />

        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="relative h-3 bg-neutral-100 rounded w-20 overflow-hidden text-transparent">.
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
            <div className="relative h-2 bg-neutral-50 rounded w-12 overflow-hidden text-transparent">.
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-6 h-6 rounded-full bg-neutral-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
            <div className="relative w-24 h-10 bg-neutral-200 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
