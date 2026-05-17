import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useStore, useTotals } from "@/lib/store";
import { CHAT_SUGGESTIONS, generateChatReply } from "@/lib/services/chat";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant — SmartSave AI" },
      { name: "description", content: "Chat with your AI budgeting assistant about your finances." },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <ChatPage />
      </AppShell>
    </AuthGate>
  ),
});

function ChatPage() {
  const { chat, pushChat, income, pots } = useStore();
  const { remaining, dailySafe, insights } = useTotals();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.length, thinking]);

  const send = (text: string) => {
    if (!text.trim() || thinking) return;
    pushChat({ role: "user", content: text });
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = generateChatReply(text, { income, pots, remaining, dailySafe, insights });
      pushChat({ role: "assistant", content: reply });
      setThinking(false);
    }, 450);
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl flex flex-col h-[calc(100vh-2rem)] md:h-screen">
      <header className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          AI <span className="gradient-text">assistant</span>
        </h1>
        <p className="text-muted-foreground">Ask anything about your spending, savings, or budget.</p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-border/50 shadow-card p-4 md:p-6 space-y-4 mb-4"
        style={{ background: "var(--gradient-card)" }}
      >
        {chat.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-mint)" }}>
                <Sparkles className="size-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted/60 rounded-bl-sm"
              }`}
              dangerouslySetInnerHTML={{
                __html: m.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
              }}
            />
          </div>
        ))}
        {thinking && (
          <div className="flex gap-3">
            <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-mint)" }}>
              <Sparkles className="size-4 text-primary-foreground animate-pulse" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-muted/60 rounded-bl-sm flex gap-1">
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "120ms" }} />
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {CHAT_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={thinking}
            className="text-xs px-3 py-1.5 rounded-full bg-muted/40 border border-border/50 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your budget…"
          className="flex-1 px-4 py-3 rounded-xl bg-input/60 border border-border outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-3 rounded-xl text-primary-foreground hover:opacity-90 shadow-glow inline-flex items-center gap-2"
          style={{ background: "var(--gradient-mint)" }}
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
