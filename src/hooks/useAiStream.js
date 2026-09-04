import { useState, useCallback } from "react";

export function useAiStream() {
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const streamResponse = useCallback(async (promptText, context = "") => {
    setIsStreaming(true);
    setOutput("");
    setError(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Fallback simulation if no API key is set
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const fallbackOutput = `[Dev Note: Add your VITE_GEMINI_API_KEY in .env to use live Gemini 3.6 Flash]\n\nGenerated output for: "${promptText}"\n\n• Micro-Frontend Decoupling: Domain isolation keeps bundle boundaries lightweight.\n• High Performance: Zero-runtime compilation delivers instant page loads.\n• Editorial Clarity: Minimalist typography enhances sustained reading attention.`;

      const words = fallbackOutput.split(" ");
      for (const word of words) {
        await new Promise((r) => setTimeout(r, 35));
        setOutput((prev) => (prev ? `${prev} ${word}` : word));
      }
      setIsStreaming(false);
      return;
    }

    try {
      const systemInstruction = context
        ? `You are an elite editorial writing assistant. Context from current draft:\n"""${context}"""\n\nProvide high-quality, publication-ready text. Do not add conversational conversational remarks (e.g., 'Sure, here is'). Answer directly.`
        : `You are an elite editorial writing assistant. Provide high-quality, publication-ready prose. Do not add conversational conversational remarks. Answer directly.`;

      // Google Interactions API endpoint
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: promptText,
          system_instruction: systemInstruction,
          stream: true,
          store: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.error?.message || `HTTP ${response.status}: Failed to generate content`
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle Interactions API step.delta stream format
            if (parsed.event_type === "step.delta") {
              const delta = parsed.delta;
              if (delta?.type === "text" && delta?.text) {
                setOutput((prev) => prev + delta.text);
              } else if (typeof delta === "string") {
                setOutput((prev) => prev + delta);
              }
            } 
            // Fallback for general text payloads
            else if (parsed.text) {
              setOutput((prev) => prev + parsed.text);
            }
          } catch {
            // Incomplete JSON chunk, buffer handles remainder
          }
        }
      }
    } catch (err) {
      console.error("Gemini 3.6 Flash Generation Error:", err);
      setError(err.message || "Failed to generate AI response. Check your API key and connection.");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const resetStream = useCallback(() => {
    setOutput("");
    setIsStreaming(false);
    setError(null);
  }, []);

  return { output, isStreaming, error, streamResponse, resetStream };
}