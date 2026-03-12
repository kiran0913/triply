import { Suspense } from "react";
import { ChatContent } from "./ChatContent";

export const dynamic = "force-dynamic";

function ChatFallback() {
  return (
    <div className="min-h-[280px] flex items-center justify-center w-full">
      <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatFallback />}>
      <ChatContent />
    </Suspense>
  );
}
