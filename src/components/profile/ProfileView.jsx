import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Link as LinkIcon,
  Check,
  Edit3,
  Bookmark,
  FileText,
  MessageSquare,
  Clock,
  Repeat2,
  Trash2,
  Settings as SettingsIcon,
  Shield,
  Lock,
  User,
  AlertCircle,
  LogOut,
  UserCheck,
  UserMinus,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../../services/supabaseClient";

function TwitterIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GithubIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function ProfileView({
  profile,
  setProfile,
  subscribersCount = 0,
  followingCount = 0,
  subscribers = [],
  following = [],
  articles = [],
  allArticles = [],
  feedItems = [],
  bookmarkedIds = [],
  restackedIds = [],
  onDeleteArticle,
  onDeletePost,
  onRemoveBookmark,
  onSelectArticle,
  onSignOut,
  onToggleFollow,
  onUnsubscribe,
}) {
  const [activeTab, setActiveTab] = useState("articles");
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [expandedNetwork, setExpandedNetwork] = useState(null); // 'subscribers' | 'following' | null

  const [draftProfile, setDraftProfile] = useState({ ...profile });

  // Settings State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem("inkwell_privacy");
    return saved
      ? JSON.parse(saved)
      : {
          publicProfile: true,
          allowDMs: true,
          showReadingActivity: true,
        };
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...draftProfile });
    setIsEditing(false);
    showToast("Profile details updated successfully!");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("Passwords do not match.");
      return;
    }

    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordStatus(error.message);
      } else {
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStatus("");
        showToast("Password updated successfully!");
      }
    } else {
      showToast("Password updated locally (offline mode).");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleTogglePrivacy = (key) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] };
    setPrivacySettings(updated);
    localStorage.setItem("inkwell_privacy", JSON.stringify(updated));
    showToast("Privacy preferences saved.");
  };

  const restackedPosts = feedItems.filter((item) => restackedIds.includes(item.id));
  const savedItems = [
    ...allArticles.filter((a) => bookmarkedIds.includes(a.id)),
    ...feedItems.filter((f) => bookmarkedIds.includes(f.id)),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Card with In-Tile Network Management */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-serif text-2xl font-bold shadow-sm shrink-0">
              {profile.avatar || "RZ"}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">
                {profile.name}
              </h1>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-sans block">
                {profile.handle}
              </span>
              {profile.tagline && (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block mt-0.5">
                  {profile.tagline}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setDraftProfile({ ...profile });
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-editorial-border dark:border-[#3A3A3A] hover:bg-neutral-50 dark:hover:bg-[#262626] rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <p className="text-sm font-serif text-neutral-700 dark:text-neutral-300 leading-relaxed mb-5">
          {profile.bio || "No biography added yet."}
        </p>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-sans">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {profile.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" /> Member since {profile.joined}
          </span>
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:underline"
            >
              <LinkIcon className="w-3.5 h-3.5 text-neutral-400" />
              {profile.website.replace("https://", "")}
            </a>
          )}
          {profile.twitter && (
            <a
              href={`https://twitter.com/${profile.twitter}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:underline"
            >
              <TwitterIcon className="w-3.5 h-3.5 text-neutral-400" /> @{profile.twitter}
            </a>
          )}
          {profile.github && (
            <a
              href={`https://github.com/${profile.github}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:underline"
            >
              <GithubIcon className="w-3.5 h-3.5 text-neutral-400" /> {profile.github}
            </a>
          )}
        </div>

        {/* Following & Subscriber Counters directly in the Profile Card */}
        <div className="pt-4 border-t border-neutral-100 dark:border-[#2C2C2C] text-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() =>
                setExpandedNetwork((prev) => (prev === "subscribers" ? null : "subscribers"))
              }
              className="flex items-center gap-1 text-left group transition"
            >
              <span className="font-bold text-neutral-900 dark:text-white text-sm group-hover:text-amber-600 transition">
                {subscribersCount}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 group-hover:underline">
                Newsletter Subscribers
              </span>
              {expandedNetwork === "subscribers" ? (
                <ChevronUp className="w-3 h-3 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              )}
            </button>

            <button
              onClick={() =>
                setExpandedNetwork((prev) => (prev === "following" ? null : "following"))
              }
              className="flex items-center gap-1 text-left group transition"
            >
              <span className="font-bold text-neutral-900 dark:text-white text-sm group-hover:text-amber-600 transition">
                {followingCount}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 group-hover:underline">
                Following
              </span>
              {expandedNetwork === "following" ? (
                <ChevronUp className="w-3 h-3 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              )}
            </button>
          </div>

          {/* Expandable Subscribers In-Tile View */}
          {expandedNetwork === "subscribers" && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-[#252525] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                <span>Subscribers List</span>
                <button
                  onClick={() => setExpandedNetwork(null)}
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white lowercase text-xs"
                >
                  close
                </button>
              </div>
              {subscribers.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-2">No subscribers yet.</p>
              ) : (
                subscribers.map((email) => {
                  const username = email.split("@")[0];
                  const initials = username.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={email}
                      className="p-3 bg-neutral-50 dark:bg-[#151515] border border-editorial-border dark:border-[#2A2A2A] rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white block truncate">
                            {username}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-sans block truncate">
                            {email}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Unsubscribe ${email}?`)) {
                            onUnsubscribe && onUnsubscribe(email);
                            showToast(`Unsubscribed ${email}`);
                          }
                        }}
                        className="px-2.5 py-1 text-xs border border-neutral-300 dark:border-[#3A3A3A] text-neutral-600 dark:text-neutral-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900 rounded-lg transition shrink-0"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Expandable Following In-Tile View */}
          {expandedNetwork === "following" && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-[#252525] space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                <span>Authors You Follow</span>
                <button
                  onClick={() => setExpandedNetwork(null)}
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white lowercase text-xs"
                >
                  close
                </button>
              </div>
              {following.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-2">You are not following anyone yet.</p>
              ) : (
                following.map((authorId) => {
                  const found = allArticles.find(
                    (a) => a.authorId === authorId || a.author_id === authorId
                  );
                  const name =
                    found?.author ||
                    authorId.replace("user_", "").replace("_", " ").toUpperCase();
                  const avatar = name.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={authorId}
                      className="p-3 bg-neutral-50 dark:bg-[#151515] border border-editorial-border dark:border-[#2A2A2A] rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-serif text-xs font-bold shrink-0">
                          {avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white block truncate">
                            {name}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-sans block truncate">
                            @{name.toLowerCase().replace(/\s+/g, "")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onToggleFollow && onToggleFollow(authorId);
                          showToast(`Unfollowed ${name}`);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition shrink-0"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Unfollow</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </section>

      {/* Clean Content Tabs Navigation (Cleaned: Only My Articles, My Notes, Restacks, Saved, and Settings) */}
      <div className="flex items-center gap-2 border-b border-editorial-border dark:border-[#2C2C2C] mb-6 overflow-x-auto">
        {[
          { id: "articles", label: "My Articles", icon: FileText, count: articles.length },
          { id: "posts", label: "My Notes", icon: MessageSquare, count: feedItems.length },
          { id: "restacks", label: "Restacks", icon: Repeat2, count: restackedPosts.length },
          { id: "saved", label: "Saved", icon: Bookmark, count: savedItems.length },
          { id: "settings", label: "Settings", icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold"
                  : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-neutral-200 dark:bg-[#2C2C2C] px-1.5 py-0.5 rounded-full text-neutral-700 dark:text-neutral-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Articles Panel */}
        {activeTab === "articles" && (
          <div className="divide-y divide-editorial-border dark:divide-[#262626]">
            {articles.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 dark:text-neutral-500">
                You haven't published any articles yet.
              </div>
            ) : (
              articles.map((article) => (
                <article key={article.id} className="py-5 flex items-start justify-between gap-4 group">
                  <div onClick={onSelectArticle} className="flex-1 cursor-pointer">
                    <span className="text-xs text-neutral-400">{article.date}</span>
                    <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition mt-1 mb-1.5">
                      {article.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3 font-serif">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${article.title}"?`)) {
                        onDeleteArticle(article.id);
                        showToast("Article deleted!");
                      }
                    }}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </article>
              ))
            )}
          </div>
        )}

        {/* Notes / Posts Panel */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 dark:text-neutral-500">
                You haven't posted any notes yet.
              </div>
            ) : (
              feedItems.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1">
                    <span className="text-[11px] text-neutral-400 mb-1 block">
                      {post.time || "Recently"}
                    </span>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                      {post.content || post.headlineTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this note?")) {
                        onDeletePost(post.id);
                        showToast("Note deleted!");
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Restacks Panel */}
        {activeTab === "restacks" && (
          <div className="space-y-4">
            {restackedPosts.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 dark:text-neutral-500">
                No restacked items yet.
              </div>
            ) : (
              restackedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-xl flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      <Repeat2 className="w-3.5 h-3.5" /> <span>You restacked</span>
                    </div>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 font-sans">
                      {post.content || post.headlineTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onDeletePost(post.id);
                      showToast("Restack removed!");
                    }}
                    className="text-xs text-neutral-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved Items Panel */}
        {activeTab === "saved" && (
          <div className="divide-y divide-editorial-border dark:divide-[#262626]">
            {savedItems.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 dark:text-neutral-500">
                No saved items. Bookmark articles or notes to read later.
              </div>
            ) : (
              savedItems.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div onClick={onSelectArticle} className="cursor-pointer flex-1">
                    <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 transition">
                      {item.title || item.headlineTitle || `Note by ${item.author}`}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                      {item.excerpt || item.content}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onRemoveBookmark(item.id);
                      showToast("Removed from saved!");
                    }}
                    className="p-1 text-neutral-400 hover:text-red-500"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings Panel */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            {/* Account Details */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-editorial-border dark:border-[#2C2C2C]">
                <User className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white">
                  Account Details
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={profile.handle}
                    onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                    className="w-full text-xs border border-editorial-border dark:border-[#333] bg-neutral-50 dark:bg-[#141414] rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    Your unique public identifier across Inkwell.
                  </span>
                </div>
              </div>
            </div>

            {/* Security & Password */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-editorial-border dark:border-[#2C2C2C]">
                <Lock className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white">
                  Security & Password
                </h3>
              </div>

              {passwordStatus && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{passwordStatus}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs border border-editorial-border dark:border-[#333] bg-neutral-50 dark:bg-[#141414] rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs border border-editorial-border dark:border-[#333] bg-neutral-50 dark:bg-[#141414] rounded-xl px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* Privacy Preferences */}
            <div className="bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-editorial-border dark:border-[#2C2C2C]">
                <Shield className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-white">
                  Privacy Preferences
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                      Public Profile Visibility
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Allow readers and search engines to discover your public articles and notes.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.publicProfile}
                    onChange={() => handleTogglePrivacy("publicProfile")}
                    className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-[#262626]">
                  <div>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                      Direct Messaging Access
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Allow mutual connections, followed authors, and subscribers to chat with you.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.allowDMs}
                    onChange={() => handleTogglePrivacy("allowDMs")}
                    className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="pt-2 flex justify-between items-center text-xs text-neutral-400">
              <span>Inkwell Security Layer active</span>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Inkwell</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-editorial-border dark:border-[#2C2C2C] my-8">
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-4">
              Edit Complete Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={draftProfile.name}
                    onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
                    required
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    Avatar Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={draftProfile.avatar}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, avatar: e.target.value.toUpperCase() })
                    }
                    required
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Tagline / Role
                </label>
                <input
                  type="text"
                  value={draftProfile.tagline || ""}
                  onChange={(e) => setDraftProfile({ ...draftProfile, tagline: e.target.value })}
                  className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={draftProfile.bio}
                  onChange={(e) => setDraftProfile({ ...draftProfile, bio: e.target.value })}
                  className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none resize-none font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    Handle
                  </label>
                  <input
                    type="text"
                    value={draftProfile.handle}
                    onChange={(e) => setDraftProfile({ ...draftProfile, handle: e.target.value })}
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={draftProfile.location}
                    onChange={(e) => setDraftProfile({ ...draftProfile, location: e.target.value })}
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                  Personal Website URL
                </label>
                <input
                  type="url"
                  value={draftProfile.website}
                  onChange={(e) => setDraftProfile({ ...draftProfile, website: e.target.value })}
                  className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    X (Twitter) Handle
                  </label>
                  <input
                    type="text"
                    value={draftProfile.twitter || ""}
                    onChange={(e) => setDraftProfile({ ...draftProfile, twitter: e.target.value })}
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={draftProfile.github || ""}
                    onChange={(e) => setDraftProfile({ ...draftProfile, github: e.target.value })}
                    className="w-full text-xs border border-neutral-300 dark:border-[#3A3A3A] bg-transparent rounded-lg p-2.5 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-100 dark:border-[#2C2C2C]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}