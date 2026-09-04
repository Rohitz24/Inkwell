import React, { useState } from "react";
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react";

export default function StickyActionBar({ articleId, isBookmarked, onToggleBookmark }) {
  const [claps, setClaps] = useState(42);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <aside className="sticky bottom-6 z-30 max-w-fit mx-auto bg-white/95 backdrop-blur border border-editorial-border shadow-lg rounded-full px-5 py-2.5 flex items-center gap-6 text-editorial-muted">
      <button 
        onClick={() => setClaps((c) => c + 1)} 
        className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors"
      >
        <Heart className={`w-5 h-5 ${claps > 42 ? "fill-red-500 text-red-500" : ""}`} />
        <span className="text-xs font-semibold">{claps}</span>
      </button>

      <button className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors">
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-semibold">12</span>
      </button>

      <div className="w-[1px] h-4 bg-editorial-border" />

      <button 
        onClick={() => onToggleBookmark && onToggleBookmark(articleId)} 
        className={`transition-colors ${isBookmarked ? "text-neutral-900" : "hover:text-neutral-900"}`}
        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
      >
        <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-neutral-900 text-neutral-900" : ""}`} />
      </button>

      <button onClick={handleShare} className="hover:text-neutral-900 transition-colors" title="Copy Link">
        <Share2 className="w-5 h-5" />
      </button>
    </aside>
  );
}