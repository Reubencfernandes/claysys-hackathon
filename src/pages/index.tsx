/**
 * Home page -- the main chat interface for the travel agent.
 *
 * This page uses the Vercel AI SDK's `useChat` hook to maintain a
 * streaming conversation with the `/api/chat` backend. It supports
 * deep-linking: a `?message=...` query parameter will automatically
 * send that message when the page loads (used by the landing page's
 * suggestion chips).
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, Suspense } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

function ChatContent() {
  const router = useRouter();
  const initialMessage =
    typeof router.query.message === "string" ? router.query.message : null;
  const hasSentInitial = useRef(false);
  const [inputValue, setInputValue] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current && messages.length === 0) {
      hasSentInitial.current = true;
      sendMessage({ text: initialMessage });
    }
  }, [initialMessage, sendMessage, messages.length]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] overflow-hidden font-sans antialiased">
      <ChatSidebar
        messages={messages}
        isLoading={isLoading}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
        onPlaceClick={() => {}}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white font-bold tracking-widest uppercase text-xs">
          Initialising Dashboard...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
