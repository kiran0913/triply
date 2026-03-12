"use client";

import { useEffect, useState, useCallback } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TripCopilotChat } from "./TripCopilotChat";

type CopilotMessage = {
  id: string;
  role: string;
  message: string;
  createdAt: string;
};

interface TripCopilotPanelProps {
  tripId: string;
  onItineraryRefresh?: () => void;
}

export function TripCopilotPanel({
  tripId,
  onItineraryRefresh,
}: TripCopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<CopilotMessage[]>(
        `/api/ai/copilot?tripId=${encodeURIComponent(tripId)}`
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <div className="rounded-xl border border-primary-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-gray-900">Trip Copilot</span>
          <span className="text-xs text-gray-500">AI travel assistant</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {loading ? (
            <div className="h-[360px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : (
            <TripCopilotChat
              tripId={tripId}
              messages={messages}
              onMessagesChange={loadMessages}
              onItineraryRefresh={onItineraryRefresh}
            />
          )}
        </div>
      )}
    </div>
  );
}
