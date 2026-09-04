Inkwell
An editorial publishing platform and writer community built with React, Tailwind CSS, Supabase, and Google Gemini AI.

Features
Editorial Reading & Reader Hub: Minimalist, distraction-free typography optimized for sustained reading, featuring read-time estimations, bookmarks, and publication tags.

Dynamic Feed: Micro-post thoughts, quotes, and essay teasers with likes, inline comment threads, restacks, and bookmarking.

AI-Powered Writer Studio: An editorial writing workspace paired with real-time text streaming powered by Google's gemini-3.6-flash via the Interactions API.

Real-Time Messaging: Direct messaging and dialogue between mutual followers and newsletter subscribers backed by Supabase Realtime websocket replication.

Audience & Network Management: In-profile expandable subscriber lists and author follower management with immediate unsubscribe/unfollow controls.

Authentication & Security: Custom editorial landing page supporting email/password auth and direct Google OAuth via Supabase Auth, coupled with password reset and profile privacy controls.

Theme Support: High-contrast editorial dark mode and classic print light mode with persistent state.

Tech Stack
Frontend: React 18, Vite, Tailwind CSS, Lucide Icons
Backend & Database: Supabase (PostgreSQL, Row-Level Security, Realtime Subscriptions, Auth)
AI Streaming: Google Gemini API (gemini-3.6-flash over the Interactions API)

Getting Started
1. Clone the repository
Bash
git clone https://github.com/Rohitz24/Inkwell.git
cd inkwell
2. Install dependencies
Bash
npm install
3. Start local development server
Bash
npm run dev
4. Build for production
Bash
npm run build
