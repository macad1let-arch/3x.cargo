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
  phone: string | null;
  balance: number;
  bonus_balance: number;
  total_orders: number;
  loyalty_level: string;
};

type Transaction = {
  id: number;
  client_code: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
};

const LOYALTY_LABELS: Record<string, string> = {
  newbie: "Новичок", bronze: "Бронза", silver: "Серебро", gold: "Золото", platinum: "Платина",
};

const BALANCE_TYPES = [
  { key: "topup",   label: "Пополнение",  color: "#16a34a" },
  { key: "debit",   label: "Списание",    color: "#dc2626" },
  { key: "refund",  label: "Возврат",     color: "#2563eb" },
];

const BONUS_TYPES = [
  { key: "earned",  label: "Начисление",  color: "#7c3aed" },
  { key: "used",    label: "Списание",    color: "#ea580c" },
];

function ClientSearch({ onSelect }: { onSelect: (c: Client) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const search = useCallback(async (val: string) => {
    if (!val.trim()) { setHits([]); setOpen(false); return; }
    const { data } = await supabase.from("clients")
      .select("client_code,full_name,first_name,phone,balance,bonus_balance,total_orders,loyalty_level")
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
      <input value={q} onChange={e => onChange(e.target.value)} onFocus={() => hits.length && setOpen(true)}
        placeholder="Поиск клиента по коду, имени, телефону..."
        style={{ width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
      {open && hits.length > 0 && (
        <div style={{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {hits.map((c, i) => (
            <div key={c.client_code} onClick={() => { onSelect(c); setQ(c.full_name || c.first_name || c.client_code); setOpen(false); }}
              style={{ padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < hits.length - 1 ? "1px solid #f3f4f6" : "none" }}
              onMouseOver={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseOut={e => (e.currentTarget.style.background = "transparent")}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.full_name || c.first_name || "—"}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{c.client_code}{c.phone ? ` · ${c.phone}` : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>сом {(c.balance ?? 0).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{(c.bonus_balance ?? 0).toLocaleString()} бонусов</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCashPage() {
  const [client, setClient] = useState<Client | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState("topup");
  const [balanceDesc, setBalanceDesc] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusType, setBonusType] = useState("earned");
  const [bonusDesc, setBonusDesc] = useState("");
  const [balanceHistory, setBalanceHistory] = useState<Transaction[]>([]);
  const [bonusHistory, setBonusHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "balance" | "bonus"; text: string; ok: boolean } | null>(null);
  const [historyTab, setHistoryTab] = useState<"balance" | "bonus">("balance");

  const loadHistory = async (code: string) => {
  const balRes = await supabase
    .from("balance_transactions")
    .select("id,client_code,type,amount,description,created_at,balance_after")
    .eq("client_code", code)
    .order("created_at", { ascending: false })
    .limit(20);

  const bonRes = await supabase
    .from("bonus_transactions")
    .select("id,client_code,type,amount,description,created_at,balance_after")
    .eq("client_code", code)
    .order("created_at", { ascending: false })
    .limit(20);

  setBalanceHistory(balRes.data ?? []);
  setBonusHistory(bonRes.data ?? []);
};

  const onSelect = (c: Client) => {
    setClient(c);
    setMsg(null);
    loadHistory(c.client_code);
  };

  const applyBalance = async () => {
    if (!client || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) return;
    setLoading(true);
    const delta = balanceType === "debit" ? -amount : amount;
    const newBalance = (client.balance ?? 0) + delta;

    const { error } = await supabase.from("clients").update({ balance: newBalance }).eq("client_code", client.client_code);
    if (error) { setMsg({ type: "balance", text: error.message, ok: false }); setLoading(false); return; }

    await supabase.from("balance_transactions").insert({
      client_code: client.client_code, type: balanceType,
      amount: delta, description: balanceDesc || BALANCE_TYPES.find(t => t.key === balanceType)?.label,
      balance_before: client.balance ?? 0, balance_after: newBalance,
    });

    setClient({ ...client, balance: newBalance });
    setBalanceAmount(""); setBalanceDesc("");
    setMsg({ type: "balance", text: `Баланс обновлён: ${delta > 0 ? "+" : ""}сом${Math.abs(delta).toLocaleString()} → сом${newBalance.toLocaleString()}`, ok: true });
    loadHistory(client.client_code);
    setLoading(false);
  };

  const applyBonus = async () => {
    if (!client || !bonusAmount) return;
    const amount = parseFloat(bonusAmount);
    if (isNaN(amount) || amount <= 0) return;
    setLoading(true);
    const delta = bonusType === "used" ? -amount : amount;
    const newBonus = Math.max(0, (client.bonus_balance ?? 0) + delta);

    const { error } = await supabase.from("clients").update({ bonus_balance: newBonus }).eq("client_code", client.client_code);
    if (error) { setMsg({ type: "bonus", text: error.message, ok: false }); setLoading(false); return; }

    await supabase.from("bonus_transactions").insert({
      client_code: client.client_code, type: bonusType,
      amount: delta, description: bonusDesc || BONUS_TYPES.find(t => t.key === bonusType)?.label,
      balance_after: newBonus,
    });

    setClient({ ...client, bonus_balance: newBonus });
    setBonusAmount(""); setBonusDesc("");
    setMsg({ type: "bonus", text: `Бонусы обновлены: ${delta > 0 ? "+" : ""}${Math.abs(delta).toLocaleString()} → ${newBonus.toLocaleString()}`, ok: true });
    loadHistory(client.client_code);
    setLoading(false);
  };

  const inp: React.CSSProperties = { width: "100%", height: 42, padding: "0 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "inherit", color: "#111827" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Касса</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Управление балансом и бонусами клиентов</p>
      </div>

      {/* Search */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Выберите клиента</div>
        <ClientSearch onSelect={onSelect} />
      </div>

      {client && (
        <>
          {/* Client info */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{client.full_name || client.first_name || client.client_code}</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{client.client_code}{client.phone ? ` · ${client.phone}` : ""} · {LOYALTY_LABELS[client.loyalty_level] || client.loyalty_level} · {client.total_orders} заказов</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#0284c7", fontWeight: 600 }}>БАЛАНС</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0284c7" }}>сом {(client.balance ?? 0).toLocaleString()}</div>
                </div>
                <div style={{ background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "10px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>БОНУСЫ</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed" }}>{(client.bonus_balance ?? 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

            {/* Balance */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Баланс (сом)</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Операция</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {BALANCE_TYPES.map(t => (
                    <button key={t.key} onClick={() => setBalanceType(t.key)} style={{ flex: 1, height: 36, borderRadius: 8, border: balanceType === t.key ? `1.5px solid ${t.color}` : "1px solid #e5e7eb", background: balanceType === t.key ? t.color : "#fff", color: balanceType === t.key ? "#fff" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Сумма (сом)</div>
                <input style={inp} type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="0" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Описание</div>
                <input style={inp} value={balanceDesc} onChange={e => setBalanceDesc(e.target.value)} placeholder="Необязательно" />
              </div>
              <button onClick={applyBalance} disabled={loading || !balanceAmount}
                style={{ width: "100%", height: 42, borderRadius: 8, border: "none", background: loading || !balanceAmount ? "#e5e7eb" : "#111827", color: loading || !balanceAmount ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !balanceAmount ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                Применить
              </button>
              {msg?.type === "balance" && (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: msg.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${msg.ok ? "#86efac" : "#fca5a5"}`, color: msg.ok ? "#15803d" : "#b91c1c" }}>
                  {msg.text}
                </div>
              )}
            </div>

            {/* Bonus */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Бонусы</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Операция</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {BONUS_TYPES.map(t => (
                    <button key={t.key} onClick={() => setBonusType(t.key)} style={{ flex: 1, height: 36, borderRadius: 8, border: bonusType === t.key ? `1.5px solid ${t.color}` : "1px solid #e5e7eb", background: bonusType === t.key ? t.color : "#fff", color: bonusType === t.key ? "#fff" : "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Количество</div>
                <input style={inp} type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder="0" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>Описание</div>
                <input style={inp} value={bonusDesc} onChange={e => setBonusDesc(e.target.value)} placeholder="Необязательно" />
              </div>
              <button onClick={applyBonus} disabled={loading || !bonusAmount}
                style={{ width: "100%", height: 42, borderRadius: 8, border: "none", background: loading || !bonusAmount ? "#e5e7eb" : "#7c3aed", color: loading || !bonusAmount ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 600, cursor: loading || !bonusAmount ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                Применить
              </button>
              {msg?.type === "bonus" && (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, fontSize: 13, background: msg.ok ? "#faf5ff" : "#fef2f2", border: `1px solid ${msg.ok ? "#ddd6fe" : "#fca5a5"}`, color: msg.ok ? "#7c3aed" : "#b91c1c" }}>
                  {msg.text}
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 16 }}>
              {[{ key: "balance", label: "История баланса" }, { key: "bonus", label: "История бонусов" }].map(t => (
                <button key={t.key} onClick={() => setHistoryTab(t.key as any)}
                  style={{ padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: historyTab === t.key ? 700 : 500, color: historyTab === t.key ? "#111827" : "#6b7280", borderBottom: historyTab === t.key ? "2px solid #111827" : "2px solid transparent", marginBottom: -1, fontFamily: "inherit" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {(historyTab === "balance" ? balanceHistory : bonusHistory).length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af", fontSize: 14 }}>История пуста</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Дата</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Тип</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>Описание</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600 }}>Сумма</th>
                    <th style={{ padding: "8px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600 }}>После</th>
                  </tr>
                </thead>
                <tbody>
                  {(historyTab === "balance" ? balanceHistory : bonusHistory).map(h => {
                    const isPos = h.amount > 0;
                    const date = new Date(h.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
                    const time = new Date(h.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <tr key={h.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{date} {time}</td>
                        <td style={{ padding: "10px 12px" }}>{h.type}</td>
                        <td style={{ padding: "10px 12px", color: "#374151" }}>{h.description || "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: isPos ? "#16a34a" : "#dc2626" }}>
                          {isPos ? "+" : ""}{historyTab === "balance" ? "сом" : ""}{h.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>
                          {historyTab === "balance" ? "сом" : ""}{(h.balance_after ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}