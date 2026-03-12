"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { CopilotSuggestionCards, SuggestedActivity } from "./CopilotSuggestionCards";

type CopilotMessage = {
  id: string;
  role: string;
  message: string;
  createdAt: string;
};

interface TripCopilotChatProps {
  tripId: string;
  messages: CopilotMessage[];
  onMessagesChange: () => void;
  onItineraryRefresh?: () => void;
}

const SUGGESTED_PROMPTS = [
  "Plan day 2 activities in our destination",
  "What should we do tonight?",
  "Estimate total cost for this itinerary",
  "Find activities everyone would enjoy",
  "Optimize our itinerary",
];

export function TripCopilotChat({
  tripId,
  messages,
  onMessagesChange,
  onItineraryRefresh,
}: TripCopilotChatProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuggestions, setLastSuggestions] = useState<SuggestedActivity[]>([]);
  const [pending, setPending] = useState<{ user: string; assistant?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current && pending) {
      setPending(null);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, pending]);

  const displayMessages: Array<{ id: string; role: string; message: string }> = [
    ...messages,
    ...(pending
      ? [
          { id: "pending-user", role: "user" as const, message: pending.user },
          ...(pending.assistant
            ? [{ id: "pending-assistant", role: "assistant" as const, message: pending.assistant }]
            : []),
        ]
      : []),
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);
    setLastSuggestions([]);
    setPending({ user: trimmed });
    setLoading(true);

    try {
      const res = await apiFetch<{
        reply: string;
        suggestedActivities?: SuggestedActivity[];
        itineraryUpdates?: SuggestedActivity[];
      }>("/api/ai/copilot", {
        method: "POST",
        body: JSON.stringify({ tripId, message: trimmed }),
      });

      const suggestions =
        (res.suggestedActivities?.length ?? 0) > 0
          ? res.suggestedActivities ?? []
          : res.itineraryUpdates ?? [];
      setLastSuggestions(suggestions);
      setPending((p) => (p ? { ...p, assistant: res.reply } : null));
      onMessagesChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get response");
      setPending(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[360px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-3 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="text-center py-6 text-gray-500 text-sm">
            <p className="mb-4">Ask Copilot anything about this trip:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {displayMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                m.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.message}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-2.5 bg-gray-100 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {lastSuggestions.length > 0 && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
          <CopilotSuggestionCards
            tripId={tripId}
            activities={lastSuggestions}
            onAdded={onItineraryRefresh}
          />
        </div>
      )}

      {error && (
        <div className="px-3 py-2 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2 p-3 border-t border-gray-100"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot..."
          maxLength={2000}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
