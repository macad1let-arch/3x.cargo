"use client";
import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Package, Users, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, CheckCircle2, Clock, BarChart3, Activity,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Download,
  Bot, Zap, Target, Weight
} from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Period = "today" | "yesterday" | "7d" | "30d" | "90d" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Сегодня", yesterday: "Вчера", "7d": "7 дней",
  "30d": "30 дней", "90d": "90 дней", year: "Год",
};

function getPeriodDates(period: Period): { from: Date; to: Date; prevFrom: Date; prevTo: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from: Date, to: Date, prevFrom: Date, prevTo: Date;

  switch (period) {
    case "today":
      from = today; to = now;
      prevFrom = new Date(today); prevFrom.setDate(prevFrom.getDate() - 1);
      prevTo = new Date(today); prevTo.setSeconds(-1);
      break;
    case "yesterday":
      from = new Date(today); from.setDate(from.getDate() - 1);
      to = new Date(today); to.setSeconds(-1);
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 1);
      prevTo = new Date(from); prevTo.setSeconds(-1);
      break;
    case "7d":
      from = new Date(today); from.setDate(from.getDate() - 7);
      to = now;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(from); prevTo.setSeconds(-1);
      break;
    case "30d":
      from = new Date(today); from.setDate(from.getDate() - 30);
      to = now;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 30);
      prevTo = new Date(from); prevTo.setSeconds(-1);
      break;
    case "90d":
      from = new Date(today); from.setDate(from.getDate() - 90);
      to = now;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 90);
      prevTo = new Date(from); prevTo.setSeconds(-1);
      break;
    case "year":
      from = new Date(today); from.setFullYear(from.getFullYear() - 1);
      to = now;
      prevFrom = new Date(from); prevFrom.setFullYear(prevFrom.getFullYear() - 1);
      prevTo = new Date(from); prevTo.setSeconds(-1);
      break;
  }
  return { from, to, prevFrom, prevTo };
}

function delta(curr: number, prev: number): { pct: number; dir: "up" | "down" | "flat" } {
  if (prev === 0) return { pct: curr > 0 ? 100 : 0, dir: curr > 0 ? "up" : "flat" };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct: Math.abs(pct), dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

function Delta({ curr, prev }: { curr: number; prev: number }) {
  const d = delta(curr, prev);
  const color = d.dir === "up" ? "#16a34a" : d.dir === "down" ? "#dc2626" : "#6b7280";
  const Icon = d.dir === "up" ? ArrowUpRight : d.dir === "down" ? ArrowDownRight : Minus;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color }}>
      <Icon size={13} />{d.pct}% vs пред. период
    </span>
  );
}

function KpiCard({ label, value, prev, icon: Icon, color, bg, sub }: {
  label: string; value: number | string; prev?: number; icon: React.ElementType;
  color: string; bg: string; sub?: string;
}) {
  return (
    <div style={{ background: bg, border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#6b7280" }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1, marginBottom: 8 }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      {prev !== undefined && typeof value === "number" && <Delta curr={value} prev={prev} />}
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: "100%", background: color, borderRadius: 3, height: Math.max(4, (d.value / max) * 52), opacity: 0.85 }} />
          <div style={{ fontSize: 9, color: "#9ca3af" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function StatusRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: "#374151", fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 700, color: "#111827" }}>{value} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [shipments, setShipments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [balanceTx, setBalanceTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: s }, { data: c }, { data: b }] = await Promise.all([
        supabase.from("shipments").select("id,client_code,tracking_code,status,weight,delivery_cost,final_amount,created_at,updated_at,batch_code"),
        supabase.from("clients").select("id,client_code,full_name,first_name,balance,bonus_balance,total_orders,loyalty_level,created_at"),
        supabase.from("balance_transactions").select("id,client_code,type,amount,created_at"),
      ]);
      setShipments(s || []);
      setClients(c || []);
      setBalanceTx(b || []);
      setLoading(false);
    }
    load();
  }, []);

  const { from, to, prevFrom, prevTo } = getPeriodDates(period);

  const inPeriod = (date: string) => { const d = new Date(date); return d >= from && d <= to; };
  const inPrev = (date: string) => { const d = new Date(date); return d >= prevFrom && d <= prevTo; };

  const curr = useMemo(() => shipments.filter(s => inPeriod(s.created_at)), [shipments, period]);
  const prev = useMemo(() => shipments.filter(s => inPrev(s.created_at)), [shipments, period]);
  const currClients = useMemo(() => clients.filter(c => inPeriod(c.created_at)), [clients, period]);
  const prevClients = useMemo(() => clients.filter(c => inPrev(c.created_at)), [clients, period]);
  const currTx = useMemo(() => balanceTx.filter(t => inPeriod(t.created_at)), [balanceTx, period]);
  const prevTx = useMemo(() => balanceTx.filter(t => inPrev(t.created_at)), [balanceTx, period]);

  const revenue = (txs: any[]) => txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const currRevenue = revenue(currTx);
  const prevRevenue = revenue(prevTx);

  const totalWeight = (arr: any[]) => arr.reduce((s, x) => s + (x.weight || 0), 0);

  // By status
  const byStatus = (arr: any[], status: string) => arr.filter(s => s.status === status).length;

  // Daily chart data (last 7 days or 30 days)
  const chartDays = period === "today" || period === "yesterday" ? 1 : period === "7d" ? 7 : 30;
  const dailyData = useMemo(() => {
    const days: { label: string; value: number }[] = [];
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" });
      const value = shipments.filter(s => new Date(s.created_at).toDateString() === d.toDateString()).length;
      days.push({ label, value });
    }
    return days.slice(-14);
  }, [shipments, period, chartDays]);

  // Top clients by orders
  const topClients = useMemo(() => {
    const map: Record<string, { code: string; name: string; count: number; weight: number }> = {};
    curr.forEach(s => {
      if (!s.client_code || s.client_code === "unknown") return;
      if (!map[s.client_code]) {
        const c = clients.find(c => c.client_code === s.client_code);
        map[s.client_code] = { code: s.client_code, name: c?.full_name || c?.first_name || s.client_code, count: 0, weight: 0 };
      }
      map[s.client_code].count++;
      map[s.client_code].weight += s.weight || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [curr, clients]);

  // Loyalty breakdown
  const loyaltyBreakdown = useMemo(() => {
    const levels = ["newbie", "bronze", "silver", "gold", "platinum"];
    return levels.map(l => ({ label: { newbie: "Новичок", bronze: "Бронза", silver: "Серебро", gold: "Золото", platinum: "Платина" }[l]!, count: clients.filter(c => c.loyalty_level === l).length }));
  }, [clients]);

  // Churn risk — clients with no orders in 60+ days
  const churnRisk = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
    return clients.filter(c => {
      if (!c.total_orders) return false;
      const lastShipment = shipments.filter(s => s.client_code === c.client_code).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      if (!lastShipment) return false;
      return new Date(lastShipment.created_at) < cutoff;
    }).slice(0, 6);
  }, [clients, shipments]);

  // Avg delivery time (completed)
  const avgDeliveryDays = useMemo(() => {
    const completed = curr.filter(s => s.status === "completed" && s.updated_at);
    if (!completed.length) return 0;
    const total = completed.reduce((sum, s) => {
      const days = (new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    return Math.round(total / completed.length);
  }, [curr]);

  const generateAiInsight = async () => {
    setAiLoading(true);
    try {
      const context = `
Период: ${PERIOD_LABELS[period]}
Посылок: ${curr.length} (пред: ${prev.length})
Выдано: ${byStatus(curr, "completed")} (пред: ${byStatus(prev, "completed")})
Проблемных: ${byStatus(curr, "problem")}
Новых клиентов: ${currClients.length} (пред: ${prevClients.length})
Всего клиентов: ${clients.length}
Риск оттока: ${churnRisk.length} клиентов
Выручка: ${currRevenue.toLocaleString()} сом (пред: ${prevRevenue.toLocaleString()} сом)
Общий вес: ${totalWeight(curr).toFixed(1)} кг
Средний срок доставки: ${avgDeliveryDays} дней
Уровни клиентов: ${loyaltyBreakdown.map(l => `${l.label}: ${l.count}`).join(", ")}
      `;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Ты аналитик карго компании 3X Cargo. Проанализируй данные и дай краткий отчёт директору — 5-7 ключевых выводов и 2-3 рекомендации. Без приветствий, без markdown, только суть. Данные: ${context}`,
        }),
      });
      const data = await res.json();
      setAiInsight(data.reply || "");
    } catch { setAiInsight("Ошибка получения анализа."); }
    setAiLoading(false);
  };

  const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 20 };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: "24px 28px", fontFamily: "inherit", color: "#111827", maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Аналитика</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Полный обзор бизнеса</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ height: 36, padding: "0 14px", borderRadius: 20, border: period === p ? "1.5px solid #2563eb" : "1px solid #e5e7eb", background: period === p ? "#2563eb" : "#fff", color: period === p ? "#fff" : "#6b7280", fontSize: 13, fontWeight: period === p ? 700 : 500, cursor: "pointer", fontFamily: "inherit" }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Посылок" value={curr.length} prev={prev.length} icon={Package} color="#2563eb" bg="#eff6ff" />
        <KpiCard label="Выдано" value={byStatus(curr, "completed")} prev={byStatus(prev, "completed")} icon={CheckCircle2} color="#16a34a" bg="#f0fdf4" />
        <KpiCard label="Новых клиентов" value={currClients.length} prev={prevClients.length} icon={Users} color="#7c3aed" bg="#faf5ff" />
        <KpiCard label="Выручка" value={`${currRevenue.toLocaleString()} с`} prev={prevRevenue} icon={DollarSign} color="#d97706" bg="#fffbeb" sub={`пред: ${prevRevenue.toLocaleString()} с`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Общий вес" value={`${totalWeight(curr).toFixed(1)} кг`} icon={Weight} color="#0891b2" bg="#ecfeff" sub={`пред: ${totalWeight(prev).toFixed(1)} кг`} />
        <KpiCard label="Проблемных" value={byStatus(curr, "problem")} prev={byStatus(prev, "problem")} icon={AlertTriangle} color="#dc2626" bg="#fef2f2" />
        <KpiCard label="В пути" value={byStatus(shipments, "in_transit")} icon={Activity} color="#ea580c" bg="#fff7ed" sub="Активные прямо сейчас" />
        <KpiCard label="Ср. срок доставки" value={`${avgDeliveryDays} дн`} icon={Clock} color="#6b7280" bg="#f9fafb" sub="Для выданных посылок" />
      </div>

      {/* Row 2 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* Статусы */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Распределение по статусам</div>
          {[
            { label: "На складе в Китае", status: "china_warehouse", color: "#f97316" },
            { label: "В пути",            status: "in_transit",      color: "#3b82f6" },
            { label: "В Бишкеке",         status: "bishkek_arrived", color: "#8b5cf6" },
            { label: "На сортировке",     status: "sorting",         color: "#a855f7" },
            { label: "Готов к выдаче",    status: "ready_pickup",    color: "#10b981" },
            { label: "Выдано",            status: "completed",       color: "#6b7280" },
            { label: "Проблема",          status: "problem",         color: "#ef4444" },
          ].map(s => <StatusRow key={s.status} label={s.label} value={byStatus(shipments, s.status)} total={shipments.length} color={s.color} />)}
        </div>

        {/* Динамика */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Динамика посылок</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Последние {chartDays > 14 ? 14 : chartDays} дней</div>
          <MiniBar data={dailyData} color="#2563eb" />
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Макс. за день</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{Math.max(...dailyData.map(d => d.value))}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Среднее</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{dailyData.length ? Math.round(dailyData.reduce((s,d) => s + d.value, 0) / dailyData.length) : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* Top clients */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Топ клиентов за период</div>
          {topClients.length === 0 && <div style={{ color: "#9ca3af", fontSize: 14 }}>Нет данных</div>}
          {topClients.map((c, i) => (
            <div key={c.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < 3 ? "#dbeafe" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i < 3 ? "#2563eb" : "#6b7280" }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.code}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.count} пос.</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.weight.toFixed(1)} кг</div>
              </div>
            </div>
          ))}
        </div>

        {/* Loyalty */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Уровни лояльности</div>
          {loyaltyBreakdown.map((l, i) => {
            const colors = ["#6b7280", "#b45309", "#475569", "#d97706", "#6366f1"];
            return (
              <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[i] }} />
                  <span style={{ fontSize: 13, color: "#374151" }}>{l.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${clients.length ? (l.count / clients.length) * 100 : 0}%`, height: "100%", background: colors[i], borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: "right" }}>{l.count}</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Всего клиентов</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{clients.length}</div>
          </div>
        </div>

        {/* Churn risk */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Риск оттока</div>
            {churnRisk.length > 0 && <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, border: "1px solid #fca5a5" }}>{churnRisk.length}</span>}
          </div>
          {churnRisk.length === 0 && <div style={{ color: "#9ca3af", fontSize: 14 }}>Клиентов с риском оттока нет</div>}
          {churnRisk.map(c => {
            const lastS = shipments.filter(s => s.client_code === c.client_code).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const days = lastS ? Math.floor((Date.now() - new Date(lastS.created_at).getTime()) / (1000*60*60*24)) : 0;
            const risk = days > 90 ? "Высокий" : days > 60 ? "Средний" : "Низкий";
            const riskColor = days > 90 ? "#dc2626" : days > 60 ? "#d97706" : "#16a34a";
            return (
              <div key={c.client_code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.full_name || c.first_name || c.client_code}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{days} дней без заказа</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: riskColor, background: `${riskColor}15`, padding: "3px 8px", borderRadius: 8 }}>{risk}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Director */}
      <div style={{ ...card, background: "#0f172a", borderColor: "#1e293b", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>AI Директор</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Анализ и рекомендации</div>
            </div>
          </div>
          <button onClick={generateAiInsight} disabled={aiLoading} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 8, border: "none", background: aiLoading ? "#1e293b" : "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {aiLoading ? <><RefreshCw size={14} style={{ animation: "spin .8s linear infinite" }} /> Анализ...</> : <><Zap size={14} /> Анализировать</>}
          </button>
        </div>
        {aiInsight ? (
          <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiInsight}</div>
        ) : (
          <div style={{ fontSize: 14, color: "#475569", fontStyle: "italic" }}>Нажмите "Анализировать" чтобы получить отчёт AI директора по текущему периоду.</div>
        )}
      </div>

      {/* Balance transactions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Транзакции баланса за период</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Пополнений", value: currTx.filter(t => t.type === "topup").length, color: "#16a34a" },
              { label: "Списаний",   value: currTx.filter(t => t.type === "debit" || t.amount < 0).length, color: "#dc2626" },
              { label: "Возвратов",  value: currTx.filter(t => t.type === "refund").length, color: "#2563eb" },
            ].map(s => (
              <div key={s.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 600 }}>Итого поступлений</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{currRevenue.toLocaleString()} с</span>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Общая статистика базы</div>
          {[
            { label: "Всего посылок в базе",     value: shipments.length },
            { label: "Уникальных клиентов",       value: clients.length },
            { label: "Без клиента (unknown)",      value: shipments.filter(s => s.client_code === "unknown").length },
            { label: "С проблемой",               value: shipments.filter(s => s.status === "problem").length },
            { label: "Клиентов с балансом > 0",   value: clients.filter(c => c.balance > 0).length },
            { label: "Клиентов с бонусами > 0",   value: clients.filter(c => c.bonus_balance > 0).length },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
              <span style={{ color: "#374151" }}>{r.label}</span>
              <span style={{ fontWeight: 700 }}>{r.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}