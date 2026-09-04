import React, { useState } from "react";
import {
  Users,
  Mail,
  UserCheck,
  UserMinus,
  UserPlus,
  Search,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";

export default function AudienceView({
  following = [],
  subscribers = [],
  allArticles = [],
  onToggleFollow,
  onUnsubscribe,
  onResubscribe,
  onOpenChat,
}) {
  const [activeTab, setActiveTab] = useState("following");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  // Discoverable writers extracted from published articles
  const discoverableWriters = React.useMemo(() => {
    const map = new Map();
    allArticles.forEach((art) => {
      const id = art.authorId || art.author_id || `user_${art.author.toLowerCase().replace(/\s+/g, "_")}`;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: art.author,
          handle: `@${art.author.toLowerCase().replace(/\s+/g, "")}`,
          avatar: art.author.slice(0, 2).toUpperCase(),
          role: art.category === "essay" ? "Essayist" : "Tech Writer",
          articlesCount: allArticles.filter((a) => (a.authorId || a.author_id) === id).length,
        });
      }
    });
    return Array.from(map.values());
  }, [allArticles]);

  // Build Followed Authors details
  const followedAuthors = following.map((authorId) => {
    const found = discoverableWriters.find((w) => w.id === authorId);
    if (found) return found;
    const name = authorId.replace("user_", "").replace("_", " ").toUpperCase();
    return {
      id: authorId,
      name,
      handle: `@${name.toLowerCase().replace(/\s+/g, "")}`,
      avatar: name.slice(0, 2).toUpperCase(),
      role: "Writer",
      articlesCount: 1,
    };
  });

  const filteredFollowing = followedAuthors.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter((email) =>
    email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscover = discoverableWriters.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative text-neutral-800 dark:text-neutral-200 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Network & Audience
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage everyone you follow, your newsletter subscriber list, and discover authors across Inkwell.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, handle, or email..."
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 shadow-sm"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-editorial-border dark:border-[#2C2C2C] mb-6">
        <button
          onClick={() => setActiveTab("following")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
            activeTab === "following"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Following</span>
          <span className="text-[10px] bg-neutral-200 dark:bg-[#2C2C2C] px-1.5 py-0.5 rounded-full text-neutral-700 dark:text-neutral-300">
            {following.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("subscribers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
            activeTab === "subscribers"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Subscribers</span>
          <span className="text-[10px] bg-neutral-200 dark:bg-[#2C2C2C] px-1.5 py-0.5 rounded-full text-neutral-700 dark:text-neutral-300">
            {subscribers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("discover")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
            activeTab === "discover"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Discover Writers</span>
        </button>
      </div>

      {/* Tab: Following List */}
      {activeTab === "following" && (
        <div className="space-y-3">
          {filteredFollowing.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] border border-dashed border-neutral-200 dark:border-[#2C2C2C] rounded-2xl p-6">
              <Users className="w-8 h-8 mx-auto text-neutral-400 opacity-40 mb-2" />
              <p className="font-serif text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                You are not following anyone yet
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Explore essays in the Read tab or check Discover Writers to connect with authors.
              </p>
            </div>
          ) : (
            filteredFollowing.map((author) => (
              <div
                key={author.id}
                className="p-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl flex items-center justify-between gap-4 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-serif text-sm font-bold shrink-0">
                    {author.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {author.name}
                    </h3>
                    <span className="text-[11px] text-neutral-400 block font-sans truncate">
                      {author.handle} • {author.role}
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenChat && onOpenChat(author.id)}
                    className="p-2 border border-editorial-border dark:border-[#333] hover:bg-neutral-100 dark:hover:bg-[#252525] rounded-lg text-neutral-600 dark:text-neutral-300 transition"
                    title={`Message ${author.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      onToggleFollow(author.id);
                      showToast(`Unfollowed ${author.name}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Unfollow</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Subscribers List */}
      {activeTab === "subscribers" && (
        <div className="space-y-3">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] border border-dashed border-neutral-200 dark:border-[#2C2C2C] rounded-2xl p-6">
              <Mail className="w-8 h-8 mx-auto text-neutral-400 opacity-40 mb-2" />
              <p className="font-serif text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                No subscribers yet
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Readers who subscribe to your newsletter from your publications will appear here.
              </p>
            </div>
          ) : (
            filteredSubscribers.map((email) => {
              const username = email.split("@")[0];
              const initials = username.slice(0, 2).toUpperCase();

              return (
                <div
                  key={email}
                  className="p-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {username}
                      </h4>
                      <span className="text-[11px] text-neutral-400 font-sans block truncate">
                        {email}
                      </span>
                    </div>
                  </div>

                  {/* Right Action: Unsubscribe Button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Unsubscribe ${email} from your newsletter?`)) {
                        onUnsubscribe(email);
                        showToast(`Unsubscribed ${email}`);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-[#3A3A3A] text-neutral-600 dark:text-neutral-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 rounded-lg transition"
                  >
                    <span>Unsubscribe</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Discover Writers */}
      {activeTab === "discover" && (
        <div className="space-y-3">
          {filteredDiscover.map((writer) => {
            const isFollowing = following.includes(writer.id);

            return (
              <div
                key={writer.id}
                className="p-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-serif text-sm font-bold shrink-0">
                    {writer.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {writer.name}
                    </h3>
                    <span className="text-[11px] text-neutral-400 block font-sans truncate">
                      {writer.handle} • {writer.role}
                    </span>
                  </div>
                </div>

                {/* Right Action: Follow / Unfollow */}
                <button
                  onClick={() => {
                    onToggleFollow(writer.id);
                    showToast(isFollowing ? `Unfollowed ${writer.name}` : `Now following ${writer.name}!`);
                  }}
                  className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                    isFollowing
                      ? "border border-neutral-300 dark:border-[#3A3A3A] text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:border-red-300"
                      : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}