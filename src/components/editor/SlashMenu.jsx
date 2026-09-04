import React from "react";
import { Heading1, Heading2, List, Sparkles } from "lucide-react";

export default function SlashMenu({ onSelect }) {
  const options = [
    { label: "Heading 1", icon: Heading1, command: "h1" },
    { label: "Heading 2", icon: Heading2, command: "h2" },
    { label: "Bullet List", icon: List, command: "bullet" },
    { label: "Ask Copilot to Write...", icon: Sparkles, command: "ai" },
  ];

  return (
    <div className="absolute z-30 bg-white border border-editorial-border shadow-xl rounded-xl p-1.5 w-60">
      <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
        Insert Block
      </div>
      {options.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.command}
            onClick={() => onSelect(item.command)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-md transition text-left"
          >
            <Icon className="w-4 h-4 text-neutral-500" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}