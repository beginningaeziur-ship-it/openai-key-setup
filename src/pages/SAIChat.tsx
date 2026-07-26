import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { StateIndicator } from "@/engine/StateIndicator";
import { useAppState } from "@/engine/StateEngineContext";
import { detectMode, ventReply, type ChatMode } from "@/lib/ventMode";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BG = "#0A1628";
const ACCENT = "#028090";

interface Msg {
  id: string;
  role: "user" | "sai";
  text: string;
}

const uid = () => Math.random().toString(36).slice(2);

export default function SAIChat() {
  const navigate = useNavigate();
  const { uiConfig } = useAppState();
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid(), role: "sai", text: "I'm here. Say whatever you need." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("normal");
  const [sending, setSending] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [safetyPlan, setSafetyPlan] = useState("");

  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const pushSai = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: "sai", text }]);
  }, []);

  const callSaiChat = useCallback(
    async (history: Msg[]): Promise<string> => {
      const payload = {
        messages: history.map((m) => ({
          role: m.role === "sai" ? "assistant" : "user",
          content: m.text,
        })),
        userContext: {
          uiState: uiConfig,
          maxChoices: uiConfig.maxChoices,
        },
      };
      try {
        const { data, error } = await supabase.functions.invoke("sai-chat", {
          body: payload,
        });
        if (error) throw error;
        if (typeof data === "string") return data;
        if (data && typeof (data as { content?: string }).content === "string") {
          return (data as { content: string }).content;
        }
        // SSE stream response returned as text
        return "I'm here with you.";
      } catch {
        return "I'm having trouble reaching my voice right now, but I'm still here.";
      }
    },
    [uiConfig],
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: uid(), role: "user", text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");

    const nextMode = detectMode(text, mode);
    setMode(nextMode);

    if (nextMode === "crisis") {
      pushSai("I'm right here. You're not alone. Choose one.");
      setSosOpen(true);
      return;
    }

    if (nextMode === "vent") {
      // Pure validation, no advice, no options.
      setTimeout(() => pushSai(ventReply()), 350);
      return;
    }

    setSending(true);
    try {
      const reply = await callSaiChat(nextHistory);
      pushSai(reply);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, messages, mode, pushSai, callSaiChat]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-dvh flex flex-col text-white" style={{ backgroundColor: BG }}>
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-3 border-b border-white/15 sticky top-0 bg-[#0A1628]/95 backdrop-blur z-30">
        <Link
          to="/sai-home"
          aria-label="Back to home"
          className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft className="w-6 h-6" aria-hidden="true" />
        </Link>
        <h1 className="text-xl font-semibold">SAI</h1>
        <StateIndicator />
      </header>

      <main role="main" aria-label="Chat with SAI" className="flex-1 flex flex-col">


      {/* Vent mode indicator */}
      {mode === "vent" && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mt-3 px-4 py-2 rounded-full text-base font-medium border"
          style={{ color: "#7FD8E0", borderColor: `${ACCENT}99`, backgroundColor: `${ACCENT}33` }}
        >
          Listening mode
        </div>
      )}
      {mode === "crisis" && (
        <div
          role="status"
          aria-live="assertive"
          className="mx-auto mt-3 px-4 py-2 rounded-full text-base font-semibold bg-red-600/30 text-red-100 border border-red-400"
        >
          You matter. Choose one option below.
        </div>
      )}

      {/* Messages */}
      <ul
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with SAI"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl w-full mx-auto"
      >

        {messages.map((m) => (
          <li
            key={m.id}
            role="listitem"
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[18px] leading-relaxed ${
                m.role === "user"
                  ? "text-white"
                  : "bg-white/[0.06] text-white border border-white/10"
              }`}
              style={m.role === "user" ? { backgroundColor: ACCENT } : undefined}
            >
              {m.text}
            </div>
          </li>
        ))}
        {sending && (
          <li role="listitem" className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-white/[0.06] border border-white/15">
              <LoadingSpinner label="SAI is thinking" />
            </div>
          </li>
        )}
      </ul>


      {/* Crisis lock: hide input, show only 2 options */}
      {mode === "crisis" ? (
        <div className="max-w-2xl w-full mx-auto px-4 pb-28 flex flex-col gap-3">
          <a
            href="tel:988"
            className="min-h-[64px] flex items-center justify-center rounded-2xl bg-red-600 hover:bg-red-700 text-white text-lg font-semibold px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Talk to a crisis counselor (988)
          </a>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <label htmlFor="crisis-plan" className="block text-sm text-white/70 mb-2">
              Build an immediate safety plan — type any steps that help right now.
            </label>
            <textarea
              id="crisis-plan"
              value={safetyPlan}
              onChange={(e) => setSafetyPlan(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-[#0A1628] border border-white/15 p-3 text-white text-[18px] focus:outline-none focus-visible:ring-2"
              placeholder="One safe person I can text. One place I can go. One thing I can do with my hands."
              aria-label="Your safety plan"
            />
            <p className="text-xs text-white/50 mt-2">
              This stays on your device unless you choose to save it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode("normal");
              pushSai("Okay. I'm still here. Take it slow.");
            }}
            className="text-white/60 text-sm underline underline-offset-4 hover:text-white/90 focus:outline-none focus-visible:ring-2 rounded"
          >
            I'm feeling calmer — exit crisis mode
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="sticky bottom-24 left-0 right-0 px-3 pb-2 pt-2 bg-gradient-to-t from-[#0A1628] via-[#0A1628] to-transparent"
        >
          <div className="max-w-2xl mx-auto flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              aria-label="Talk to SAI"
              placeholder={mode === "vent" ? "Keep going…" : "Talk to SAI"}
              className="flex-1 resize-none rounded-2xl bg-white/[0.06] border border-white/15 px-4 py-3 text-white text-[18px] leading-snug max-h-40 focus:outline-none focus-visible:ring-2"
              style={{ ["--tw-ring-color" as string]: ACCENT }}
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim() || sending}
              className="min-h-[52px] min-w-[52px] flex items-center justify-center rounded-2xl text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ backgroundColor: ACCENT }}
            >
              <Send className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
      </main>

      {/* SOS — rendered last so it is the final element in tab order */}

      <SosButton
        onSafetyPlan={() => {
          setMode("crisis");
          pushSai("Let's make a plan together, right now.");
        }}
      />
    </div>
  );
}

