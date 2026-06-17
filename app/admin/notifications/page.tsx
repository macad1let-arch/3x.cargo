"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Client = {
  client_code: string;
  full_name: string;
  first_name: string;
  email: string | null;
  phone: string | null;
  telegram_chat_id: number | null;
};

type Batch = {
  batch_code: string;
  status: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  china_warehouse: "На складе в Китае",
  in_transit: "В пути",
  bishkek_arrived: "В Бишкеке",
  sorting: "На сортировке",
  ready_pickup: "Готов к выдаче",
  completed: "Выдано",
  problem: "Проблема",
};

const STATUS_MESSAGES: Record<string, string> = {
  china_warehouse: "Ваш груз поступил на склад в Китае и ожидает отправки.",
  in_transit: "Ваш груз отправлен и в пути в Кыргызстан. Ожидаемое время доставки 7–14 дней.",
  bishkek_arrived: "Ваш груз прибыл в Бишкек и проходит таможенное оформление.",
  sorting: "Ваш груз на сортировочном складе. Скоро будет готов к выдаче.",
  ready_pickup: "Ваш груз готов к выдаче! Приходите за ним в удобное для вас время.",
  completed: "Ваш груз успешно выдан. Спасибо, что выбрали 3X Cargo!",
  problem: "По вашему грузу возникла проблема. Свяжитесь с нами для уточнения деталей.",
};

const CHANNELS = [
  { key: "telegram", label: "Telegram", color: "#0088cc", bg: "#e0f2fe", icon: "✈️" },
  { key: "email",    label: "Email",    color: "#8b5cf6", bg: "#f5f3ff", icon: "📧" },
  { key: "whatsapp", label: "WhatsApp", color: "#25d366", bg: "#dcfce7", icon: "💬" },
];

const TABS = [
  { key: "bulk",        label: "Массовая рассылка",         icon: "📢" },
  { key: "batch",       label: "По смене статуса партии",   icon: "📦" },
  { key: "single",      label: "Отдельным клиентам",        icon: "👤" },
];

// ─── Shared Channel Selector ──────────────────────────────────────────────────
function ChannelSelector({ channels, onChange }: { channels: string[]; onChange: (c: string[]) => void }) {
  const toggle = (key: string) =>
    onChange(channels.includes(key) ? channels.filter(c => c !== key) : [...channels, key]);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {CHANNELS.map(ch => {
        const active = channels.includes(ch.key);
        return (
          <button key={ch.key} onClick={() => toggle(ch.key)} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: active ? `1.5px solid ${ch.color}` : "1.5px solid #e2e8f0",
            background: active ? ch.bg : "#fff",
            color: active ? ch.color : "#94a3b8",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span>{ch.icon}</span>{ch.label}
            {active && <span style={{ fontSize: 11, background: ch.color, color: "#fff", borderRadius: 4, padding: "1px 5px" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Result Banner ────────────────────────────────────────────────────────────
function ResultBanner({ result }: { result: { ok: boolean; text: string } | null }) {
  if (!result) return null;
  return (
    <div style={{
      marginTop: 14, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
      background: result.ok ? "#ecfdf5" : "#fff7ed",
      border: `1px solid ${result.ok ? "#6ee7b7" : "#fed7aa"}`,
      color: result.ok ? "#065f46" : "#92400e",
    }}>{result.text}</div>
  );
}

// ─── Section 1: Bulk ─────────────────────────────────────────────────────────
function BulkSection({ clients }: { clients: Client[] }) {
  const [channels, setChannels] = useState(["telegram"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "tg" | "email" | "phone">("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0, running: false });

  const filtered = clients.filter(c => {
    if (filter === "tg") return !!c.telegram_chat_id;
    if (filter === "email") return !!c.email;
    if (filter === "phone") return !!c.phone;
    return true;
  });

  const send = async () => {
    if (!message.trim() || channels.length === 0 || filtered.length === 0) return;
    setLoading(true);
    setResult(null);
    setProgress({ sent: 0, total: filtered.length, running: true });

    let ok = 0, fail = 0;
    for (const client of filtered) {
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_code: client.client_code, title, message, channels }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
      setProgress(p => ({ ...p, sent: p.sent + 1 }));
    }
    setProgress(p => ({ ...p, running: false }));
    setResult({ ok: true, text: `Отправлено: ✅ ${ok} успешно · ❌ ${fail} ошибок` });
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filter */}
      <div>
        <div style={labelStyle}>ПОЛУЧАТЕЛИ</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {[["all","Все клиенты"],["tg","Есть Telegram"],["email","Есть Email"],["phone","Есть WhatsApp"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k as any)} style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: filter === k ? "1.5px solid #005eaa" : "1.5px solid #e2e8f0",
              background: filter === k ? "#eff6ff" : "#fff",
              color: filter === k ? "#005eaa" : "#64748b",
            }}>{l}</button>
          ))}
        </div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#475569" }}>
          Получателей: <strong style={{ color: "#0a1e3d" }}>{filtered.length}</strong> клиентов
          {filter === "tg" && ` · только с Telegram`}
          {filter === "email" && ` · только с Email`}
          {filter === "phone" && ` · только с WhatsApp`}
        </div>
      </div>

      <div>
        <div style={labelStyle}>КАНАЛЫ ОТПРАВКИ</div>
        <ChannelSelector channels={channels} onChange={setChannels} />
      </div>

      <div>
        <div style={labelStyle}>ЗАГОЛОВОК</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Уведомление от 3X Cargo"
          style={inputStyle} />
      </div>

      <div>
        <div style={labelStyle}>СООБЩЕНИЕ</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Текст рассылки..."
          rows={4} style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }} />
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{message.length} символов</div>
      </div>

      {progress.running && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#005eaa", fontWeight: 600 }}>
            <span>Отправка...</span>
            <span>{progress.sent} / {progress.total}</span>
          </div>
          <div style={{ height: 6, background: "#dbeafe", borderRadius: 4 }}>
            <div style={{ width: `${(progress.sent / progress.total) * 100}%`, height: "100%", background: "#005eaa", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      <button onClick={send} disabled={loading || !message.trim() || channels.length === 0 || filtered.length === 0} style={btnStyle(loading || !message.trim() || channels.length === 0 || filtered.length === 0)}>
        {loading ? "Отправка..." : `📢 Отправить ${filtered.length} клиентам`}
      </button>
      <ResultBanner result={result} />
    </div>
  );
}

// ─── Section 2: Batch Status ──────────────────────────────────────────────────
function BatchSection({ batches }: { batches: Batch[] }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [newStatus, setNewStatus] = useState("in_transit");
  const [channels, setChannels] = useState(["telegram", "whatsapp"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState(STATUS_MESSAGES["in_transit"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0, running: false });

  const onStatusChange = (status: string) => {
    setNewStatus(status);
    setMessage(STATUS_MESSAGES[status] || "");
    setTitle(`Статус груза обновлён: ${STATUS_LABELS[status] || status}`);
  };

  const send = async () => {
    if (!selectedBatch || !message.trim() || channels.length === 0) return;
    setLoading(true);
    setResult(null);

    // Get all shipments in batch
    const { data: shipments } = await supabase
      .from("shipments")
      .select("client_code, tracking_code")
      .eq("batch_code", selectedBatch)
      .neq("client_code", "unknown");

    if (!shipments || shipments.length === 0) {
      setResult({ ok: false, text: "В партии нет посылок с клиентами" });
      setLoading(false);
      return;
    }

    // Unique client_codes
    const uniqueClients = [...new Map(shipments.map(s => [s.client_code, s])).values()];
    setProgress({ sent: 0, total: uniqueClients.length, running: true });

    let ok = 0, fail = 0;
    for (const s of uniqueClients) {
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_code: s.client_code,
            title: title || `Статус груза: ${STATUS_LABELS[newStatus]}`,
            message,
            channels,
          }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
      setProgress(p => ({ ...p, sent: p.sent + 1 }));
    }

    setProgress(p => ({ ...p, running: false }));
    setResult({ ok: true, text: `Партия ${selectedBatch} · Отправлено: ✅ ${ok} · ❌ ${fail}` });
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
        💡 Выберите партию и новый статус — сообщение сформируется автоматически. Вы можете отредактировать его перед отправкой.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={labelStyle}>ПАРТИЯ</div>
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={inputStyle}>
            <option value="">— Выберите партию —</option>
            {batches.map(b => (
              <option key={b.batch_code} value={b.batch_code}>
                {b.batch_code} {b.status ? `· ${STATUS_LABELS[b.status] || b.status}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>НОВЫЙ СТАТУС</div>
          <select value={newStatus} onChange={e => onStatusChange(e.target.value)} style={inputStyle}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div style={labelStyle}>КАНАЛЫ ОТПРАВКИ</div>
        <ChannelSelector channels={channels} onChange={setChannels} />
      </div>

      <div>
        <div style={labelStyle}>ЗАГОЛОВОК</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={`Статус груза: ${STATUS_LABELS[newStatus]}`}
          style={inputStyle} />
      </div>

      <div>
        <div style={labelStyle}>СООБЩЕНИЕ</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          rows={4} style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }} />
      </div>

      {progress.running && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, color: "#005eaa", fontWeight: 600 }}>
            <span>Отправка клиентам партии...</span>
            <span>{progress.sent} / {progress.total}</span>
          </div>
          <div style={{ height: 6, background: "#dbeafe", borderRadius: 4 }}>
            <div style={{ width: `${progress.total ? (progress.sent / progress.total) * 100 : 0}%`, height: "100%", background: "#005eaa", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      <button onClick={send} disabled={loading || !selectedBatch || !message.trim() || channels.length === 0} style={btnStyle(loading || !selectedBatch || !message.trim() || channels.length === 0)}>
        {loading ? "Отправка..." : `📦 Уведомить клиентов партии ${selectedBatch || "..."}`}
      </button>
      <ResultBanner result={result} />
    </div>
  );
}

// ─── Section 3: Single/Multi ──────────────────────────────────────────────────
function SingleSection({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client[]>([]);
  const [channels, setChannels] = useState(["telegram", "email"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const filteredClients = search.trim()
    ? clients.filter(c =>
        c.client_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      ).slice(0, 8)
    : [];

  const addClient = (c: Client) => {
    if (!selected.find(s => s.client_code === c.client_code)) {
      setSelected(prev => [...prev, c]);
    }
    setSearch("");
  };

  const removeClient = (code: string) => setSelected(prev => prev.filter(c => c.client_code !== code));

  const send = async () => {
    if (selected.length === 0 || !message.trim() || channels.length === 0) return;
    setLoading(true);
    setResult(null);
    let ok = 0, fail = 0;

    for (const client of selected) {
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_code: client.client_code, title, message, tracking_code: trackingCode || null, channels }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
    }

    const parts: string[] = [];
    if (ok > 0) parts.push(`✅ ${ok} отправлено`);
    if (fail > 0) parts.push(`❌ ${fail} ошибок`);
    setResult({ ok: fail === 0, text: parts.join(" · ") });
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search */}
      <div>
        <div style={labelStyle}>ДОБАВИТЬ КЛИЕНТОВ</div>
        <div style={{ position: "relative" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени, коду, телефону..."
            style={inputStyle} />
          {filteredClients.length > 0 && (
            <div style={{ position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginTop: 4, overflow: "hidden" }}>
              {filteredClients.map(c => (
                <div key={c.client_code} onClick={() => addClient(c)}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid #f0f4f8" }}
                  onMouseOver={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{c.full_name || c.first_name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.client_code} {c.phone ? `· ${c.phone}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {c.telegram_chat_id && <span style={tagStyle("#0088cc","#e0f2fe")}>TG</span>}
                    {c.email && <span style={tagStyle("#8b5cf6","#f5f3ff")}>Email</span>}
                    {c.phone && <span style={tagStyle("#25d366","#dcfce7")}>WA</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div>
          <div style={labelStyle}>ВЫБРАННЫЕ ПОЛУЧАТЕЛИ · {selected.length}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {selected.map(c => (
              <div key={c.client_code} style={{ display: "flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0a1e3d" }}>{c.full_name || c.first_name || c.client_code}</div>
                  <div style={{ fontSize: 10, color: "#005eaa" }}>{c.client_code}</div>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {c.telegram_chat_id && <span style={tagStyle("#0088cc","#e0f2fe")}>TG</span>}
                  {c.email && <span style={tagStyle("#8b5cf6","#f5f3ff")}>✉</span>}
                  {c.phone && <span style={tagStyle("#25d366","#dcfce7")}>WA</span>}
                </div>
                <button onClick={() => removeClient(c.client_code)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={labelStyle}>КАНАЛЫ ОТПРАВКИ</div>
        <ChannelSelector channels={channels} onChange={setChannels} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={labelStyle}>ЗАГОЛОВОК</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Уведомление от 3X Cargo"
            style={inputStyle} />
        </div>
        <div>
          <div style={labelStyle}>ТРЕК-КОД (необязательно)</div>
          <input value={trackingCode} onChange={e => setTrackingCode(e.target.value)}
            placeholder="3X-0042-KG"
            style={inputStyle} />
        </div>
      </div>

      <div>
        <div style={labelStyle}>СООБЩЕНИЕ</div>
        <textarea value={message} onChange={e => setMessage(e.target.value)}
          placeholder="Текст сообщения..."
          rows={4} style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }} />
      </div>

      <button onClick={send} disabled={loading || selected.length === 0 || !message.trim() || channels.length === 0}
        style={btnStyle(loading || selected.length === 0 || !message.trim() || channels.length === 0)}>
        {loading ? "Отправка..." : `👤 Отправить ${selected.length > 1 ? `${selected.length} клиентам` : "клиенту"}`}
      </button>
      <ResultBanner result={result} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0a1e3d", background: "#fff" };
const btnStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#e2e8f0" : "#0a1e3d",
  border: "none", borderRadius: 10, padding: "12px 24px",
  color: disabled ? "#94a3b8" : "#fff", fontSize: 14, fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer", alignSelf: "flex-start",
});
const tagStyle = (color: string, bg: string): React.CSSProperties => ({
  fontSize: 10, background: bg, color, padding: "2px 6px", borderRadius: 5, fontWeight: 700,
});

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const [tab, setTab] = useState("bulk");
  const [clients, setClients] = useState<Client[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    supabase.from("clients")
      .select("client_code, full_name, first_name, email, phone, telegram_chat_id")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => { if (data) setClients(data); });

    supabase.from("batches")
      .select("batch_code, status")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBatches(data); });
  }, []);

  const stats = {
    total: clients.length,
    tg: clients.filter(c => c.telegram_chat_id).length,
    email: clients.filter(c => c.email).length,
    wa: clients.filter(c => c.phone).length,
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 860, fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0a1e3d", margin: 0 }}>Уведомления</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Рассылки клиентам через Telegram, WhatsApp и Email</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Всего клиентов", value: stats.total, color: "#0a1e3d", bg: "#f8fafc" },
          { label: "Telegram",       value: stats.tg,    color: "#0088cc", bg: "#e0f2fe" },
          { label: "Email",          value: stats.email, color: "#8b5cf6", bg: "#f5f3ff" },
          { label: "WhatsApp",       value: stats.wa,    color: "#25d366", bg: "#dcfce7" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f0f2f5", borderRadius: 12, padding: 4, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            background: tab === t.key ? "#fff" : "transparent",
            color: tab === t.key ? "#0a1e3d" : "#64748b",
            boxShadow: tab === t.key ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 16, padding: "24px" }}>
        {tab === "bulk"  && <BulkSection  clients={clients} />}
        {tab === "batch" && <BatchSection batches={batches} />}
        {tab === "single"&& <SingleSection clients={clients} />}
      </div>
    </div>
  );
}