import React, { useState } from "react";
import { Clock, ArrowRight, Search, Bookmark, UserPlus, UserCheck } from "lucide-react";
import ArticleView from "./ArticleView";

export default function ReaderHub({
  articles = [],
  bookmarkedIds = [],
  onToggleBookmark,
  following = [],
  onToggleFollow,
  onSubscribe,
  subscribers = [],
}) {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (selectedArticle) {
    const isBookmarked = bookmarkedIds.includes(selectedArticle.id);

    return (
      <div>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition flex items-center gap-1.5"
          >
            ← Back to Library
          </button>
        </div>
        <ArticleView
          article={selectedArticle}
          isBookmarked={isBookmarked}
          onToggleBookmark={onToggleBookmark}
          following={following}
          onToggleFollow={onToggleFollow}
          onSubscribe={onSubscribe}
          subscribers={subscribers}
        />
      </div>
    );
  }

  const filtered = articles.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          The Reading Library
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Essays, deep-dive technical articles, and newsletter editions.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-editorial-border dark:border-[#2C2C2C]">
        <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-[#1A1A1A] p-1 rounded-lg w-full sm:w-auto">
          {["all", "article", "essay", "newsletter"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
                activeTab === tab
                  ? "bg-white dark:bg-[#2C2C2C] text-neutral-900 dark:text-white shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {tab === "all" ? "All Reading" : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications..."
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-lg text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200"
          />
        </div>
      </div>

      {/* Article List */}
      <div className="divide-y divide-editorial-border dark:divide-[#262626]">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-xs text-neutral-400 dark:text-neutral-500">
            No publications found in this category.
          </div>
        ) : (
          filtered.map((item) => {
            const isSaved = bookmarkedIds.includes(item.id);
            const isFollowingAuthor = item.authorId && following.includes(item.authorId);

            return (
              <article key={item.id} className="py-6 flex flex-col justify-between">
                <div onClick={() => setSelectedArticle(item)} className="cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#222222] text-neutral-700 dark:text-neutral-300">
                      {item.type || "Article"}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-400">{item.date}</span>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition leading-snug mb-2">
                    {item.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-3 font-serif">
                    {item.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-[#222222]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {item.author}
                    </span>
                    {item.authorId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFollow(item.authorId);
                        }}
                        className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                      >
                        {isFollowingAuthor ? "Following" : "+ Follow"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                      <Clock className="w-3.5 h-3.5" /> {item.readTime}
                    </span>

                    <button
                      onClick={() => onToggleBookmark(item.id)}
                      className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition ${
                        isSaved ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                      title={isSaved ? "Saved" : "Save Article"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current text-current" : ""}`} />
                    </button>

                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition"
                    >
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}