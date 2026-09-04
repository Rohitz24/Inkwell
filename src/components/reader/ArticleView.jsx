import React, { useState } from "react";
import { Headphones, Clock, Mail, CheckCircle2, UserPlus, UserCheck } from "lucide-react";
import StickyActionBar from "./StickyActionBar";

export default function ArticleView({
  article,
  isBookmarked,
  onToggleBookmark,
  following = [],
  onToggleFollow,
  onSubscribe,
  subscribers = [],
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    if (onSubscribe) {
      onSubscribe(email);
    }
    setSubscribed(true);
  };

  const isFollowingAuthor = article?.authorId && following.includes(article.authorId);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 relative">
      <header className="mb-10 text-center md:text-left">
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-neutral-200 dark:bg-[#262626] text-xs font-semibold tracking-wide uppercase text-neutral-700 dark:text-neutral-300">
          {article?.type || "Article"}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight leading-tight mb-6 text-neutral-900 dark:text-white">
          {article?.title}
        </h1>

        <div className="flex items-center justify-between border-y border-editorial-border dark:border-[#2C2C2C] py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center font-serif text-lg font-bold">
              {article?.author?.slice(0, 2).toUpperCase() || "RZ"}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {article?.author || "Author"}
                </span>
                {article?.authorId && (
                  <button
                    onClick={() => onToggleFollow && onToggleFollow(article.authorId)}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
                  >
                    {isFollowingAuthor ? "Following" : "+ Follow"}
                  </button>
                )}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <span>{article?.date || "Recently"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {article?.readTime || "5 min read"}
                </span>
              </div>
            </div>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 border border-editorial-border dark:border-[#2C2C2C] rounded-full text-xs font-medium hover:bg-neutral-100 dark:hover:bg-[#222222] transition text-neutral-700 dark:text-neutral-300">
            <Headphones className="w-4 h-4" />
            <span>Listen</span>
          </button>
        </div>
      </header>

      {/* Prose Text Reader Container with explicit dark inversion */}
      <article
        className="prose prose-neutral dark:prose-invert prose-lg max-w-none font-serif leading-relaxed text-neutral-800 dark:text-neutral-200"
        dangerouslySetInnerHTML={{ __html: article?.content || "<p>Content unavailable.</p>" }}
      />

      {/* Dynamic Newsletter Subscription Card */}
      <section className="my-16 p-8 rounded-2xl bg-neutral-100 dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2C2C2C] text-center max-w-xl mx-auto transition-colors">
        <div className="w-10 h-10 bg-white dark:bg-[#2A2A2A] shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-editorial-border dark:border-[#3A3A3A] text-neutral-800 dark:text-neutral-200">
          <Mail className="w-5 h-5" />
        </div>
        <h3 className="font-serif text-2xl font-semibold mb-2 text-neutral-900 dark:text-white">
          Subscribe to {article?.author}'s Dispatch
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
          Get insightful essays and updates delivered directly to your inbox.
        </p>

        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium py-2 text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>You're subscribed! ({subscribers.length} total subscribers)</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email..."
              required
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-[#3A3A3A] text-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 bg-white dark:bg-[#141414] text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
            >
              Subscribe
            </button>
          </form>
        )}
      </section>

      <StickyActionBar
        articleId={article?.id}
        isBookmarked={isBookmarked}
        onToggleBookmark={onToggleBookmark}
      />
    </main>
  );
}