"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Send, Users, Package, RefreshCw, Mail, Type, AlignLeft, Hash, Bell } from "lucide-react";

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
  china_warehouse: "На складе в Китае", in_transit: "В пути",
  bishkek_arrived: "В Бишкеке", sorting: "На сортировке",
  ready_pickup: "Готов к выдаче", completed: "Выдано", problem: "Проблема",
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

// ── SVG иконки каналов ────────────────────────────────────────────────────────
const TgIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21.5 2.5l-19 7.5 6 2.5 2 6 3.5-3.5 5 4 2.5-16.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
  </svg>
);

const WaIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill={color} />
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" stroke={color} strokeWidth={1.5} fill="none" />
  </svg>
);

const CHANNELS = [
  { key: "telegram", label: "Telegram",        color: "#0284c7", bg: "#f0f9ff", border: "#7dd3fc", renderIcon: (color: string) => <TgIcon size={15} color={color} /> },
  { key: "email",    label: "Email",            color: "#7c3aed", bg: "#faf5ff", border: "#c4b5fd", renderIcon: (color: string) => <Mail size={15} color={color} /> },
  { key: "whatsapp", label: "WhatsApp",         color: "#16a34a", bg: "#f0fdf4", border: "#86efac", renderIcon: (color: string) => <WaIcon size={15} color={color} /> },
  { key: "site",     label: "Личный кабинет",   color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc", renderIcon: (color: string) => <Bell size={15} color={color} /> },
];

// ── Стили ─────────────────────────────────────────────────────────────────────
const S = {
  inp: { width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const },
  sel: { width: "100%", height: 44, padding: "0 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, cursor: "pointer" },
  txa: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, color: "#111827", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, resize: "vertical" as const, lineHeight: 1.6, minHeight: 100 },
  lbl: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 } as React.CSSProperties,
  g2:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } as React.CSSProperties,
  col: { display: "flex", flexDirection: "column" as const, gap: 20 },
};

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 42, padding: "0 24px", borderRadius: 8, border: "none", background: disabled ? "#e5e7eb" : "#111827", color: disabled ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

function Toast({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#86efac" : "#fca5a5"}`, color: ok ? "#15803d" : "#b91c1c" }}>
      {ok ? "✓" : "✕"} {text}
    </div>
  );
}

function Bar({ sent, total }: { sent: number; total: number }) {
  const p = total > 0 ? Math.round((sent / total) * 100) : 0;
  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
        <span style={{ color: "#6b7280" }}>Отправка...</span>
        <span style={{ fontWeight: 700 }}>{sent} / {total}</span>
      </div>
      <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", background: "#111827", borderRadius: 4, transition: "width .3s" }} />
      </div>
    </div>
  );
}

function Chips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
      {CHANNELS.map(ch => {
        const on = value.includes(ch.key);
        return (
          <button key={ch.key} onClick={() => onChange(on ? value.filter(c => c !== ch.key) : [...value, ch.key])}
            style={{ display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", border: on ? `1.5px solid ${ch.border}` : "1px solid #e5e7eb", background: on ? ch.bg : "#fff", color: on ? ch.color : "#9ca3af" }}>
            {ch.renderIcon(on ? ch.color : "#9ca3af")}
            {ch.label}
          </button>
        );
      })}
    </div>
  );
}

function Badges({ c }: { c: Client }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {c.telegram_chat_id && <span style={{ fontSize: 10, background: "#f0f9ff", color: "#0284c7", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid #bae6fd" }}>TG</span>}
      {c.email            && <span style={{ fontSize: 10, background: "#faf5ff", color: "#7c3aed", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid #ddd6fe" }}>Email</span>}
      {c.phone            && <span style={{ fontSize: 10, background: "#f0fdf4", color: "#16a34a", padding: "2px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid #bbf7d0" }}>WA</span>}
    </div>
  );
}

function ClientSearch({ onSelect }: { onSelect: (c: Client) => void }) {
  const [q, setQ]       = useState("");
  const [hits, setHits] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const wrap            = useRef<HTMLDivElement>(null);
  const timer           = useRef<number>(0);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const search = useCallback(async (val: string) => {
    if (!val.trim()) { setHits([]); setOpen(false); return; }
    const { data } = await supabase.from("clients")
      .select("client_code,full_name,first_name,email,phone,telegram_chat_id")
      .or(`client_code.ilike.%${val}%,full_name.ilike.%${val}%,first_name.ilike.%${val}%,phone.ilike.%${val}%`)
      .limit(8);
    if (data?.length) { setHits(data); setOpen(true); } else { setHits([]); setOpen(false); }
  }, []);

  const onChange = (val: string) => {
    setQ(val);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => search(val), 250);
  };

  return (
    <div ref={wrap} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input style={{ ...S.inp, paddingLeft: 38 }} value={q} onChange={e => onChange(e.target.value)} onFocus={() => hits.length && setOpen(true)} placeholder="Поиск по имени, коду, телефону..." />
      </div>
      {open && hits.length > 0 && (
        <div style={{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {hits.map((c, i) => (
            <div key={c.client_code} onClick={() => { onSelect(c); setQ(""); setHits([]); setOpen(false); }}
              style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < hits.length - 1 ? "1px solid #f3f4f6" : "none" }}
              onMouseOver={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.full_name || c.first_name || "—"}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{c.client_code}{c.phone ? ` · ${c.phone}` : ""}</div>
              </div>
              <Badges c={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bulk ──────────────────────────────────────────────────────────────────────
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
    <div style={S.col}>
      <div><div style={S.lbl}><Send size={14} color="#374151" />Каналы отправки</div><Chips value={channels} onChange={setChannels} /></div>
      <div style={S.g2}>
        <div><div style={S.lbl}><Type size={14} color="#374151" />Заголовок</div><input style={S.inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Уведомление от 3X Cargo" /></div>
        <div />
      </div>
      <div><div style={S.lbl}><AlignLeft size={14} color="#374151" />Сообщение</div><textarea style={S.txa} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Текст рассылки..." /></div>
      {progress.running && <Bar sent={progress.sent} total={progress.total} />}
      <PrimaryBtn onClick={send} disabled={loading || !message.trim() || !channels.length || !count}>
        <Send size={15} color={loading || !message.trim() || !channels.length || !count ? "#9ca3af" : "#fff"} />
        {loading ? "Отправка..." : `Отправить ${count} клиентам`}
      </PrimaryBtn>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Batch ─────────────────────────────────────────────────────────────────────
function BatchSection({ batches }: { batches: Batch[] }) {
  const [batch, setBatch]       = useState("");
  const [status, setStatus]     = useState("in_transit");
  const [channels, setChannels] = useState<string[]>(["telegram", "whatsapp", "email"]);
  const [title, setTitle]       = useState(`Статус груза обновлён: ${STATUS_LABELS["in_transit"]}`);
  const [message, setMessage]   = useState(STATUS_MESSAGES["in_transit"]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; text: string } | null>(null);

  const onStatus = (s: string) => { setStatus(s); setTitle(`Статус груза обновлён: ${STATUS_LABELS[s] || s}`); setMessage(STATUS_MESSAGES[s] || ""); };

  const send = async () => {
    if (!batch || !message.trim() || !channels.length) return;
    setLoading(true); setResult(null);
    try {
      const d = await (await fetch("/api/notifications/batch-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batch_code: batch, status, channels }) })).json();
      setResult({ ok: d.ok, text: d.ok ? `Партия ${batch} · Отправлено: ${d.sent} · Ошибок: ${d.failed ?? 0}` : d.error || "Ошибка" });
    } catch { setResult({ ok: false, text: "Ошибка сервера" }); }
    setLoading(false);
  };

  return (
    <div style={S.col}>
      <div style={S.g2}>
        <div><div style={S.lbl}><Package size={14} color="#374151" />Партия</div>
          <select style={S.sel} value={batch} onChange={e => setBatch(e.target.value)}>
            <option value="">— Выберите партию —</option>
            {batches.map(b => <option key={b.batch_code} value={b.batch_code}>{b.batch_code}{b.status ? ` · ${STATUS_LABELS[b.status] || b.status}` : ""}</option>)}
          </select>
        </div>
        <div><div style={S.lbl}><RefreshCw size={14} color="#374151" />Новый статус</div>
          <select style={S.sel} value={status} onChange={e => onStatus(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div><div style={S.lbl}><Send size={14} color="#374151" />Каналы отправки</div><Chips value={channels} onChange={setChannels} /></div>
      <div><div style={S.lbl}><Type size={14} color="#374151" />Заголовок</div><input style={S.inp} value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div><div style={S.lbl}><AlignLeft size={14} color="#374151" />Сообщение</div><textarea style={S.txa} rows={4} value={message} onChange={e => setMessage(e.target.value)} /></div>
      <PrimaryBtn onClick={send} disabled={loading || !batch || !message.trim() || !channels.length}>
        <Send size={15} color={loading || !batch || !message.trim() || !channels.length ? "#9ca3af" : "#fff"} />
        {loading ? "Отправка..." : `Уведомить клиентов партии ${batch || "..."}`}
      </PrimaryBtn>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Single ────────────────────────────────────────────────────────────────────
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
    <div style={S.col}>
      <div>
        <div style={S.lbl}><Users size={14} color="#374151" />Получатели</div>
        <ClientSearch onSelect={add} />
        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {selected.map(c => (
              <div key={c.client_code} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px 6px 12px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{(c.full_name || c.first_name || "?")[0].toUpperCase()}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.full_name || c.first_name || c.client_code}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.client_code}</div>
                </div>
                <Badges c={c} />
                <button onClick={() => remove(c.client_code)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: "0 2px", display: "flex", alignItems: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div><div style={S.lbl}><Send size={14} color="#374151" />Каналы отправки</div><Chips value={channels} onChange={setChannels} /></div>
      <div style={S.g2}>
        <div><div style={S.lbl}><Type size={14} color="#374151" />Заголовок</div><input style={S.inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Уведомление от 3X Cargo" /></div>
        <div><div style={S.lbl}><Hash size={14} color="#374151" />Трек-код</div><input style={S.inp} value={tracking} onChange={e => setTracking(e.target.value)} placeholder="YT8812272164356" /></div>
      </div>
      <div><div style={S.lbl}><AlignLeft size={14} color="#374151" />Сообщение</div><textarea style={S.txa} rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Текст сообщения..." /></div>
      <PrimaryBtn onClick={send} disabled={loading || !selected.length || !message.trim() || !channels.length}>
        <Send size={15} color={loading || !selected.length || !message.trim() || !channels.length ? "#9ca3af" : "#fff"} />
        {loading ? "Отправка..." : selected.length > 1 ? `Отправить ${selected.length} клиентам` : "Отправить"}
      </PrimaryBtn>
      {result && <Toast ok={result.ok} text={result.text} />}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "bulk",   label: "Массовая рассылка",  Icon: Send    },
  { key: "batch",  label: "По статусу партии",   Icon: Package },
  { key: "single", label: "Отдельным клиентам",  Icon: Users   },
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

  const STAT_CARDS: { label: string; value: number; color: string; bg: string; border: string; renderIcon: () => React.ReactNode }[] = [
    { label: "Клиентов", value: stats.total, color: "#111827", bg: "#f9fafb", border: "#e5e7eb", renderIcon: () => <Users size={20} color="#111827" /> },
    { label: "Telegram", value: stats.tg,    color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", renderIcon: () => <TgIcon size={20} color="#0284c7" /> },
    { label: "Email",    value: stats.email, color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe", renderIcon: () => <Mail size={20} color="#7c3aed" /> },
    { label: "WhatsApp", value: stats.wa,    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", renderIcon: () => <WaIcon size={20} color="#16a34a" /> },
  ];

  return (
    <div style={{ padding: "32px 36px", fontFamily: "inherit", color: "#111827" }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Уведомления</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Telegram · WhatsApp · Email · Личный кабинет</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{stats.total === 0 ? "—" : s.value}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.renderIcon()}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 0 }}>
        {TABS.map(t => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: on ? 700 : 500, color: on ? "#111827" : "#6b7280", borderBottom: on ? "2px solid #111827" : "2px solid transparent", marginBottom: -1 }}>
              <t.Icon size={15} color={on ? "#111827" : "#9ca3af"} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 28 }}>
        {tab === "bulk"   && <BulkSection   stats={stats} />}
        {tab === "batch"  && <BatchSection  batches={batches} />}
        {tab === "single" && <SingleSection />}
      </div>
    </div>
  );
}