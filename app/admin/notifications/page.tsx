"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Client = {
  client_code: string;
  full_name: string;
  first_name: string;
  telegram_chat_id: number | null;
};

export default function AdminNotificationsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("client_code, full_name, first_name, telegram_chat_id")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setClients(data);
    }
    loadClients();
  }, []);

  const filtered = clients.filter(c =>
    c.client_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  const send = async () => {
    if (!selectedClient || !message.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_code: selectedClient.client_code,
          title: title || "Уведомление от 3X Cargo",
          message,
          tracking_code: trackingCode || null,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        const tg = data.telegram_sent ? "✅ Telegram отправлен" : data.has_telegram ? "⚠️ Telegram ошибка" : "ℹ️ Telegram не привязан";
        setResult({ ok: true, text: `Отправлено! ${tg}` });
        setMessage("");
        setTitle("");
        setTrackingCode("");
      } else {
        setResult({ ok: false, text: data.error || "Ошибка" });
      }
    } catch {
      setResult({ ok: false, text: "Ошибка сервера" });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0a1e3d", marginBottom: 24 }}>
        Отправить уведомление
      </h1>

      {/* Поиск клиента */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>
          КЛИЕНТ
        </label>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedClient(null); }}
          placeholder="Поиск по имени или коду..."
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", marginBottom: 8 }}
        />
        {search && !selectedClient && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, maxHeight: 200, overflowY: "auto" }}>
            {filtered.slice(0, 10).map(c => (
              <div key={c.client_code} onClick={() => { setSelectedClient(c); setSearch(c.full_name || c.first_name || c.client_code); }}
                style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid #f0f4f8" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{c.full_name || c.first_name || "—"}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.client_code}</div>
                </div>
                {c.telegram_chat_id ? (
                  <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0088cc", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>TG ✓</span>
                ) : (
                  <span style={{ fontSize: 10, background: "#f0f4f8", color: "#94a3b8", padding: "2px 8px", borderRadius: 6 }}>TG нет</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "12px 14px", fontSize: 13, color: "#94a3b8" }}>Клиент не найден</div>
            )}
          </div>
        )}
        {selectedClient && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{selectedClient.full_name || selectedClient.first_name}</div>
              <div style={{ fontSize: 11, color: "#005eaa" }}>{selectedClient.client_code}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedClient.telegram_chat_id ? (
                <span style={{ fontSize: 11, background: "#e0f2fe", color: "#0088cc", padding: "3px 10px", borderRadius: 6, fontWeight: 600 }}>Telegram ✓</span>
              ) : (
                <span style={{ fontSize: 11, background: "#fff7ed", color: "#f97316", padding: "3px 10px", borderRadius: 6 }}>Telegram не привязан</span>
              )}
              <button onClick={() => { setSelectedClient(null); setSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>×</button>
            </div>
          </div>
        )}
      </div>

      {/* Заголовок */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>ЗАГОЛОВОК</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Уведомление от 3X Cargo"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }} />
      </div>

      {/* Трек-код */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>ТРЕК-КОД (необязательно)</label>
        <input value={trackingCode} onChange={e => setTrackingCode(e.target.value)}
          placeholder="Например: 3X-0042-KG"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }} />
      </div>

      {/* Сообщение */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>СООБЩЕНИЕ</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Текст уведомления..."
          rows={4}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
      </div>

      {/* Кнопка */}
      <button onClick={send} disabled={loading || !selectedClient || !message.trim()}
        style={{ background: loading || !selectedClient || !message.trim() ? "#c4c9d4" : "#005eaa", border: "none", borderRadius: 12, padding: "12px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading || !selectedClient || !message.trim() ? "not-allowed" : "pointer" }}>
        {loading ? "Отправка..." : "Отправить уведомление"}
      </button>

      {/* Результат */}
      {result && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: result.ok ? "#ecfdf5" : "#fff7ed", border: `1px solid ${result.ok ? "#6ee7b7" : "#fed7aa"}`, fontSize: 13, color: result.ok ? "#065f46" : "#92400e", fontWeight: 500 }}>
          {result.text}
        </div>
      )}
    </div>
  );
}