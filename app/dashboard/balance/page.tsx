"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient, getBalanceHistory, Client, BalanceTransaction } from "@/lib/supabase-dashboard";

const TYPE_MAP: Record<string, { label: string; color: string; bg: string; sign: string }> = {
  topup:   { label: "Пополнение",  color: "#10b981", bg: "#ecfdf5", sign: "+" },
  payment: { label: "Оплата",      color: "#f97316", bg: "#fff7ed", sign: "−" },
  refund:  { label: "Возврат",     color: "#3b82f6", bg: "#eff6ff", sign: "+" },
  cashback:{ label: "Кэшбэк",     color: "#8b5cf6", bg: "#f5f3ff", sign: "+" },
  bonus:   { label: "Бонус",       color: "#8b5cf6", bg: "#f5f3ff", sign: "+" },
  debit:   { label: "Списание",    color: "#f97316", bg: "#fff7ed", sign: "−" },
  credit:  { label: "Начисление",  color: "#10b981", bg: "#ecfdf5", sign: "+" },
};

export default function BalancePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<BalanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const c = await getClient(user.id);
      if (!c) { setLoading(false); return; }
      setClient(c);
      const h = await getBalanceHistory(c.client_code);
      setHistory(h);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f5" }}>
        <div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const income = history.filter(h => h.amount > 0).reduce((s, h) => s + h.amount, 0);
  const expense = history.filter(h => h.amount < 0).reduce((s, h) => s + Math.abs(h.amount), 0);

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#0a1e3d", padding: "20px 20px 28px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Баланс</div>

        {/* Main balance */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 6 }}>Основной счёт</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
            ₸ {(client?.balance ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Пополнено</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981" }}>+ ₸ {income.toLocaleString()}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Потрачено</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f97316" }}>− ₸ {expense.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* TOPUP BUTTON */}
      <div style={{ padding: "16px 14px 0" }}>
        <button style={{ width: "100%", background: "#005eaa", border: "none", borderRadius: 14, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="plus" size={18} color="#fff" />
          Пополнить баланс
        </button>
      </div>

      {/* HISTORY */}
      <div style={{ padding: "16px 14px 24px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0a1e3d", marginBottom: 12 }}>История операций</div>

        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: 14 }}>
            История операций пуста
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map(h => {
              const typeInfo = TYPE_MAP[h.type] ?? { label: h.type, color: "#64748b", bg: "#f1f5f9", sign: h.amount > 0 ? "+" : "−" };
              const isPositive = h.amount > 0;
              const date = new Date(h.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
              const time = new Date(h.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={h.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: typeInfo.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 18, color: typeInfo.color }}>{typeInfo.sign}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{h.description || typeInfo.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {date} · {time}
                        {h.tracking_code ? ` · ${h.tracking_code}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: isPositive ? "#10b981" : "#f97316" }}>
                      {isPositive ? "+" : ""}₸ {Math.abs(h.amount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>₸ {(h.balance_after ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}