import React from "react";
import {
  PenSquare,
  BookOpen,
  Layers,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

export default function Navbar({
  currentView,
  setCurrentView,
  theme,
  onToggleTheme,
  profile,
  onSignOut,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-editorial-border dark:border-[#2C2C2C] bg-[#FAF9F6]/80 dark:bg-[#111111]/80 backdrop-blur-md transition-colors">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentView("feed")}
          className="cursor-pointer font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          Inkwell<span className="text-amber-700 dark:text-amber-500">.</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Feed */}
          <button
            onClick={() => setCurrentView("feed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
              currentView === "feed"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Feed</span>
          </button>

          {/* Reader */}
          <button
            onClick={() => setCurrentView("reader")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
              currentView === "reader"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Read</span>
          </button>

          {/* Realtime Chat */}
          <button
            onClick={() => setCurrentView("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
              currentView === "chat"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          {/* Editor */}
          <button
            onClick={() => setCurrentView("editor")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
              currentView === "editor"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold"
                : "bg-neutral-900 dark:bg-neutral-800 text-white hover:bg-neutral-800 dark:hover:bg-neutral-700"
            }`}
          >
            <PenSquare className="w-4 h-4" />
            <span>Write</span>
          </button>

          <div className="w-[1px] h-4 bg-editorial-border dark:bg-[#333] mx-1" />

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => setCurrentView("profile")}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs border transition ${
              currentView === "profile"
                ? "border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold"
                : "border-editorial-border dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            title={`Profile & Settings (${profile?.name || "User"})`}
          >
            {profile?.avatar || "RZ"}
          </button>

          {/* Direct Sign Out */}
          <button
            onClick={onSignOut}
            className="p-2 text-neutral-400 hover:text-red-600 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}