import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Repeat2,
  Bookmark,
  Share2,
  Image as ImageIcon,
  Send,
  Check,
  CornerDownRight,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function FeedView({
  feedItems = [],
  setFeedItems,
  bookmarkedIds = [],
  onToggleBookmark,
  restackedIds = [],
  onToggleRestack,
  following = [],
  onToggleFollow,
  profile,
  onSelectArticle,
}) {
  const [newNote, setNewNote] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  // Toggle Like with Supabase synchronization
  const handleLike = async (id) => {
    let updatedLikes = 0;
    let currentlyLiked = false;

    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          currentlyLiked = !item.isLiked;
          updatedLikes = currentlyLiked ? (item.likes || 0) + 1 : Math.max(0, (item.likes || 0) - 1);
          return {
            ...item,
            isLiked: currentlyLiked,
            likes: updatedLikes,
          };
        }
        return item;
      })
    );

    if (supabase) {
      try {
        await supabase
          .from("feed_items")
          .update({ likes: updatedLikes })
          .eq("id", id);
      } catch (err) {
        console.warn("Could not sync like to cloud:", err);
      }
    }
  };

  // Add Comment to Post
  const handleAddComment = (postId, e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === postId) {
          return {
            ...item,
            comments: [
              ...(item.comments || []),
              { id: Date.now(), author: profile?.name || "You", text: commentInput.trim() },
            ],
          };
        }
        return item;
      })
    );
    setCommentInput("");
  };

  // Post new Note to local state and Supabase
  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const post = {
      id: `note-${Date.now()}`,
      type: "note",
      author: profile?.name || "Rohit Zade",
      authorId: profile?.id || "user_rohit",
      handle: profile?.handle || "@rohit",
      avatar: profile?.avatar || "RZ",
      time: "Just now",
      content: newNote.trim(),
      likes: 0,
      isLiked: false,
      reposts: 0,
      comments: [],
    };

    setFeedItems([post, ...feedItems]);
    setNewNote("");
    showToast("Note published to feed!");

    if (supabase) {
      try {
        await supabase.from("feed_items").insert([
          {
            id: post.id,
            type: "note",
            author: post.author,
            author_id: post.authorId,
            handle: post.handle,
            avatar: post.avatar,
            content: post.content,
            likes: 0,
            reposts: 0,
          },
        ]);
      } catch (err) {
        console.warn("Could not sync post to cloud database:", err);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Post Composer */}
      <form
        onSubmit={handlePostNote}
        className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl p-4 mb-8 shadow-sm transition-colors"
      >
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-medium text-xs shrink-0">
            {profile?.avatar || "RZ"}
          </div>
          <div className="flex-1">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Post a thought, quote, or note..."
              rows={2}
              className="w-full bg-transparent resize-none text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
            <div className="flex items-center justify-between pt-2 border-t border-editorial-border dark:border-[#2C2C2C] mt-2">
              <button
                type="button"
                onClick={() => showToast("Picture attachments ready in composer")}
                className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 transition flex items-center gap-1.5"
              >
                <span>Post</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Feed Stream */}
      {feedItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] border border-dashed border-neutral-300 dark:border-[#2C2C2C] rounded-2xl p-6">
          <p className="font-serif text-lg text-neutral-800 dark:text-neutral-200 mb-1">
            Your feed is quiet
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Post your first note above or publish an article from the Write tab.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedItems.map((item) => {
            const isSaved = bookmarkedIds.includes(item.id);
            const isRestacked = restackedIds.includes(item.id);
            const itemAuthorId = item.authorId || item.author_id;
            const isFollowingUser = itemAuthorId && following.includes(itemAuthorId);
            const isSelf = itemAuthorId === profile?.id;

            // Handle both camelCase and snake_case properties
            const title = item.headlineTitle || item.headline_title;
            const snippet = item.headlineSnippet || item.headline_snippet;
            const readTime = item.readTime || item.read_time || "4 min read";

            return (
              <article
                key={item.id}
                className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl p-5 shadow-sm transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-medium text-xs">
                      {item.avatar || item.author?.slice(0, 2).toUpperCase() || "RZ"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.author}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          {item.handle || "@author"}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {item.time || "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Follow Toggle */}
                  {!isSelf && itemAuthorId && (
                    <button
                      onClick={() => {
                        onToggleFollow(itemAuthorId);
                        showToast(isFollowingUser ? `Unfollowed ${item.author}` : `Following ${item.author}`);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                        isFollowingUser
                          ? "border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
                          : "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-white font-medium"
                      }`}
                    >
                      {isFollowingUser ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {item.type === "quote" && (
                  <blockquote className="font-serif text-base italic text-neutral-800 dark:text-neutral-200 border-l-2 border-amber-600 dark:border-amber-500 pl-4 my-2">
                    “{item.content}”
                  </blockquote>
                )}

                {item.type === "note" && (
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                    {item.content}
                  </p>
                )}

                {item.type === "headline" && (
                  <div
                    onClick={onSelectArticle}
                    className="cursor-pointer p-4 bg-neutral-50 dark:bg-[#141414] border border-editorial-border dark:border-[#2C2C2C] rounded-lg group hover:border-neutral-400 dark:hover:border-neutral-600 transition"
                  >
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                      Published Article
                    </span>
                    <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition mt-1">
                      {title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                      {snippet}
                    </p>
                    <span className="inline-block text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-medium">
                      {readTime}
                    </span>
                  </div>
                )}

                {/* Micro Actions Bar */}
                <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 text-xs mt-4 pt-3 border-t border-neutral-100 dark:border-[#2C2C2C]">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      item.isLiked ? "text-red-500 font-semibold" : "hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        item.isLiked ? "fill-red-500 text-red-500 scale-110" : ""
                      } transition-transform`}
                    />
                    <span>{item.likes || 0}</span>
                  </button>

                  {/* Restack Button */}
                  <button
                    onClick={() => {
                      onToggleRestack(item.id);
                      showToast(isRestacked ? "Removed restack" : "Restacked to profile!");
                    }}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isRestacked ? "text-emerald-500 font-semibold" : "hover:text-emerald-500"
                    }`}
                  >
                    <Repeat2 className={`w-4 h-4 ${isRestacked ? "stroke-[2.5]" : ""}`} />
                    <span>{item.reposts || 0}</span>
                  </button>

                  {/* Comments Count / Drawer Trigger */}
                  <button
                    onClick={() =>
                      setActiveCommentId(activeCommentId === item.id ? null : item.id)
                    }
                    className="flex items-center gap-1.5 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{item.comments?.length || 0}</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => {
                      onToggleBookmark(item.id);
                      showToast(isSaved ? "Removed from saved" : "Saved to bookmarks!");
                    }}
                    className={`flex items-center gap-1 transition-colors ${
                      isSaved ? "text-neutral-900 dark:text-white" : "hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current text-current" : ""}`} />
                  </button>

                  {/* Share Link */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast("Link copied!");
                    }}
                    className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Comment Thread */}
                {activeCommentId === item.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-[#2C2C2C] space-y-3">
                    {item.comments && item.comments.length > 0 ? (
                      <div className="space-y-2">
                        {item.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-neutral-50 dark:bg-[#141414] rounded-lg p-2.5 text-xs text-neutral-800 dark:text-neutral-200 border border-editorial-border dark:border-[#262626]"
                          >
                            <span className="font-semibold text-neutral-900 dark:text-white mr-2">
                              {comment.author}
                            </span>
                            <span>{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">No replies yet.</p>
                    )}

                    <form
                      onSubmit={(e) => handleAddComment(item.id, e)}
                      className="flex items-center gap-2 mt-2"
                    >
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 text-xs border border-editorial-border dark:border-[#2C2C2C] rounded-lg px-3 py-2 bg-neutral-50 dark:bg-[#141414] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200"
                      />
                      <button
                        type="submit"
                        disabled={!commentInput.trim()}
                        className="px-3.5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 transition flex items-center gap-1"
                      >
                        <span>Reply</span>
                        <CornerDownRight className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}