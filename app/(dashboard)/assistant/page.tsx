"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Loader2, Sparkles, MapPin, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/Button";

type Message = {
  role: "user" | "assistant";
  content: string;
  itinerarySuggestions?: Array<{
    destination?: string;
    dates?: string;
    days?: Array<{
      day: number;
      title: string;
      activities?: Array<{
        time?: string;
        title: string;
        description?: string;
      }>;
    }>;
    totalEstimatedCost?: string;
  }>;
  tripRecommendations?: Array<{
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }>;
};

const SUGGESTED_PROMPTS = [
  "I'm visiting Japan for 7 days in October. Any suggestions?",
  "What trips could I join this month?",
  "Suggest a 3-day itinerary for Paris",
  "I love hiking and nature. Where should I go?",
  "Help me find travel buddies for a beach trip",
];

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");
      setError(null);
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = await apiFetch<{
          text: string;
          itinerarySuggestions?: Message["itinerarySuggestions"];
          tripRecommendations?: Message["tripRecommendations"];
        }>("/api/ai/assistant", {
          method: "POST",
          body: JSON.stringify({
            message: trimmed,
            messages: history.length > 0 ? history : undefined,
          }),
        });

        const assistantMessage: Message = {
          role: "assistant",
          content: res.text,
          itinerarySuggestions: res.itinerarySuggestions,
          tripRecommendations: res.tripRecommendations,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to get response");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I couldn't process that. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-primary-500" />
        <h1 className="text-xl font-bold text-gray-900">AI Travel Assistant</h1>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Ask about destinations, itineraries, trips to join, or travel buddies.
      </p>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              Try one of these to get started:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors text-left max-w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && m.itinerarySuggestions && m.itinerarySuggestions.length > 0 && (
                <div className="mt-4 space-y-3">
                  {m.itinerarySuggestions.map((it, j) => (
                    <div
                      key={j}
                      className="rounded-xl border border-gray-200 bg-white p-4 text-gray-800"
                    >
                      <div className="flex items-center gap-2 text-primary-600 font-medium mb-2">
                        <MapPin className="w-4 h-4" />
                        {it.destination}
                        {it.dates && ` · ${it.dates}`}
                      </div>
                      {it.days?.map((d) => (
                        <div key={d.day} className="mt-2">
                          <p className="font-medium text-sm">Day {d.day}: {d.title}</p>
                          {d.activities?.map((a, k) => (
                            <p key={k} className="text-sm text-gray-600 ml-2">
                              {a.time && `${a.time} – `}{a.title}
                              {a.description && ` · ${a.description}`}
                            </p>
                          ))}
                        </div>
                      ))}
                      {it.totalEstimatedCost && (
                        <p className="text-sm text-gray-500 mt-2">
                          Est. {it.totalEstimatedCost}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {m.role === "assistant" && m.tripRecommendations && m.tripRecommendations.length > 0 && (
                <div className="mt-4 space-y-2">
                  {m.tripRecommendations.map((t) => (
                    <Link
                      key={t.id}
                      href={`/trips/${t.id}`}
                      className="block rounded-xl border border-primary-200 bg-primary-50 p-3 hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-primary-700 font-medium">
                        <Calendar className="w-4 h-4" />
                        {t.title}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {t.destination} · {formatDate(t.startDate)} – {formatDate(t.endDate)}
                      </p>
                      {t.reason && (
                        <p className="text-xs text-gray-500 mt-1">{t.reason}</p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about trips, destinations, itineraries..."
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
