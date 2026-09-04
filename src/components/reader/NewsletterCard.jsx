import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function NewsletterCard() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <section className="my-16 p-8 rounded-2xl bg-neutral-100 border border-editorial-border text-center max-w-xl mx-auto">
      <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-editorial-border text-neutral-800">
        <Mail className="w-5 h-5" />
      </div>
      <h3 className="font-serif text-2xl font-semibold mb-2">Subscribe to Inkwell Dispatch</h3>
      <p className="text-editorial-muted text-sm mb-6 leading-relaxed">
        Thoughtful essays on system design, AI agents, and frontend engineering delivered every Sunday morning.
      </p>

      {subscribed ? (
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium py-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>You are subscribed! Check your inbox soon.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type your email..."
            required
            className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 bg-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}