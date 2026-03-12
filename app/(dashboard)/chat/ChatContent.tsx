"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Paperclip,
  Smile,
  MapPin,
  Calendar,
  Wallet,
  CheckSquare,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PageContainer } from "@/components/layout";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

type ConversationItem = {
  id: string;
  other: { id: string; name: string | null; profilePhoto: string | null };
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  lastMessageAt: string | null;
};

type MessageItem = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string | null; profilePhoto: string | null };
};

export function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const conversationIdFromUrl = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState<string | null>(null);

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const data = await apiFetch<ConversationItem[]>("/api/conversations");
      setConversations(data);
    } catch (e) {
      setConversationsError(
        e instanceof Error ? e.message : "Failed to load conversations"
      );
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (convId: string, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setMessagesLoading(true);
        setMessagesError(null);
      }
      try {
        const data = await apiFetch<MessageItem[]>(
          `/api/conversations/${convId}/messages`
        );
        setMessages(data);
      } catch (e) {
        if (!options?.silent) {
          setMessagesError(
            e instanceof Error ? e.message : "Failed to load messages"
          );
          setMessages([]);
        }
      } finally {
        if (!options?.silent) {
          setMessagesLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!conversationIdFromUrl || conversations.length === 0) {
      if (!conversationIdFromUrl && conversations.length > 0) {
        const first = conversations[0];
        setSelectedConversation(first);
        router.replace(`/chat?conversationId=${first.id}`, { scroll: false });
      } else {
        setSelectedConversation(null);
        setMessages([]);
      }
      return;
    }

    const found = conversations.find((c) => c.id === conversationIdFromUrl);
    if (found) {
      setSelectedConversation(found);
      loadMessages(conversationIdFromUrl);
    } else {
      setSelectedConversation(null);
      setMessages([]);
      setMessagesError("Conversation not found");
    }
  }, [conversationIdFromUrl, conversations, loadMessages, router]);

  useEffect(() => {
    if (!selectedConversation?.id) return;
    const interval = setInterval(() => {
      loadMessages(selectedConversation.id, { silent: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConversation?.id, loadMessages]);

  useEffect(() => {
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const handleSelectConversation = (conv: ConversationItem) => {
    setSelectedConversation(conv);
    router.replace(`/chat?conversationId=${conv.id}`, { scroll: false });
  };

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || !selectedConversation || sendLoading) return;

    setSendLoading(true);
    const prevMessages = [...messages];
    const optimisticMsg: MessageItem = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      senderId: currentUser!.id,
      sender: {
        id: currentUser!.id,
        name: currentUser!.name,
        profilePhoto: currentUser!.profilePhoto,
      },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue("");

    try {
      const created = await apiFetch<MessageItem & { warning?: string }>(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        }
      );
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? created : m))
      );
      if (created.warning) {
        setMessagesError(created.warning);
        setTimeout(() => setMessagesError(null), 4000);
      }
    } catch (e) {
      setMessages(prevMessages);
      setInputValue(content);
      setMessagesError(
        e instanceof Error ? e.message : "Failed to send message"
      );
    } finally {
      setSendLoading(false);
    }
  };

  const otherUser = selectedConversation?.other;
  const isFromMe = (senderId: string) => currentUser?.id === senderId;
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (currentUser === undefined || (currentUser === null && !conversationsError)) {
    return (
      <div className="min-h-[280px] flex items-center justify-center pb-20 md:pb-0 w-full">
        <Loader2 className="w-10 h-10 text-[#FF6B35] animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[280px] flex flex-col items-center justify-center gap-4 pb-20 md:pb-0 w-full">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <p className="text-gray-600">Please log in to view conversations.</p>
        <Link
          href="/login"
          className="text-primary-600 font-semibold hover:underline"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <PageContainer>
    <div className="min-h-[400px] flex flex-col lg:flex-row gap-6 pb-20 md:pb-0 w-full min-w-0">
      <div className="flex-shrink-0 lg:w-80 min-w-0 border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden hidden lg:flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Conversations</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {conversationsLoading && (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          )}
          {conversationsError && !conversationsLoading && (
            <div className="p-6 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <p className="text-sm text-gray-600">{conversationsError}</p>
              <button
                type="button"
                onClick={loadConversations}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                Retry
              </button>
            </div>
          )}
          {!conversationsLoading && !conversationsError && conversations.length === 0 && (
            <div className="p-6 flex flex-col items-center gap-3 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-500">No conversations yet.</p>
              <Link
                href="/explore"
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                Find travel buddies
              </Link>
            </div>
          )}
          {!conversationsLoading &&
            conversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <Image
                    src={conv.other.profilePhoto || DEFAULT_AVATAR}
                    alt={conv.other.name ?? "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.other.name ?? "Traveler"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.content
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

        <div className="flex-1 flex flex-col min-h-[200px] min-w-0 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-shadow">
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            {conversations.length === 0 ? (
              <>
                <MessageCircle className="w-16 h-16 text-gray-200" />
                <p className="text-gray-500">No conversations yet.</p>
                <Link
                  href="/explore"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Explore travelers to start chatting
                </Link>
              </>
            ) : (
              <p className="text-gray-500">Select a conversation to start chatting.</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Image
                src={otherUser!.profilePhoto || DEFAULT_AVATAR}
                alt={otherUser!.name ?? "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherUser!.name ?? "Traveler"}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-primary-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-gray-500">Messages update automatically</p>
              </div>
            </div>

            {messagesError && (
              <div className="mx-4 mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between gap-3">
                <span className="text-sm text-amber-800">{messagesError}</span>
                <button
                  type="button"
                  onClick={() => loadMessages(selectedConversation.id)}
                  className="text-amber-700 text-sm font-medium hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#FF6B35] animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <p className="text-sm">No messages yet. Say hi!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      isFromMe(m.senderId) ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] min-w-0 rounded-2xl px-4 py-2.5 break-words ${
                        isFromMe(m.senderId)
                          ? "bg-[#FF6B35] text-white rounded-br-md shadow-sm"
                          : "bg-gray-100 text-slate-900 rounded-bl-md"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isFromMe(m.senderId)
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Attach"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                disabled={sendLoading}
              />
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Emoji"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || sendLoading}
                className="p-3 rounded-xl bg-[#FF6B35] hover:bg-primary-700 text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

        <div className="hidden xl:block w-80 flex-shrink-0 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Trip planning</h3>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-500">
            Trip details can be linked here when available.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium">Destination</p>
                <p className="text-gray-500 text-sm">—</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium">Dates</p>
                <p className="text-gray-500 text-sm">—</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-gray-500 text-sm">—</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Checklist
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>☐ Plan trip with your buddy</li>
                <li>☐ Share dates and destination</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageContainer>
  );
}
