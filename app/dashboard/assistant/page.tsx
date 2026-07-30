"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  CircleAlert,
  MessageCircleMore,
  Send,
  Sparkles,
} from "lucide-react";
import { getClient } from "@/lib/supabase-dashboard";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const quickQuestions = [
  "Сколько стоит доставка?",
  "Где мои заказы?",
  "Как заполнить адрес в Китае?",
  "Где и когда забрать посылку?",
];

const welcomeMessage: Message = {
  role: "assistant",
  text: "Здравствуйте! Помогу узнать статус заказа, стоимость доставки или правильно заполнить адрес склада.",
};

export default function AssistantPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientCode, setClientCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;

    async function loadClient() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const client = await getClient(user.id);
      if (active && client) setClientCode(client.client_code);
    }

    loadClient();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: messages.length > 2 ? "smooth" : "auto",
      block: "end",
    });
  }, [messages, loading]);

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "48px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 104)}px`;
  }

  async function send(prefilledMessage?: string) {
    const userText = (prefilledMessage ?? input).trim();
    if (!userText || loading) return;

    const previousMessages = messages.slice(-8);

    setInput("");
    setError("");
    setMessages((current) => [
      ...current,
      { role: "user", text: userText },
    ]);
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "48px";

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          message: userText,
          client_code: clientCode,
          history: previousMessages,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Ошибка запроса");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data.reply ||
            "Не удалось получить ответ. Попробуйте сформулировать вопрос иначе.",
        },
      ]);
    } catch {
      setError("Не удалось связаться с помощником. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <div
      data-dashboard-assistant="true"
      className={[
        "fixed left-1/2 top-0 z-20 flex w-full max-w-[430px]",
        "-translate-x-1/2 flex-col overflow-hidden bg-white",
        "bottom-[calc(76px+env(safe-area-inset-bottom))]",
      ].join(" ")}
    >
      <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-[#E8EDF4] bg-white px-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#EDF3FF] text-[#1744A7]">
          <MessageCircleMore size={21} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="text-[16px] font-semibold leading-5 tracking-[-0.15px]">
            Помощник 3X Cargo
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium leading-4 text-[#17885F]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#18A875]" />
            Онлайн
          </p>
        </div>

        {clientCode && (
          <span className="rounded-full bg-[#F1F4F9] px-2.5 py-1 text-[11px] font-semibold text-[#5F708A]">
            {clientCode}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto bg-[#F7F9FC] px-4 pb-3 pt-4 [overscroll-behavior:contain]">
        {messages.length === 1 && (
          <section className="mb-5">
            <div className="mb-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#71809A]">
              <Sparkles size={14} strokeWidth={1.8} />
              Частые вопросы
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void send(question)}
                  className={[
                    "min-h-[48px] rounded-[14px] border border-[#DCE5F3]",
                    "bg-white px-3 py-2 text-left text-[12px]",
                    "font-medium leading-[16px] text-[#1744A7]",
                    "transition active:bg-[#EDF3FF]",
                  ].join(" ")}
                >
                  {question}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-3">
          {messages.map((message, index) => {
            const user = message.role === "user";

            return (
              <div
                key={`${message.role}-${index}`}
                className={[
                  "flex items-end gap-2",
                  user ? "justify-end" : "justify-start",
                ].join(" ")}
              >
                {!user && (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[#EDF3FF] text-[#1744A7]">
                    <MessageCircleMore size={16} strokeWidth={1.9} />
                  </span>
                )}

                <div
                  className={[
                    "max-w-[82%] whitespace-pre-wrap break-words px-3.5 py-2.5",
                    "text-[14px] leading-[20px]",
                    user
                      ? "rounded-[17px_17px_5px_17px] bg-[#1744A7] text-white"
                      : "rounded-[17px_17px_17px_5px] border border-[#DCE5F3] bg-white text-[#0A1E3D]",
                  ].join(" ")}
                >
                  {message.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-end gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[11px] bg-[#EDF3FF] text-[#1744A7]">
                <MessageCircleMore size={16} strokeWidth={1.9} />
              </span>
              <div className="flex h-10 items-center gap-1 rounded-[17px_17px_17px_5px] border border-[#DCE5F3] bg-white px-4">
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8B98AC]"
                    style={{ animationDelay: `${item * 160}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} className="h-1" />
      </div>

      {error && (
        <div className="flex items-center gap-2 border-t border-[#F1CCCC] bg-[#FFF7F7] px-4 py-2.5 text-[12px] font-medium text-[#BD3445]">
          <CircleAlert size={16} strokeWidth={1.9} className="shrink-0" />
          <span className="min-w-0 flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void send()}
            className="shrink-0 font-semibold text-[#1744A7]"
          >
            Повторить
          </button>
        </div>
      )}

      <footer className="shrink-0 border-t border-[#E8EDF4] bg-white px-3.5 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setError("");
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Напишите вопрос"
            rows={1}
            className={[
              "h-12 max-h-[104px] min-h-12 min-w-0 flex-1 resize-none",
              "overflow-y-auto rounded-[15px] border border-[#DCE4EF]",
              "bg-white px-3.5 py-[11px] text-[16px] leading-6",
              "text-[#0A1E3D] outline-none placeholder:text-[#9AA6B8]",
              "focus:border-[#6F94E8] focus:ring-2 focus:ring-[#EAF0FF]",
            ].join(" ")}
          />

          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() || loading}
            className={[
              "grid h-12 w-12 shrink-0 place-items-center rounded-[15px]",
              "transition active:scale-95",
              !input.trim() || loading
                ? "cursor-not-allowed bg-[#E8EDF5] text-[#8A97AA]"
                : "bg-[#1744A7] text-white",
            ].join(" ")}
            aria-label="Отправить сообщение"
          >
            <Send size={20} strokeWidth={1.9} />
          </button>
        </div>
      </footer>
    </div>
  );
}