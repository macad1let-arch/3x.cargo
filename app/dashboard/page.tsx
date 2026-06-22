"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { getClient, getShipmentCounts, getUnreadCount, getLoyaltyLevel, getNextLevel, getLevelProgress, Client } from "@/lib/supabase-dashboard";
import { Icon } from "@/lib/dashboard";

export default function DashboardHome() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [client, setClient] = useState<Client | null>(null);
  const [counts, setCounts] = useState({ china: 0, transit: 0, sorting: 0, ready: 0 });
  const [unread, setUnread] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const clientData = await getClient(user.id);
      if (!clientData) { setLoading(false); return; }
      setClient(clientData);
      const [shipmentCounts, unreadCount] = await Promise.all([
        getShipmentCounts(clientData.client_code),
        getUnreadCount(clientData.client_code),
      ]);
      setCounts(shipmentCounts);
      setUnread(unreadCount);
      setTotalOrders(clientData.total_orders ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  const loyaltyLevel = getLoyaltyLevel(totalOrders);
  const nextLevel = getNextLevel(loyaltyLevel.key);
  const progress = getLevelProgress(totalOrders, loyaltyLevel.key);
  const totalActive = counts.china + counts.transit + counts.sorting + counts.ready;
  const ORDER_TILES = [
    {
      key: "china",
      label: "В Китае",
      count: counts.china,
      bg: "#eff6ff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
          <path d="M3 7h18v10H3z" />
          <path d="M3 7l9 5 9-5" />
        </svg>
      ),
    },
    {
      key: "transit",
      label: "В пути",
      count: counts.transit,
      bg: "#eff6ff",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round">
          <path d="M3 16h15" />
          <path d="M5 16v-5a4 4 0 0 1 8 0v5" />
          <path d="M19 16h2v3h-2z" />
          <circle cx="7" cy="19" r="2" />
          <circle cx="17" cy="19" r="2" />
        </svg>
      ),
    },
    {
      key: "sorting",
      label: "Сортировка",
      count: counts.sorting,
      bg: "#ede9fe",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9h12" />
          <path d="M6 13h8" />
          <path d="M6 17h4" />
          <path d="M18 5l3 3-3 3" />
        </svg>
      ),
    },
    {
      key: "ready",
      label: "Готово",
      count: counts.ready,
      bg: "#dcfce7",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
  ];
  const firstName = client?.first_name || client?.full_name?.split(" ")[0] || "Клиент";

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f6f9" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh", paddingBottom: 80 }}>

{/* TOPBAR */}
<div style={{ background: "#fff", padding: "12px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  {/* Левая часть: аватар + имя + код */}
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <div style={{
      width: 46, height: 46, borderRadius: "50%",
      background: "#0a1e3d",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
      letterSpacing: 0.5
    }}>
      {(firstName[0] || "").toUpperCase()}{(client?.last_name?.[0] || client?.full_name?.split(" ")[1]?.[0] || "").toUpperCase()}
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#0a1e3d", lineHeight: 1.1 }}>{firstName}</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{client?.client_code}</div>
    </div>
  </div>

  {/* Правая часть: колокол, язык, луна */}
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    {/* Колокол */}
    <Link href="/dashboard/notifications" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div style={{ position: "relative" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
        )}
      </div>
    </Link>

    {/* Язык */}
<div style={{ cursor: "pointer" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
</div>

    {/* Тема */}
    <div style={{ cursor: "pointer" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </div>
  </div>
</div>

<div style={{ padding: "12px 14px 0" }}>

<div style={{ background: "linear-gradient(135deg, #1B2B6B 0%, #0F1A45 100%)", borderRadius: 24, marginBottom: 12, padding: "20px 16px", boxSizing: "border-box" as const }}>
  <div style={{ display: "flex", alignItems: "flex-start" }}>

    {/* Баланс */}
    <div style={{ flex: "0 0 30%", paddingRight: 14, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)" }}>Баланс</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{(client?.balance ?? 0).toLocaleString()}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>сом</span>
      </div>
      <Link href="/dashboard/balance" style={{ textDecoration: "none", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 10px", width: "fit-content" }}>
        <span style={{ fontSize: 14, color: "#fff", lineHeight: 1 }}>+</span>
        <span style={{ fontSize: 11, color: "#fff", whiteSpace: "nowrap" as const }}>Пополнить</span>
      </Link>
    </div>

    <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,.1)" }} />

    {/* Бонусы */}
    <Link href="/dashboard/bonuses" style={{ textDecoration: "none", flex: "0 0 28%", padding: "0 14px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" as const }}>Бонусы</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{(client?.bonus_balance ?? 0).toLocaleString()}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" as const, color:
        loyaltyLevel.key === "bronze" ? "#f59e0b"
        : loyaltyLevel.key === "silver" ? "#94a3b8"
        : loyaltyLevel.key === "gold" ? "#f59e0b"
        : loyaltyLevel.key === "platinum" ? "#8b5cf6"
        : "rgba(255,255,255,.4)"
      }}>Кэшбэк {loyaltyLevel.cashback}%</div>
    </Link>

    <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,.1)" }} />

    {/* Уровень */}
    <Link href="/dashboard/bonuses" style={{ textDecoration: "none", flex: 1, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" as const }}>Уровень</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ height: 32, display: "flex", alignItems: "center", gap: 8 }}>
    {loyaltyLevel.key === "newbie"   && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
    {loyaltyLevel.key === "bronze"   && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>}
    {loyaltyLevel.key === "silver"   && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>}
    {loyaltyLevel.key === "gold"     && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/></svg>}
    {loyaltyLevel.key === "platinum" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"><path d="M6.5 2h11L21 8l-9 14L3 8l3.5-6z"/></svg>}
    </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{loyaltyLevel.label}</span>
      </div>
      {nextLevel ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 2 }}>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, width: `${progress}%`, background: "linear-gradient(90deg, #4F6FE8 0%, #6366f1 100%)" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", whiteSpace: "nowrap" as const }}>До {nextLevel.label}: {nextLevel.minOrders - totalOrders} заказов</div>
        </div>
      ) : <div />}
    </Link>

  </div>
</div>
  
{/* READY PICKUP BANNER */}
{counts.ready > 0 && (
  <Link href="/dashboard/orders?status=ready" style={{ textDecoration: "none", display: "block", background: "#16a34a", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{counts.ready} {counts.ready === 1 ? "посылка готова" : "посылки готовы"} к выдаче</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>Сегодня до 19:00</div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  </Link>
)}

{/* TRACK */}
<div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10, border: "1px solid #f0f2f5" }}>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  <input placeholder="Введите трек-код" style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#0a1e3d", background: "transparent", fontFamily: "inherit" }}
    onKeyDown={e => { if (e.key === "Enter") window.location.href = "/dashboard/orders"; }} />
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
  </svg>
</div>

{/* QUICK ACTIONS */}
<div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf5", marginBottom: 12, padding: "16px 0" }}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
    {[
      {
        icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#1e3a8a"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
        label: "Обучение", href: "/"
      },
      {
        icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#1e3a8a"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>,
        label: "Инструкции", href: "/dashboard/instructions"
      },
      {
        icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="#1e3a8a"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>,
        label: "Награды", href: "/dashboard/bonuses"
      },
    ].map((q, i) => (
      <Link key={i} href={q.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0", borderRight: i < 2 ? "1px solid #e8edf5" : "none" }}>
        {q.icon}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{q.label}</div>
      </Link>
    ))}
  </div>
</div>

{/* MY ORDERS */}
<div style={{ marginBottom: 12 }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <span style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d" }}>Мои заказы</span>
    <Link href="/dashboard/orders" style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
      Все заказы
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
    </Link>
  </div>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

    {/* В Китае */}
    <Link href="/dashboard/orders?status=china" style={{ textDecoration: "none", background: "#fff", borderRadius: 16, padding: "14px", border: "1px solid #f0f2f5", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>{counts.china}</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>В Китае</div>
    </Link>

    {/* В пути */}
    <Link href="/dashboard/orders?status=transit" style={{ textDecoration: "none", background: "#fff", borderRadius: 16, padding: "14px", border: "1px solid #f0f2f5", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6", lineHeight: 1 }}>{counts.transit}</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>В пути</div>
    </Link>

    {/* На сортировке */}
    <Link href="/dashboard/orders?status=sorting" style={{ textDecoration: "none", background: "#fff", borderRadius: 16, padding: "14px", border: "1px solid #f0f2f5", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#8b5cf6", lineHeight: 1 }}>{counts.sorting}</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>На сортировке</div>
    </Link>

    {/* Готово к выдаче */}
    <Link href="/dashboard/orders?status=ready" style={{
      textDecoration: "none", background: "#fff", borderRadius: 16, padding: "14px",
      border: counts.ready > 0 ? "1.5px solid #16a34a" : "1px solid #f0f2f5",
      display: "flex", flexDirection: "column", gap: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>{counts.ready}</div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>Готово к выдаче</div>
        {counts.ready > 0 && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 3 }}>Заберите сегодня</div>}
      </div>
    </Link>

  </div>
</div>

{/* REFERRAL BANNER */}
<div style={{ background: "#0f172a", borderRadius: 16, padding: "16px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden", position: "relative" }}>
  <div style={{ position: "absolute", left: 0, bottom: 0, top: 0, width: 90, overflow: "hidden" }}>
    <svg viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", bottom: 0, left: -10 }}>
      <ellipse cx="30" cy="75" rx="18" ry="18" fill="#1e293b"/>
      <rect x="18" y="35" width="24" height="40" rx="4" fill="#334155"/>
      <ellipse cx="30" cy="33" rx="10" ry="10" fill="#475569"/>
      <ellipse cx="60" cy="78" rx="15" ry="15" fill="#1e293b"/>
      <rect x="50" y="42" width="20" height="36" rx="4" fill="#1d4ed8"/>
      <ellipse cx="60" cy="40" rx="8" ry="8" fill="#3b82f6"/>
      <path d="M25 50 Q35 44 45 50" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
    </svg>
  </div>
  <div style={{ paddingLeft: 88 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Пригласите друга</div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>и получите +200 бонусов</div>
  </div>
  <Link href="/dashboard/referral" style={{ background: "#fff", borderRadius: 20, padding: "9px 18px", textDecoration: "none", flexShrink: 0 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Пригласить</span>
  </Link>
</div>

{/* NEWS */}
<div style={{ marginBottom: 12 }}>
  <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 10 }}>Новости и полезное</div>
  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #f0f2f5" }}>
    {[
      { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, bg: "#eff6ff", text: "Новый маршрут: Урумчи", right: "20 июня", rightColor: "#64748b" },
      { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>, bg: "#fef2f2", text: "Скидка на доставку с 1 июня", right: "Подробнее", rightColor: "#3b82f6" },
      { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, bg: "#f0fdf4", text: "Курс юаня: 1 ¥ = 12.14 сом", right: "+0.12 (0.99%) ↑", rightColor: "#16a34a" },
    ].map((item, i, arr) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: i < arr.length - 1 ? "1px solid #f0f2f5" : "none" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {item.icon}
        </div>
        <span style={{ flex: 1, fontSize: 13, color: "#0a1e3d", fontWeight: 500 }}>{item.text}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: item.rightColor, fontWeight: 600 }}>{item.right}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
  </div>
  );
}