"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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

type Batch = { batch_code: string; status: string | null };

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
  ready_pickup: "Ваш груз готов к выдаче. Приходите за ним в удобное для вас время.",
  completed: "Ваш груз успешно выдан. Спасибо, что выбрали 3X Cargo.",
  problem: "По вашему грузу возникла проблема. Свяжитесь с нами для уточнения деталей.",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const css = {
  page:    { padding: "32px 36px", fontFamily: "inherit", color: "#0f172a" } as React.CSSProperties,
  card:    { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 } as React.CSSProperties,
  label:   { fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.6, textTransform: "uppercase" as const, display: "block", marginBottom: 8 },
  input:   { width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const },
  select:  { width: "100%", height: 40, padding: "0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, cursor: "pointer" },
  textarea:{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, color: "#0f172a", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, resize: "vertical" as const, lineHeight: 1.6, minHeight: 100 },
  grid2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } as React.CSSProperties,
  col:     { display: "flex", flexDirection: "column" as const, gap: 22 },
};

function btn(active: boolean, color: string, bg: string, border: string): React.CSSProperties {
  return { height: 38, padding: "0 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit", transition: "all .15s", border: active ? `1.5px solid ${border}` : "1.5px solid #e2e8f0", background: active ? bg : "#fff", color: active ? color : "#64748b" };
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 24px", borderRadius: 8, border: "none", background: disabled ? "#f1f5f9" : "#0f172a", color: disabled ? "#94a3b8" : "#fff", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background .15s" };
}

// ── Shared components ─────────────────────────────────────────────────────────
const CHANNELS = [
  { key: "telegram", label: "Telegram", color: "#0369a1", bg: "#e0f2fe", border: "#bae6fd" },
  { key: "email",    label: "Email",    color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  { key: "whatsapp", label: "WhatsApp", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
];

function ChannelPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {CHANNELS.map(ch => {
        const on = value.includes(ch.key);
        return (
          <button key={ch.key} onClick={() => onChange(on ? value.filter(c => c !== ch.key) : [...value, ch.key])} style={btn(on, ch.color, ch.bg, ch.border)}>
            {ch.label}
          </button>
        );
      })}
    </div>
  );
}

function Toast({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={{ padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}`, color: ok ? "#166534" : "#991b1b", display: "flex", alignItems: "center", gap: 8 }}>
      <span>{ok ? "✓" : "✕"}</span>{text}
    </div>
  );
}

function ProgressBar({ sent, total }: { sent: number; total: number }) {
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
        <span style={{ color: "#64748b" }}>Отправка...</span>
        <span style={{ fontWeight: 600, color: "#0f172a" }}>{sent} / {total} · {pct}%</span>
      </div>
      <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#0f172a", borderRadius: 4, transition: "width .3s" }} />
      </div>
    </div>
  );
}

function ClientBadges({ c }: { c: Client }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {c.telegram_chat_id && <span style={{ fontSize: 10, background: "#e0f2fe", color: "#0369a1", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>TG</span>}
      {c.email            && <span style={{ fontSize: 10, background: "#f5f3ff", color: "#6d28d9", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Email</span>}
      {c.phone            && <span style={{ fontSize: 10, background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>WA</span>}
    </div>
  );
}

// ── ClientSearch ──────────────────────────────────────────────────────────────
function ClientSearch({ onSelect }: { onSelect: (c: Client) => void }) {
  const [query, setQuery]   = useState("");
  const [hits, setHits]     = useState<Client[]>([]);
  const [open, setOpen]     = useState(false);
  const wrapRef             = useRef<HTMLDivElement>(null);
  const timerRef            = useRef<number>(0);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setHits([]); setOpen(false); return; }
    const { data } = await supabase
      .from("clients")
      .select("client_code,full_name,first_name,email,phone,telegram_chat_id")
      .or(`client_code.ilike.%${q}%,full_name.ilike.%${q}%,first_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(8);
    if (data?.length) { setHits(data); setOpen(true); }
    else { setHits([]); setOpen(false); }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => search(val), 250);
  };

  const pick = (c: Client) => { onSelect(c); setQuery(""); setHits([]); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", pointerEvents: "none" }}>⌕</span>
        <input style={{ ...css.input, paddingLeft: 34 }} value={query} onChange={e => handleChange(e.target.value)} onFocus={() => hits.length && setOpen(true)} placeholder="Поиск по имени, коду клиента, телефону..." />
      </div>
      {open && hits.length > 0 && (
        <div style={{ position: "absolute", zIndex: 30, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {hits.map((c, i) => (
            <div key={c.client_code} onClick={() => pick(c)}
              style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < hits.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background .1s" }}
              onMouseOver={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.full_name || c.first_name || "—"}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{c.client_code}{c.phone ? ` · ${c.phone}` : ""}</div>
              </div>
              <ClientBadges c={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section 1: Bulk ───────────────────────────────────────────────────────────
function BulkSection({ stats }: { stats: { total: number; tg: number; email: number; wa: number } }) {
  const [channels, setChannels] = useState<string[]>(["telegram"]);
  const [title, setTitle]       = useState("");
  const [message, setMessage]   = useState("");
  const [filter, setFilter]     = useState<"all"|"tg"|"email"|"wa">("all");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; text: string } | null>(null);
  const [progress, setProgress] = useState({ sent: 0, total: 0, running: false });

  const FILTERS = [
    { key: "all",   label: "Все клиенты", count: stats.total },
    { key: "tg",    label: "Telegram",    count: stats.tg    },
    { key: "email", label: "Email",       count: stats.email },
    { key: "wa",    label: "WhatsApp",    count: stats.wa    },
  ] as const;

  const count = FILTERS.find(f => f.key === filter)?.count ?? 0;

  const send = async () => {
    if (!message.trim() || !channels.length || !count) return;
    setLoading(true); setResult(null);
    setProgress({ sent: 0, total: count, running: true });
    let offset = 0, ok = 0, fail = 0, sent = 0;

    while (true) {
      let q = supabase.from("clients").select("client_code").range(offset, offset + 99);
      if (filter === "tg")    q = q.not("telegram_chat_id", "is", null);
      if (filter === "email") q = q.not("email", "is", null);
      if (filter === "wa")    q = q.not("phone", "is", null);
      const { data } = await q;
      if (!data?.length) break;

      for (const c of data) {
        try {
          const r = await fetch("/api/notifications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_code: c.client_code, title, message, channels }) });
          if ((await r.json()).ok) ok++; else fail++;
        } catch { fail++; }
        sent++;
        setProgress({ sent, total: count, running: true });
      }
      if (data.length < 100) break;
      offset += 100;
    }

    setProgress(p => ({ ...p, running: false }));
    setResult({ ok: true, text: `Отправлено: ${ok}${fail ? ` · Ошибок: ${fail}` : ""}` });
    setLoading(false);
  };

  return (
    <div style={css.col}>
      <div>
        <span style={css.label}>Получатели</span>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ height: 34, padding: "0 14px", borderRadius: 20, border: filter === f.key ? "1.5px solid #0f172a" : "1px solid #e2e8f0", background: filter === f.key ? "#0f172a" : "#fff", color: filter === f.key ? "#fff" : "#64748b", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}>
              {f.label}
              <span style={{ background: filter === f.key ? "rgba(255,255,255,0.2)" : "#f1f5f9", borderRadius: 10, padding: "0 7px", fontSize: 12, fontWeight: 600 }}>{f.count}</span>
            </button>
          ))}
        </div>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Будет отправлено</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{count} клиентам</span>
        </div>
      </div>

      <div><span style={css.label}>Каналы отправки</span><ChannelPicker value={channels} onChange={setChannels} /></div>

      <div style={css.grid2}>
        <div><span style={css.label}>Заголовок</span><input style={css.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Уведомление от 3X Cargo" /></div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Отображается в email и push-уведомлении</p>
        </div>
      </div>

      <div><span style={css.label}>Сообщение</span><textarea style={css.textarea} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Текст рассылки..." /></div>

      {progress.running && <ProgressBar sent={progress.sent} total={progress.total} />}

      <div>
        <button onClick={send} disabled={loading || !message.trim() || !channels.length || !count} style={primaryBtn(loading || !message.trim() || !channels.length || !count)}>
          {loading ? "Отправка..." : `Отправить ${count} клиентам`}
        </button>
      </div>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Section 2: Batch ──────────────────────────────────────────────────────────
function BatchSection({ batches }: { batches: Batch[] }) {
  const [batch, setBatch]     = useState("");
  const [status, setStatus]   = useState("in_transit");
  const [channels, setChannels] = useState<string[]>(["telegram", "whatsapp", "email"]);
  const [title, setTitle]     = useState(`Статус груза обновлён: ${STATUS_LABELS["in_transit"]}`);
  const [message, setMessage] = useState(STATUS_MESSAGES["in_transit"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ ok: boolean; text: string } | null>(null);

  const onStatus = (s: string) => {
    setStatus(s);
    setTitle(`Статус груза обновлён: ${STATUS_LABELS[s] || s}`);
    setMessage(STATUS_MESSAGES[s] || "");
  };

  const send = async () => {
    if (!batch || !message.trim() || !channels.length) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch("/api/notifications/batch-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batch_code: batch, status, channels }) });
      const d = await r.json();
      setResult({ ok: d.ok, text: d.ok ? `Партия ${batch} · Отправлено: ${d.sent} · Ошибок: ${d.failed ?? 0}` : d.error || "Ошибка" });
    } catch { setResult({ ok: false, text: "Ошибка сервера" }); }
    setLoading(false);
  };

  return (
    <div style={css.col}>
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
        Выберите партию и новый статус — сообщение сформируется автоматически. Список посылок каждого клиента будет добавлен в письмо.
      </div>

      <div style={css.grid2}>
        <div>
          <span style={css.label}>Партия</span>
          <select style={css.select} value={batch} onChange={e => setBatch(e.target.value)}>
            <option value="">— Выберите партию —</option>
            {batches.map(b => <option key={b.batch_code} value={b.batch_code}>{b.batch_code}{b.status ? ` · ${STATUS_LABELS[b.status] || b.status}` : ""}</option>)}
          </select>
        </div>
        <div>
          <span style={css.label}>Новый статус</span>
          <select style={css.select} value={status} onChange={e => onStatus(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div><span style={css.label}>Каналы отправки</span><ChannelPicker value={channels} onChange={setChannels} /></div>
      <div><span style={css.label}>Заголовок</span><input style={css.input} value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><span style={css.label}>Сообщение</span><textarea style={css.textarea} rows={4} value={message} onChange={e => setMessage(e.target.value)} /></div>

      <div>
        <button onClick={send} disabled={loading || !batch || !message.trim() || !channels.length} style={primaryBtn(loading || !batch || !message.trim() || !channels.length)}>
          {loading ? "Отправка..." : `Уведомить клиентов партии ${batch || "..."}`}
        </button>
      </div>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Section 3: Single ─────────────────────────────────────────────────────────
function SingleSection() {
  const [selected, setSelected] = useState<Client[]>([]);
  const [channels, setChannels] = useState<string[]>(["telegram", "email"]);
  const [title, setTitle]       = useState("");
  const [message, setMessage]   = useState("");
  const [tracking, setTracking] = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; text: string } | null>(null);

  const add    = (c: Client) => { if (!selected.find(s => s.client_code === c.client_code)) setSelected(p => [...p, c]); };
  const remove = (code: string) => setSelected(p => p.filter(c => c.client_code !== code));

  const send = async () => {
    if (!selected.length || !message.trim() || !channels.length) return;
    setLoading(true); setResult(null);
    let ok = 0, fail = 0;
    for (const c of selected) {
      try {
        const r = await fetch("/api/notifications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ client_code: c.client_code, title, message, tracking_code: tracking || null, channels }) });
        if ((await r.json()).ok) ok++; else fail++;
      } catch { fail++; }
    }
    setResult({ ok: fail === 0, text: `${ok} отправлено${fail ? ` · ${fail} ошибок` : ""}` });
    setLoading(false);
  };

  return (
    <div style={css.col}>
      <div>
        <span style={css.label}>Получатели</span>
        <ClientSearch onSelect={add} />
        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {selected.map(c => (
              <div key={c.client_code} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 10px 6px 14px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1 }}>{c.full_name || c.first_name || c.client_code}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{c.client_code}</div>
                </div>
                <ClientBadges c={c} />
                <button onClick={() => remove(c.client_code)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18, lineHeight: 1, padding: "0 0 0 4px", display: "flex", alignItems: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div><span style={css.label}>Каналы отправки</span><ChannelPicker value={channels} onChange={setChannels} /></div>

      <div style={css.grid2}>
        <div><span style={css.label}>Заголовок</span><input style={css.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Уведомление от 3X Cargo" /></div>
        <div><span style={css.label}>Трек-код (необязательно)</span><input style={css.input} value={tracking} onChange={e => setTracking(e.target.value)} placeholder="YT8812272164356" /></div>
      </div>

      <div><span style={css.label}>Сообщение</span><textarea style={css.textarea} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Текст сообщения..." /></div>

      <div>
        <button onClick={send} disabled={loading || !selected.length || !message.trim() || !channels.length} style={primaryBtn(loading || !selected.length || !message.trim() || !channels.length)}>
          {loading ? "Отправка..." : selected.length > 1 ? `Отправить ${selected.length} клиентам` : "Отправить"}
        </button>
      </div>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: "bulk",   label: "Массовая рассылка"  },
  { key: "batch",  label: "По статусу партии"   },
  { key: "single", label: "Отдельным клиентам"  },
];

export default function AdminNotificationsPage() {
  const [tab, setTab]         = useState("bulk");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats]     = useState({ total: 0, tg: 0, email: 0, wa: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("clients").select("*", { count: "exact", head: true }).not("telegram_chat_id", "is", null),
      supabase.from("clients").select("*", { count: "exact", head: true }).not("email", "is", null),
      supabase.from("clients").select("*", { count: "exact", head: true }).not("phone", "is", null),
      supabase.from("batches").select("batch_code,status").order("created_at", { ascending: false }),
    ]).then(([all, tg, email, wa, b]) => {
      setStats({ total: all.count ?? 0, tg: tg.count ?? 0, email: email.count ?? 0, wa: wa.count ?? 0 });
      if (b.data) setBatches(b.data);
    });
  }, []);

  const STAT_CARDS = [
    { label: "Всего клиентов", value: stats.total, color: "#0f172a",  bg: "#f8fafc"  },
    { label: "Telegram",       value: stats.tg,    color: "#0369a1",  bg: "#f0f9ff"  },
    { label: "Email",          value: stats.email, color: "#6d28d9",  bg: "#faf5ff"  },
    { label: "WhatsApp",       value: stats.wa,    color: "#15803d",  bg: "#f0fdf4"  },
  ];

  return (
    <div style={css.page}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" }}>Уведомления</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Рассылки клиентам через Telegram, WhatsApp и Email</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ ...css.card, padding: "18px 22px", background: s.bg }}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 10, letterSpacing: 0.3 }}>{s.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{stats.total === 0 ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "12px 24px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t.key ? 600 : 400, color: tab === t.key ? "#0f172a" : "#64748b", borderBottom: tab === t.key ? "2px solid #0f172a" : "2px solid transparent", marginBottom: -1, fontFamily: "inherit", transition: "color .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ ...css.card, padding: 28, borderTop: "none", borderRadius: "0 0 12px 12px" }}>
        {tab === "bulk"   && <BulkSection   stats={stats} />}
        {tab === "batch"  && <BatchSection  batches={batches} />}
        {tab === "single" && <SingleSection />}
      </div>
    </div>
  );
}