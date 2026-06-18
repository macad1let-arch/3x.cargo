"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient } from "@/lib/supabase-dashboard";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function AssistantPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Привет! 👋 Я AI помощник 3X Cargo. Могу ответить на любые вопросы о доставке, тарифах и ваших заказах. Чем могу помочь?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientCode, setClientCode] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const client = await getClient(user.id);
      if (client) setClientCode(client.client_code);
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, client_code: clientCode }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || "Извините, не смог обработать запрос." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Произошла ошибка. Попробуйте позже." }]);
    }

    setLoading(false);
  };

  const QUICK = [
    "Сколько стоит доставка?",
    "Где мои заказы?",
    "Адрес склада в Китае?",
    "Адрес выдачи в Бишкеке?",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f0f2f5", touchAction: "manipulation", paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", padding: "12px 20px", borderBottom: "0.5px solid #e8edf2", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="headphones" size={20} color="#005eaa" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d" }}>AI Помощник</div>
          <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
            Онлайн
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>

        {/* Quick questions */}
        {messages.length === 1 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8, textAlign: "center" }}>Частые вопросы</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {QUICK.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); }}
                  style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, background: "#fff", border: "0.5px solid #e2e8f0", color: "#005eaa", cursor: "pointer", fontWeight: 500 }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, alignSelf: "flex-end" }}>
                <Icon name="headphones" size={15} color="#005eaa" />
              </div>
            )}
            <div style={{
              maxWidth: "75%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "#005eaa" : "#fff",
              color: m.role === "user" ? "#fff" : "#0a1e3d",
              fontSize: 15, lineHeight: 1.6,
              border: m.role === "assistant" ? "0.5px solid #e8edf2" : "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8 }}>
              <Icon name="headphones" size={15} color="#005eaa" />
            </div>
            <div style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8", animation: `bounce 1s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ background: "#fff", borderTop: "0.5px solid #e8edf2", padding: "12px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Напишите вопрос..."
            rows={1}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 12,
              border: "0.5px solid #e2e8f0", fontSize: 16, outline: "none",
              resize: "none", fontFamily: "inherit", lineHeight: 1.5,
              maxHeight: 100, overflowY: "auto",
            }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: !input.trim() || loading ? "#e2e8f0" : "#005eaa",
              border: "none", cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <Icon name="chevron_right" size={20} color="#fff" />
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#c4c9d4", textAlign: "center", marginTop: 6 }}>
          AI может ошибаться · Для срочных вопросов: +996 220 343 053
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}