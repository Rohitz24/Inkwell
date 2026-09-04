import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  FileText, 
  Lightbulb, 
  ListTree, 
  Loader2, 
  Send, 
  Copy, 
  Check, 
  CornerDownLeft,
  AlertCircle 
} from "lucide-react";

export default function AiSidebar({
  isOpen,
  onClose,
  onApplyAction,
  onCustomPrompt,
  onInsertText,
  output,
  isStreaming,
  error,
}) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmitCustomPrompt = (e) => {
    e.preventDefault();
    if (!customPrompt.trim() || isStreaming) return;
    onCustomPrompt(customPrompt.trim());
    setCustomPrompt("");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-editorial-border dark:border-[#2C2C2C] bg-white dark:bg-[#1A1A1A] flex flex-col h-full shadow-2xl z-50 text-neutral-800 dark:text-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-editorial-border dark:border-[#2C2C2C] flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-neutral-900 dark:text-white">Editorial Copilot</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-5">
        {/* Custom Prompt Input */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
            Ask Gemini Anything
          </span>
          <form onSubmit={handleSubmitCustomPrompt} className="relative">
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Write an engaging introduction about serverless architecture..."
              className="w-full text-xs border border-editorial-border dark:border-[#3A3A3A] bg-neutral-50 dark:bg-[#141414] rounded-xl p-3 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-800 dark:focus:ring-neutral-200 resize-none"
            />
            <button
              type="submit"
              disabled={!customPrompt.trim() || isStreaming}
              className="absolute right-2.5 bottom-3 p-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-30 transition"
              title="Send Prompt"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
            Quick Actions
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => onApplyAction("outline")}
              disabled={isStreaming}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-editorial-border dark:border-[#2C2C2C] bg-white dark:bg-[#141414] rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-[#242424] transition"
            >
              <ListTree className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Generate Article Outline</span>
            </button>
            <button
              onClick={() => onApplyAction("titles")}
              disabled={isStreaming}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-editorial-border dark:border-[#2C2C2C] bg-white dark:bg-[#141414] rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-[#242424] transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Suggest 5 Captivating Titles</span>
            </button>
            <button
              onClick={() => onApplyAction("tldr")}
              disabled={isStreaming}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-editorial-border dark:border-[#2C2C2C] bg-white dark:bg-[#141414] rounded-lg text-left hover:bg-neutral-50 dark:hover:bg-[#242424] transition"
            >
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Write 3-Bullet Summary (TL;DR)</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Streaming Output Box */}
        {(isStreaming || output) && (
          <div className="border border-editorial-border dark:border-[#333333] bg-neutral-50 dark:bg-[#141414] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 pb-2 border-b border-neutral-200 dark:border-[#262626]">
              <span className="flex items-center gap-1.5">
                <span>AI Output</span>
                {isStreaming && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
              </span>

              {output && !isStreaming && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:text-neutral-900 dark:hover:text-white transition"
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onInsertText(output)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded text-[11px] font-medium"
                    title="Insert directly into document"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Insert</span>
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-sans select-text">
              {output}
              {isStreaming && (
                <span className="inline-block w-1.5 h-3.5 bg-amber-600 dark:bg-amber-400 ml-1 animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}