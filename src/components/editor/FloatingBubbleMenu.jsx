import React from "react";
import { Sparkles, Check, Scissors, Wand2 } from "lucide-react";

export default function FloatingBubbleMenu({ onAction }) {
  return (
    <div className="flex items-center gap-1 bg-neutral-900 text-white rounded-lg shadow-xl px-2 py-1.5 border border-neutral-700 text-xs">
      <button
        onClick={() => onAction("improve")}
        className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-800 rounded transition"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        Improve
      </button>
      <div className="w-[1px] h-3 bg-neutral-700" />
      <button
        onClick={() => onAction("grammar")}
        className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-800 rounded transition"
      >
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        Grammar
      </button>
      <button
        onClick={() => onAction("shorter")}
        className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-800 rounded transition"
      >
        <Scissors className="w-3.5 h-3.5 text-sky-400" />
        Shorten
      </button>
      <button
        onClick={() => onAction("tone")}
        className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-800 rounded transition"
      >
        <Wand2 className="w-3.5 h-3.5 text-purple-400" />
        Elevate Tone
      </button>
    </div>
  );
}