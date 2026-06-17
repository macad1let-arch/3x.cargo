"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Icon } from "@/lib/dashboard";
import {
  getClient, getBonusHistory, getLoyaltyLevel, getNextLevel, getLevelProgress,
  LOYALTY_LEVELS, Client, BonusTransaction,
} from "@/lib/supabase-dashboard";

export default function BonusesPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<BonusTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"level" | "history" | "referral">("level");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const c = await getClient(user.id);
      if (!c) { setLoading(false); return; }
      setClient(c);
      const h = await getBonusHistory(c.client_code);
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

  const orders = client?.total_orders ?? 0;
  const currentLevel = getLoyaltyLevel(orders);
  const nextLevel = getNextLevel(currentLevel.key);
  const progress = getLevelProgress(orders, currentLevel.key);
  const ordersToNext = nextLevel ? nextLevel.minOrders - orders : 0;

  const TABS = [
    { key: "level",    label: "Уровень"   },
    { key: "history",  label: "История"   },
    { key: "referral", label: "Реферальная" },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#0a1e3d", padding: "20px 20px 24px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Бонусы и уровень</div>

        {/* Bonus balance */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 4 }}>Бонусный баланс</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{(client?.bonus_balance ?? 0).toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>≈ {Math.round((client?.bonus_balance ?? 0) * 0.1).toLocaleString()} сом</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Заработано всего</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{(client?.total_bonus_earned ?? 0).toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Использовано: {(client?.total_bonus_used ?? 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Level badge */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: currentLevel.bg, borderRadius: 8, padding: "4px 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: currentLevel.color }}>{currentLevel.label}</span>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{currentLevel.cashback}% кэшбэк</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{orders} заказов</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: currentLevel.color, borderRadius: 6, transition: "width .5s" }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {nextLevel ? `Ещё ${ordersToNext} заказов до уровня ${nextLevel.label}` : "Максимальный уровень — Платина 🏆"}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: "#fff", display: "flex", borderBottom: "1px solid #f0f2f5" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{ flex: 1, padding: "14px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#005eaa" : "#64748b", borderBottom: tab === t.key ? "2px solid #005eaa" : "2px solid transparent", fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 14px 24px" }}>

        {/* ── LEVEL TAB ── */}
        {tab === "level" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LOYALTY_LEVELS.map((level, i) => {
              const isCurrent = level.key === currentLevel.key;
              const isPassed = LOYALTY_LEVELS.indexOf(level) < LOYALTY_LEVELS.indexOf(currentLevel);
              return (
                <div key={level.key} style={{ background: "#fff", border: `1.5px solid ${isCurrent ? level.color : "#e8edf2"}`, borderRadius: 14, padding: "14px 16px", opacity: isPassed ? 0.6 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isCurrent ? 10 : 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: level.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: level.color }}>{i + 1}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d" }}>{level.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {level.maxOrders < 999 ? `от ${level.minOrders} до ${level.maxOrders} заказов` : `от ${level.minOrders} заказов`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isCurrent && <span style={{ fontSize: 10, background: level.color, color: "#fff", borderRadius: 10, padding: "2px 8px", fontWeight: 700 }}>Текущий</span>}
                      {isPassed && <span style={{ fontSize: 16 }}>✓</span>}
                      <span style={{ fontSize: 16, fontWeight: 800, color: level.color }}>{level.cashback}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {level.perks.map((p, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}>
                        <span style={{ color: level.color, fontSize: 14 }}>·</span>{p}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: 14 }}>
                История бонусов пуста
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(h => {
                  const isEarned = h.amount > 0;
                  const date = new Date(h.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
                  return (
                    <div key={h.id} style={{ background: "#fff", borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: isEarned ? "#ecfdf5" : "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 16 }}>{isEarned ? "+" : "−"}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{h.description || (isEarned ? "Начисление бонусов" : "Использование бонусов")}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: isEarned ? "#10b981" : "#f97316" }}>
                          {isEarned ? "+" : ""}{h.amount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>баланс: {(h.balance_after ?? 0).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REFERRAL TAB ── */}
        {tab === "referral" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 6 }}>Ваш реферальный код</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>Поделитесь кодом с друзьями — оба получите 100 бонусов после первого заказа</div>
              <div style={{ background: "#f0f2f5", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#0a1e3d", letterSpacing: 2 }}>{client?.referral_code || "—"}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(client?.referral_code ?? "")}
                  style={{ background: "#005eaa", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Скопировать
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 14 }}>Как это работает</div>
              {[
                { step: "1", text: "Поделитесь своим кодом с другом" },
                { step: "2", text: "Друг регистрируется и вводит ваш код" },
                { step: "3", text: "Друг делает первый заказ" },
                { step: "4", text: "Оба получаете по 100 бонусов" },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#005eaa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.step}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "#475569" }}>{s.text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Заработано с рефералов</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0a1e3d" }}>{(client?.referral_bonus_earned ?? 0).toLocaleString()} бонусов</div>
              </div>
              <Icon name="users" size={28} color="#005eaa" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}