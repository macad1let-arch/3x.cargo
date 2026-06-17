"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Привет! 👋 Я AI помощник 3X Cargo. Задайте любой вопрос о доставке из Китая!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

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
        body: JSON.stringify({ message: userMsg, client_code: null }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || "Извините, произошла ошибка." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Произошла ошибка. Попробуйте позже." }]);
    }
    setLoading(false);
  };

  const QUICK = ["Сколько стоит доставка?", "Сроки доставки?", "Адрес в Бишкеке?"];

  return (
    <>
      {/* Кнопка */}
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 24, right: 20, zIndex: 999,
        width: 56, height: 56, borderRadius: "50%", background: "#005eaa",
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,94,170,.4)",
      }}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>

      {/* Окно чата */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 20, zIndex: 998,
          width: 320, height: 460, background: "#fff",
          borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,.15)",
          border: "1.5px solid #dce4ef", display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Хедер */}
          <div style={{ background: "#005eaa", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>3X Cargo AI</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                Онлайн · отвечаем быстро
              </div>
            </div>
          </div>

          {/* Сообщения */}
          <div style={{ flex: 1, padding: "12px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Быстрые вопросы */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>
                {QUICK.map((q, i) => (
                  <button key={i} onClick={() => setInput(q)}
                    style={{ padding: "5px 11px", borderRadius: 14, fontSize: 11.5, background: "#eff6ff", border: "0.5px solid #bfdbfe", color: "#005eaa", cursor: "pointer", fontWeight: 500 }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "9px 13px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "#005eaa" : "#f0f4f8",
                  color: m.role === "user" ? "#fff" : "#0d1a2e",
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f0f4f8", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#94a3b8", animation: `bounce 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Инпут */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #e8edf2", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Написать сообщение..."
              style={{ flex: 1, height: 38, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 20, fontSize: 13, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#f5f7fa" }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              style={{ width: 38, height: 38, borderRadius: "50%", background: !input.trim() || loading ? "#e2e8f0" : "#005eaa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>

          <div style={{ fontSize: 10, color: "#c4c9d4", textAlign: "center", padding: "4px 0 8px" }}>
            AI · 3xcargo.kg · +996 220 343 053
          </div>
        </div>
      )}

      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </>
  );
}