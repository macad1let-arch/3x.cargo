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
      <div style={{ background: "#fff", padding: "14px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0a1e3d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {firstName[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#0a1e3d" }}>Привет, {firstName}! 👋</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Рады видеть вас снова</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/notifications" style={{ textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unread > 0 && <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", border: "2px solid #fff" }} />}
            </div>
          </Link>
          <Link href="/dashboard/assistant" style={{ textDecoration: "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ padding: "14px 14px 0" }}>

        {/* BALANCE + BONUSES + LEVEL */}
        <div style={{ background: "#fff", borderRadius: 20, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            {/* Balance */}
            <div style={{ padding: "16px 14px", borderRight: "1px solid #f0f2f5" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Баланс</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#0a1e3d", lineHeight: 1 }}>{(client?.balance ?? 0).toLocaleString()}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>сом</span>
              </div>
            </div>
            {/* Bonuses */}
            <Link href="/dashboard/bonuses" style={{ padding: "16px 14px", borderRight: "1px solid #f0f2f5", textDecoration: "none" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Бонусы</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#0a1e3d", lineHeight: 1 }}>{(client?.bonus_balance ?? 0).toLocaleString()}</span>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>≈ {Math.round((client?.bonus_balance ?? 0) * 0.1)} сом</div>
            </Link>
            {/* Level */}
            <Link href="/dashboard/bonuses" style={{ padding: "16px 10px", textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Уровень</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0a1e3d" }}>{loyaltyLevel.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              {nextLevel && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{progress}% до {nextLevel.label}</div>}
            </Link>
          </div>
        </div>

        {/* ACTIVE ORDERS BANNER */}
        {totalActive > 0 ? (
          <Link href="/dashboard/orders" style={{ textDecoration: "none", display: "block", background: "#eff6ff", borderRadius: 20, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, flexShrink: 0 }}>
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                  <rect width="64" height="64" rx="16" fill="#dbeafe"/>
                  <rect x="12" y="20" width="32" height="28" rx="4" fill="#3b82f6"/>
                  <rect x="16" y="24" width="24" height="20" rx="2" fill="#60a5fa"/>
                  <path d="M20 20v-4a4 4 0 0 1 8 0v4" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="44" cy="40" r="10" fill="#1d4ed8"/>
                  <path d="M40 40l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#0a1e3d", lineHeight: 1 }}>{totalActive}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>посылок в пути</div>
                {counts.sorting + counts.ready > 0 && (
                  <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2, fontWeight: 600 }}>{counts.sorting + counts.ready} прибыли сегодня</div>
                )}
              </div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a1e3d" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </Link>
        ) : (
          <div style={{ background: "#eff6ff", borderRadius: 20, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 4 }}>Нет активных заказов</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Оформите первый заказ из Китая</div>
            <Link href="/dashboard/instructions" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#005eaa", borderRadius: 10, padding: "9px 16px", textDecoration: "none" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Как сделать заказ</span>
            </Link>
          </div>
        )}

        {/* TRACK */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Отследить груз по трек-номеру" style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#0a1e3d", background: "transparent", fontFamily: "inherit" }}
            onKeyDown={e => { if (e.key === "Enter") window.location.href = "/dashboard/orders"; }} />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
          </svg>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0a1e3d" }}>Быстрые действия</span>
            <Link href="/dashboard/assistant" style={{ fontSize: 12, color: "#005eaa", fontWeight: 600, textDecoration: "none" }}>Все сервисы ›</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>, bg: "#eff6ff", label: "Рассчитать", sub: "Стоимость доставки", href: "/" },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><text x="7" y="16" style={{fontSize:10, fill:"#16a34a", fontWeight:700}}>¥</text></svg>, bg: "#f0fdf4", label: "Юани", sub: "Купить юани по выгодному курсу", href: "/dashboard/assistant" },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>, bg: "#f5f3ff", label: "Поддержка", sub: "Мы на связи 24/7", href: "/dashboard/assistant" },
            ].map((q, i) => (
              <Link key={i} href={q.href} style={{ background: "#fff", borderRadius: 16, padding: "14px 12px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: q.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{q.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0a1e3d" }}>{q.label}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>{q.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* YUAN RATE */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "13px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M8 8l4 4-4 4"/></svg>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0a1e3d" }}>Курс юаня</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#0a1e3d" }}>¥ 12.60 <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>сом</span></span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
        </div>

        {/* MY ORDERS */}
         {/* ORDERS */}
      <div style={{ padding: "18px 14px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0a1e3d" }}>Мои заказы</span>
          <Link href="/dashboard/orders" style={{ fontSize: 12, color: "#005eaa", fontWeight: 600, textDecoration: "none" }}>Все заказы ›</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ORDER_TILES.map((tile) => (
            <Link key={tile.key} href={`/dashboard/orders?status=${tile.key}`} style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 16, padding: "16px", textDecoration: "none", display: "block" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: tile.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#0a1e3d", lineHeight: 1, marginBottom: 4 }}>{tile.count}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{tile.label}</div>
            </Link>
          ))}
        </div>
      </div>

        {/* PROMO BANNER */}
        <div style={{ background: "linear-gradient(135deg, #0a1e3d 0%, #1e3a5f 60%)", borderRadius: 20, padding: "20px 20px 16px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -10, bottom: -10, opacity: .15 }}>
            <svg width="120" height="80" viewBox="0 0 120 80"><rect x="10" y="20" width="100" height="50" rx="4" fill="#fff"/><rect x="0" y="30" width="30" height="30" rx="2" fill="#fff"/><circle cx="25" cy="72" r="8" fill="#fff"/><circle cx="95" cy="72" r="8" fill="#fff"/></svg>
          </div>
          <span style={{ background: "#3b82f6", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, letterSpacing: ".05em" }}>АКЦИЯ</span>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginTop: 8, marginBottom: 4 }}>Скидка на доставку<br/>с 1 июня</div>
          <button style={{ background: "#fff", color: "#0a1e3d", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>Подробнее</button>
          <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ height: 4, width: i === 0 ? 20 : 6, borderRadius: 99, background: i === 0 ? "#fff" : "rgba(255,255,255,.3)" }} />)}
          </div>
        </div>

        {/* REFERRAL + NEWS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <Link href="/dashboard/referral" style={{ background: "#fff", borderRadius: 16, padding: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0a1e3d" }}>Реферальная программа</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>Приглашайте друзей — получайте бонусы</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: "auto" }}><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          <Link href="/dashboard/assistant" style={{ background: "#fff", borderRadius: 16, padding: "14px", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="8" y1="6" x2="14" y2="6"/><line x1="8" y1="10" x2="14" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0a1e3d" }}>Новости</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>Будьте в курсе всех событий</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: "auto" }}><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        {/* CLIENT CODE */}
        <div style={{ background: "#0a1e3d", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 3 }}>Ваш код клиента</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: 2 }}>{client?.client_code}</div>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(client?.client_code ?? ""); }}
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Копировать
          </button>
        </div>

      </div>
    </div>
  );
}