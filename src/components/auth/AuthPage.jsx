import React, { useState } from "react";
import { Mail, Lock, User, ArrowRight, BookOpen, AlertCircle, Loader2, Quote } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthPage({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Direct Google Authentication
  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setErrorMsg("Supabase client is not configured. Check your .env file.");
      return;
    }
    setGoogleLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || "Failed to initiate Google Sign-In.");
      setGoogleLoading(false);
    }
  };

  // Standard Email Authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Supabase client is not configured. Check your .env file.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("rate limit")) {
            throw new Error(
              "Supabase email rate limit exceeded. Please disable 'Confirm email' in your Supabase Auth dashboard or sign in with Google."
            );
          }
          throw error;
        }

        if (data?.user) {
          onAuthSuccess(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data?.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF9F6] dark:bg-[#111111] text-neutral-900 dark:text-neutral-100 selection:bg-amber-200">
      
      {/* Editorial Quote & Branding Canvas */}
      <div className="md:w-1/2 bg-neutral-900 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none select-none font-serif text-[18rem] leading-none">
          ¶
        </div>

        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span className="font-serif text-2xl font-bold tracking-tight">
              Inkwell<span className="text-amber-500">.</span>
            </span>
          </div>

          <div className="max-w-md my-auto pt-10">
            <Quote className="w-8 h-8 text-amber-500/80 mb-4" />
            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-snug tracking-tight mb-6">
              "We write to taste life twice, in the moment and in retrospect."
            </h1>
            <p className="text-neutral-400 text-sm font-sans tracking-wide">
              — Anaïs Nin
            </p>
          </div>
        </div>

        <div className="z-10 pt-12 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>A sanctuary for long-form essays, notes, and technical dispatches.</span>
          <span>© 2026</span>
        </div>
      </div>

      {/* Account Login / Signup Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {isSignUp ? "Create your account" : "Sign in to Inkwell"}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {isSignUp
                ? "Enter your details below to establish your profile and writer identity."
                : "Welcome back. Continue reading, composing, and connecting."}
            </p>
          </div>

          {/* Direct Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2E2E2E] rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#242424] transition flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-5">
            <div className="w-full border-t border-editorial-border dark:border-[#2E2E2E]" />
            <span className="bg-[#FAF9F6] dark:bg-[#111111] px-3 text-[11px] uppercase tracking-wider text-neutral-400 select-none">
              or with email
            </span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rohit Zade"
                    className="w-full text-xs pl-10 pr-3.5 py-3 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2E2E2E] rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 shadow-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2E2E2E] rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-3 bg-white dark:bg-[#1A1A1A] border border-editorial-border dark:border-[#2E2E2E] rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-editorial-border dark:border-[#2E2E2E] text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="font-semibold text-neutral-900 dark:text-white underline hover:text-amber-700 dark:hover:text-amber-400 transition"
              >
                {isSignUp ? "Log In" : "Create an Account"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}