import React, { useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import FeedView from "./components/feed/FeedView";
import ReaderHub from "./components/reader/ReaderHub";
import Editor from "./components/editor/Editor";
import ProfileView from "./components/profile/ProfileView";
import ChatView from "./components/chat/ChatView";
import AuthPage from "./components/auth/AuthPage";
import { supabase } from "./services/supabaseClient";

const DEFAULT_PROFILE = {
  id: "guest-user",
  name: "Writer",
  handle: "@writer",
  tagline: "Writer & Technologist",
  bio: "Sharing ideas, essays, and stories on Inkwell.",
  location: "Earth",
  joined: "2026",
  website: "",
  twitter: "",
  github: "",
  avatar: "WR",
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentView, setCurrentView] = useState("feed");

  // Theme Management
  const [theme, setTheme] = useState(() => localStorage.getItem("inkwell_theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("inkwell_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "light" ? "dark" : "light"));

  // Profile Management
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("inkwell_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // Audience & Followers
  const [subscribers, setSubscribers] = useState(() => {
    const s = localStorage.getItem("inkwell_subscribers");
    return s ? JSON.parse(s) : [];
  });

  const [following, setFollowing] = useState(() => {
    const s = localStorage.getItem("inkwell_following");
    return s ? JSON.parse(s) : [];
  });

  // Content Stores
  const [articles, setArticles] = useState(() => {
    const s = localStorage.getItem("inkwell_articles");
    return s ? JSON.parse(s) : [];
  });

  const [feedItems, setFeedItems] = useState(() => {
    const s = localStorage.getItem("inkwell_feed");
    return s ? JSON.parse(s) : [];
  });

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const s = localStorage.getItem("inkwell_bookmarks");
    return s ? JSON.parse(s) : [];
  });

  const [restackedIds, setRestackedIds] = useState(() => {
    const s = localStorage.getItem("inkwell_restacks");
    return s ? JSON.parse(s) : [];
  });

  // 1. Supabase Session Check & Realtime Auth Listener
  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      if (activeSession?.user) {
        fetchUserProfile(activeSession.user);
      }
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user);
        setCurrentView("feed");
      } else if (event === "SIGNED_OUT") {
        setProfile(DEFAULT_PROFILE);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (user) => {
    if (!supabase || !user) return;

    try {
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && userProfile) {
        const fullProfile = {
          id: userProfile.id,
          name: userProfile.name || user.email?.split("@")[0],
          handle: userProfile.handle || `@${user.email?.split("@")[0]}`,
          tagline: userProfile.tagline || "Writer & Technologist",
          bio: userProfile.bio || "",
          location: userProfile.location || "",
          joined: new Date(userProfile.created_at || Date.now()).getFullYear().toString(),
          website: userProfile.website || "",
          twitter: userProfile.twitter || "",
          github: userProfile.github || "",
          avatar:
            userProfile.avatar ||
            (userProfile.name ? userProfile.name.slice(0, 2).toUpperCase() : "AU"),
        };
        setProfile(fullProfile);
      } else {
        const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Writer";
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          name: fallbackName,
          handle: `@${fallbackName.toLowerCase().replace(/\s+/g, "")}`,
          avatar: fallbackName.slice(0, 2).toUpperCase(),
        };
        await supabase.from("profiles").upsert([fallbackProfile]);
        setProfile((prev) => ({ ...prev, ...fallbackProfile }));
      }
    } catch (err) {
      console.warn("Could not fetch profile from cloud:", err);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem("inkwell_profile");
  };

  const handleUpdateProfile = async (newProfileData) => {
    setProfile(newProfileData);
    if (supabase && session?.user) {
      await supabase
        .from("profiles")
        .update({
          name: newProfileData.name,
          handle: newProfileData.handle,
          tagline: newProfileData.tagline,
          bio: newProfileData.bio,
          location: newProfileData.location,
          website: newProfileData.website,
          twitter: newProfileData.twitter,
          github: newProfileData.github,
          avatar: newProfileData.avatar,
        })
        .eq("id", session.user.id);
    }
  };

  // 2. Fetch Content from Supabase (Articles and Feed)
  useEffect(() => {
    async function loadCloudData() {
      if (!supabase) return;

      try {
        const { data: cloudArticles, error: artError } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!artError && cloudArticles && cloudArticles.length > 0) {
          const mappedArticles = cloudArticles.map((a) => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            author: a.author,
            authorId: a.author_id,
            readTime: a.read_time,
            category: a.category,
            coverImage: a.cover_image,
            date: new Date(a.created_at).toLocaleDateString(),
          }));

          setArticles((localArticles) => {
            const map = new Map();
            localArticles.forEach((item) => map.set(item.id, item));
            mappedArticles.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }

        const { data: cloudFeed, error: feedError } = await supabase
          .from("feed_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (!feedError && cloudFeed && cloudFeed.length > 0) {
          const mappedFeed = cloudFeed.map((item) => ({
            id: item.id,
            type: item.type || "note",
            author: item.author,
            authorId: item.author_id,
            handle: item.handle,
            avatar: item.avatar,
            content: item.content,
            headlineTitle: item.headline_title,
            headlineSnippet: item.headline_snippet,
            readTime: item.read_time,
            likes: item.likes || 0,
            reposts: item.reposts || 0,
            comments: [],
            time: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently",
          }));

          setFeedItems((localFeed) => {
            const map = new Map();
            localFeed.forEach((item) => map.set(item.id, item));
            mappedFeed.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn("Using offline localStorage fallback:", err);
      }
    }

    loadCloudData();
  }, []);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem("inkwell_articles", JSON.stringify(articles)); }, [articles]);
  useEffect(() => { localStorage.setItem("inkwell_feed", JSON.stringify(feedItems)); }, [feedItems]);
  useEffect(() => { localStorage.setItem("inkwell_bookmarks", JSON.stringify(bookmarkedIds)); }, [bookmarkedIds]);
  useEffect(() => { localStorage.setItem("inkwell_restacks", JSON.stringify(restackedIds)); }, [restackedIds]);
  useEffect(() => { localStorage.setItem("inkwell_subscribers", JSON.stringify(subscribers)); }, [subscribers]);
  useEffect(() => { localStorage.setItem("inkwell_following", JSON.stringify(following)); }, [following]);
  useEffect(() => { localStorage.setItem("inkwell_profile", JSON.stringify(profile)); }, [profile]);

  // Actions
  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleRestack = (id) => {
    setRestackedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleFollowAuthor = (authorId) => {
    setFollowing((prev) => (prev.includes(authorId) ? prev.filter((i) => i !== authorId) : [...prev, authorId]));
  };

  const handleSubscribeToNewsletter = (email) => {
    if (!email || subscribers.includes(email)) return false;
    setSubscribers((prev) => [email, ...prev]);
    return true;
  };

  const handleUnsubscribe = (emailToUnsub) => {
    setSubscribers((prev) => prev.filter((email) => email !== emailToUnsub));
  };

  const handleDeleteArticle = async (articleId) => {
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    setBookmarkedIds((prev) => prev.filter((id) => id !== articleId));
    setFeedItems((prev) => prev.filter((item) => item.articleId !== articleId));

    if (supabase) {
      await supabase.from("articles").delete().eq("id", articleId);
    }
  };

  const handleDeletePost = async (postId) => {
    setFeedItems((prev) => prev.filter((item) => item.id !== postId));
    setRestackedIds((prev) => prev.filter((id) => id !== postId));
    setBookmarkedIds((prev) => prev.filter((id) => id !== postId));

    if (supabase) {
      await supabase.from("feed_items").delete().eq("id", postId);
    }
  };

  const handlePublishArticle = async (newArticle) => {
    const fullArticle = {
      ...newArticle,
      author: profile.name,
      authorId: profile.id,
    };

    setArticles((prev) => [fullArticle, ...prev]);

    if (supabase) {
      await supabase.from("articles").insert([
        {
          id: fullArticle.id,
          title: fullArticle.title,
          excerpt: fullArticle.excerpt,
          content: fullArticle.content,
          author: fullArticle.author,
          author_id: fullArticle.authorId,
          read_time: fullArticle.readTime,
          category: fullArticle.category,
          cover_image: fullArticle.coverImage,
        },
      ]);
    }

    const feedSnippet = {
      id: `feed-${Date.now()}`,
      type: "headline",
      articleId: fullArticle.id,
      author: fullArticle.author,
      authorId: fullArticle.authorId,
      handle: profile.handle,
      avatar: profile.avatar,
      time: "Just now",
      headlineTitle: fullArticle.title,
      headlineSnippet: fullArticle.excerpt,
      readTime: fullArticle.readTime,
      likes: 0,
      reposts: 0,
      comments: [],
    };

    setFeedItems((prev) => [feedSnippet, ...prev]);

    if (supabase) {
      await supabase.from("feed_items").insert([
        {
          id: feedSnippet.id,
          type: "headline",
          author: feedSnippet.author,
          author_id: feedSnippet.authorId,
          handle: feedSnippet.handle,
          avatar: feedSnippet.avatar,
          headline_title: feedSnippet.headlineTitle,
          headline_snippet: feedSnippet.headlineSnippet,
          read_time: feedSnippet.readTime,
        },
      ]);
    }

    setCurrentView("reader");
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-[#111111] text-neutral-400 font-serif">
        Loading Inkwell...
      </div>
    );
  }

  // If not signed in, show the editorial landing/login page
  if (!session) {
    return (
      <AuthPage
        onAuthSuccess={(user) => {
          fetchUserProfile(user);
          setCurrentView("feed");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-editorial-bg dark:bg-[#111111] text-editorial-dark dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        theme={theme}
        onToggleTheme={toggleTheme}
        profile={profile}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        {currentView === "feed" && (
          <FeedView
            feedItems={feedItems}
            setFeedItems={setFeedItems}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            restackedIds={restackedIds}
            onToggleRestack={toggleRestack}
            following={following}
            onToggleFollow={toggleFollowAuthor}
            profile={profile}
            onSelectArticle={() => setCurrentView("reader")}
          />
        )}

        {currentView === "reader" && (
          <ReaderHub
            articles={articles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            following={following}
            onToggleFollow={toggleFollowAuthor}
            onSubscribe={handleSubscribeToNewsletter}
            subscribers={subscribers}
          />
        )}

        {currentView === "chat" && (
          <ChatView
            profile={profile}
            following={following}
            subscribers={subscribers}
            allArticles={articles}
          />
        )}

        {currentView === "editor" && (
          <Editor onPublishComplete={handlePublishArticle} />
        )}

        {currentView === "profile" && (
          <ProfileView
            profile={profile}
            setProfile={handleUpdateProfile}
            subscribersCount={subscribers.length}
            followingCount={following.length}
            subscribers={subscribers}
            following={following}
            articles={articles.filter((a) => a.authorId === profile.id || a.author === profile.name)}
            allArticles={articles}
            feedItems={feedItems}
            bookmarkedIds={bookmarkedIds}
            restackedIds={restackedIds}
            onDeleteArticle={handleDeleteArticle}
            onDeletePost={handleDeletePost}
            onRemoveBookmark={toggleBookmark}
            onSelectArticle={() => setCurrentView("reader")}
            onSignOut={handleSignOut}
            onToggleFollow={toggleFollowAuthor}
            onUnsubscribe={handleUnsubscribe}
          />
        )}
      </main>
    </div>
  );
}