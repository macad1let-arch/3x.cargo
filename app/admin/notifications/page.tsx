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
  in_transit:      "В пути",
  bishkek_arrived: "В Бишкеке",
  sorting:         "На сортировке",
  ready_pickup:    "Готов к выдаче",
  completed:       "Выдано",
  problem:         "Проблема",
};

const STATUS_MESSAGES: Record<string, string> = {
  china_warehouse: "Ваш груз поступил на склад в Китае и ожидает отправки.",
  in_transit:      "Ваш груз отправлен и в пути в Кыргызстан. Ожидаемое время доставки 7–14 дней.",
  bishkek_arrived: "Ваш груз прибыл в Бишкек и проходит таможенное оформление.",
  sorting:         "Ваш груз на сортировочном складе. Скоро будет готов к выдаче.",
  ready_pickup:    "Ваш груз готов к выдаче. Приходите за ним в удобное для вас время.",
  completed:       "Ваш груз успешно выдан. Спасибо, что выбрали 3X Cargo.",
  problem:         "По вашему грузу возникла проблема. Свяжитесь с нами для уточнения деталей.",
};

const CHANNELS = [
  { key: "telegram", label: "Telegram", color: "#0088cc" },
  { key: "email",    label: "Email",    color: "#7c3aed" },
  { key: "whatsapp", label: "WhatsApp", color: "#16a34a" },
];

const TABS = [
  { key: "bulk",   label: "Массовая рассылка"       },
  { key: "batch",  label: "По статусу партии"        },
  { key: "single", label: "Отдельным клиентам"       },
];

// ── Shared ────────────────────────────────────────────────────────────────────

function ChannelSelector({ channels, onChange }: { channels: string[]; onChange: (c: string[]) => void }) {
  const toggle = (key: string) =>
    onChange(channels.includes(key) ? channels.filter(c => c !== key) : [...channels, key]);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {CHANNELS.map(ch => {
        const active = channels.includes(ch.key);
        return (
          <button key={ch.key} onClick={() => toggle(ch.key)} style={{
            height: 36, padding: "0 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: "pointer", transition: "all .15s",
            border: active ? `1.5px solid ${ch.color}` : "1.5px solid #e2e8f0",
            background: active ? ch.color : "#fff",
            color: active ? "#fff" : "#64748b",
          }}>{ch.label}</button>
        );
      })}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 8, textTransform: "uppercase" as const }}>{children}</div>;
}

function Input({ value, onChange, placeholder, style }: { value: string; onChange: (v: string) => void; placeholder?: string; style?: React.CSSProperties }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", boxSizing: "border-box", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", background: "#fff", ...style }} />
  );
}

function Textarea({ value, onChange, placeholder, rows }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 4}
      style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", background: "#fff", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none", background: "#fff", cursor: "pointer" }}>
      {children}
    </select>
  );
}

function SendButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: 40, padding: "0 24px", borderRadius: 8, border: "none",
      background: disabled ? "#e2e8f0" : "#1e293b",
      color: disabled ? "#94a3b8" : "#fff",
      fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    }}>{label}</button>
  );
}

function ResultBanner({ result }: { result: { ok: boolean; text: string } | null }) {
  if (!result) return null;
  return (
    <div style={{
      marginTop: 16, padding: "12px 16px", borderRadius: 8, fontSize: 13,
      background: result.ok ? "#f0fdf4" : "#fff7ed",
      border: `1px solid ${result.ok ? "#bbf7d0" : "#fed7aa"}`,
      color: result.ok ? "#166534" : "#92400e",
    }}>{result.text}</div>
  );
}

function Progress({ sent, total }: { sent: number; total: number }) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
        <span style={{ color: "#475569" }}>Отправка...</span>
        <span style={{ fontWeight: 600, color: "#0f172a" }}>{sent} / {total}</span>
      </div>
      <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb", transition: "width .2s" }} />
      </div>
    </div>
  );
}

// ── Section 1: Bulk ───────────────────────────────────────────────────────────
function BulkSection({ clients }: { clients: Client[] }) {
  const [channels, setChannels] = useState(["telegram"]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all"|"tg"|"email"|"phone">("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0, running: false });

  const filtered = clients.filter(c => {
    if (filter === "tg")    return !!c.telegram_chat_id;
    if (filter === "email") return !!c.email;
    if (filter === "phone") return !!c.phone;
    return true;
  });

  const send = async () => {
    if (!message.trim() || channels.length === 0) return;
    setLoading(true); setResult(null);
    setProgress({ sent: 0, total: filtered.length, running: true });
    let ok = 0, fail = 0;
    for (const client of filtered) {
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_code: client.client_code, title, message, channels }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
      setProgress(p => ({ ...p, sent: p.sent + 1 }));
    }
    setProgress(p => ({ ...p, running: false }));
    setResult({ ok: true, text: `Отправлено: ${ok} успешно · ${fail > 0 ? `${fail} ошибок` : "ошибок нет"}` });
    setLoading(false);
  };

  const FILTERS = [
    { key: "all",   label: "Все клиенты",   count: clients.length },
    { key: "tg",    label: "Telegram",       count: clients.filter(c => c.telegram_chat_id).length },
    { key: "email", label: "Email",          count: clients.filter(c => c.email).length },
    { key: "phone", label: "WhatsApp",       count: clients.filter(c => c.phone).length },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Получатели</Label>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)} style={{
              height: 34, padding: "0 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              cursor: "pointer", border: filter === f.key ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
              background: filter === f.key ? "#eff6ff" : "#fff",
              color: filter === f.key ? "#2563eb" : "#64748b",
            }}>{f.label} · {f.count}</button>
          ))}
        </div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#475569" }}>
          Будет отправлено <strong style={{ color: "#0f172a" }}>{filtered.length}</strong> клиентам
        </div>
      </div>
      <div><Label>Каналы</Label><ChannelSelector channels={channels} onChange={setChannels} /></div>
      <div><Label>Заголовок</Label><Input value={title} onChange={setTitle} placeholder="Уведомление от 3X Cargo" /></div>
      <div><Label>Сообщение</Label><Textarea value={message} onChange={setMessage} placeholder="Текст рассылки..." /></div>
      {progress.running && <Progress sent={progress.sent} total={progress.total} />}
      <SendButton onClick={send} disabled={loading || !message.trim() || channels.length === 0 || filtered.length === 0} label={loading ? "Отправка..." : `Отправить ${filtered.length} клиентам`} />
      <ResultBanner result={result} />
    </div>
  );
}

// ── Section 2: Batch ──────────────────────────────────────────────────────────
function BatchSection({ batches }: { batches: Batch[] }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [newStatus, setNewStatus]   = useState("in_transit");
  const [channels, setChannels]     = useState(["telegram", "whatsapp", "email"]);
  const [title, setTitle]           = useState("Статус груза обновлён: В пути");
  const [message, setMessage]       = useState(STATUS_MESSAGES["in_transit"]);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress]     = useState({ sent: 0, total: 0, running: false });

  const onStatusChange = (s: string) => {
    setNewStatus(s);
    setTitle(`Статус груза обновлён: ${STATUS_LABELS[s] || s}`);
    setMessage(STATUS_MESSAGES[s] || "");
  };

  const send = async () => {
    if (!selectedBatch || !message.trim() || channels.length === 0) return;
    setLoading(true); setResult(null);

    const { data: shipments } = await supabase
      .from("shipments").select("client_code")
      .eq("batch_code", selectedBatch).neq("client_code", "unknown");

    const uniqueClients = [...new Map((shipments || []).map(s => [s.client_code, s])).values()];
    setProgress({ sent: 0, total: uniqueClients.length, running: true });

    const res = await fetch("/api/notifications/batch-status", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_code: selectedBatch, status: newStatus, channels }),
    });
    const data = await res.json();
    setProgress({ sent: uniqueClients.length, total: uniqueClients.length, running: false });
    setResult({ ok: data.ok, text: data.ok ? `Партия ${selectedBatch} · Отправлено: ${data.sent} · Ошибок: ${data.failed}` : data.error || "Ошибка" });
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#78350f" }}>
        Выберите партию и новый статус — сообщение сформируется автоматически. Список посылок клиента будет добавлен автоматически.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Label>Партия</Label>
          <Select value={selectedBatch} onChange={setSelectedBatch}>
            <option value="">— Выберите партию —</option>
            {batches.map(b => (
              <option key={b.batch_code} value={b.batch_code}>
                {b.batch_code}{b.status ? ` · ${STATUS_LABELS[b.status] || b.status}` : ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Новый статус</Label>
          <Select value={newStatus} onChange={onStatusChange}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
      </div>
      <div><Label>Каналы</Label><ChannelSelector channels={channels} onChange={setChannels} /></div>
      <div><Label>Заголовок</Label><Input value={title} onChange={setTitle} /></div>
      <div><Label>Сообщение</Label><Textarea value={message} onChange={setMessage} /></div>
      {progress.running && <Progress sent={progress.sent} total={progress.total} />}
      <SendButton onClick={send} disabled={loading || !selectedBatch || !message.trim() || channels.length === 0} label={loading ? "Отправка..." : `Уведомить клиентов партии ${selectedBatch || "..."}`} />
      <ResultBanner result={result} />
    </div>
  );
}

// ── Section 3: Single ─────────────────────────────────────────────────────────
function SingleSection({ clients }: { clients: Client[] }) {
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<Client[]>([]);
  const [showDrop, setShowDrop]       = useState(false);
  const [channels, setChannels]       = useState(["telegram", "email"]);
  const [title, setTitle]             = useState("");
  const [message, setMessage]         = useState("");
  const [trackingCode, setTracking]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<{ ok: boolean; text: string } | null>(null);

  const filteredClients = search.trim()
    ? clients.filter(c =>
        c.client_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      ).slice(0, 8)
    : [];

  const addClient = (c: Client) => {
    if (!selected.find(s => s.client_code === c.client_code)) setSelected(p => [...p, c]);
    setSearch(""); setShowDrop(false);
  };

  const send = async () => {
    if (!selected.length || !message.trim() || !channels.length) return;
    setLoading(true); setResult(null);
    let ok = 0, fail = 0;
    for (const client of selected) {
      try {
        const res = await fetch("/api/notifications/send", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_code: client.client_code, title, message, tracking_code: trackingCode || null, channels }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch { fail++; }
    }
    setResult({ ok: fail === 0, text: `${ok} отправлено${fail > 0 ? ` · ${fail} ошибок` : ""}` });
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Label>Получатели</Label>
        <div style={{ position: "relative" }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            placeholder="Поиск по имени, коду клиента, телефону..."
            style={{ width: "100%", boxSizing: "border-box", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", outline: "none" }}
          />
          {showDrop && filteredClients.length > 0 && (
            <div style={{ position: "absolute", zIndex: 20, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {filteredClients.map(c => (
                <div key={c.client_code} onClick={() => addClient(c)}
                  style={{ padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}
                  onMouseOver={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseOut={e => (e.currentTarget.style.background = "#fff")}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.full_name || c.first_name || "—"}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{c.client_code}{c.phone ? ` · ${c.phone}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {c.telegram_chat_id && <span style={tag("#0088cc","#e0f2fe")}>TG</span>}
                    {c.email && <span style={tag("#7c3aed","#f5f3ff")}>Email</span>}
                    {c.phone && <span style={tag("#16a34a","#dcfce7")}>WA</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {selected.map(c => (
              <div key={c.client_code} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f5f9", borderRadius: 6, padding: "5px 10px 5px 12px", fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.full_name || c.first_name || c.client_code}</span>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{c.client_code}</span>
                <button onClick={() => setSelected(p => p.filter(x => x.client_code !== c.client_code))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div><Label>Каналы</Label><ChannelSelector channels={channels} onChange={setChannels} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><Label>Заголовок</Label><Input value={title} onChange={setTitle} placeholder="Уведомление от 3X Cargo" /></div>
        <div><Label>Трек-код (необязательно)</Label><Input value={trackingCode} onChange={setTracking} placeholder="YT8812272164356" /></div>
      </div>
      <div><Label>Сообщение</Label><Textarea value={message} onChange={setMessage} placeholder="Текст сообщения..." /></div>
      <SendButton onClick={send} disabled={loading || !selected.length || !message.trim() || !channels.length} label={loading ? "Отправка..." : selected.length > 1 ? `Отправить ${selected.length} клиентам` : "Отправить"} />
      <ResultBanner result={result} />
    </div>
  );
}

function tag(color: string, bg: string): React.CSSProperties {
  return { fontSize: 11, background: bg, color, padding: "2px 7px", borderRadius: 5, fontWeight: 600 };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const [tab, setTab]         = useState("bulk");
  const [clients, setClients] = useState<Client[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    supabase.from("clients").select("client_code, full_name, first_name, email, phone, telegram_chat_id")
      .order("created_at", { ascending: false }).limit(500)
      .then(({ data }) => { if (data) setClients(data); });
    supabase.from("batches").select("batch_code, status")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setBatches(data); });
  }, []);

  const stats = [
    { label: "Всего клиентов", value: clients.length },
    { label: "Telegram",       value: clients.filter(c => c.telegram_chat_id).length },
    { label: "Email",          value: clients.filter(c => c.email).length },
    { label: "WhatsApp",       value: clients.filter(c => c.phone).length },
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900, fontFamily: "inherit", color: "#0f172a" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Уведомления</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Рассылки клиентам через Telegram, WhatsApp и Email</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: 28, gap: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? "#0f172a" : "#64748b",
            borderBottom: tab === t.key ? "2px solid #1e293b" : "2px solid transparent",
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 28 }}>
        {tab === "bulk"   && <BulkSection   clients={clients} />}
        {tab === "batch"  && <BatchSection  batches={batches} />}
        {tab === "single" && <SingleSection clients={clients} />}
      </div>

    </div>
  );
}