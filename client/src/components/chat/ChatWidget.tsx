import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useChatAutoScroll } from "../../hooks/useChatAutoScroll";
import { ChatActionChip } from "./ChatActionChip";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWidget() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isOpen = useChatStore((state) => state.isOpen);
  const toggle = useChatStore((state) => state.toggle);
  const close = useChatStore((state) => state.close);
  const messages = useChatStore((state) => state.messages);
  const isSending = useChatStore((state) => state.isSending);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const [draft, setDraft] = useState("");
  const { containerRef, handleScroll } = useChatAutoScroll(messages.length + (isSending ? 1 : 0));

  // The agent can act on the cart/checkout, which require a logged-in user.
  if (!isAuthenticated) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft;
    setDraft("");
    sendMessage(text);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-zinc-950 shadow-xl hover:bg-zinc-200"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-24 right-5 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-white">Eidolon Assistant</p>
                <p className="text-xs text-zinc-400">Recommends & helps you buy</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-zinc-400 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`whitespace-pre-line rounded-2xl px-4 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-white text-zinc-950"
                          : "bg-zinc-800 text-zinc-100"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.actions?.map((action, i) => (
                      <ChatActionChip key={i} action={action} />
                    ))}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask for a recommendation..."
                  className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
