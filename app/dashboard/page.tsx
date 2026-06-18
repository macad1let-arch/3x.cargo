"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient, getShipmentCounts, getUnreadCount, getLoyaltyLevel, getNextLevel, getLevelProgress, LOYALTY_LEVELS, Client } from "@/lib/supabase-dashboard";

export default function DashboardHome() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [client, setClient] = useState<Client | null>(null);
  const [counts, setCounts] = useState({ china: 0, transit: 0, sorting: 0, ready: 0 });
  const [unread, setUnread] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [copied, setCopied] = useState(false);
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

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const ORDER_TILES = [
    { key: "china",   label: "На складе в Китае", iconName: "warehouse",    color: "#f97316", bg: "#fff7ed", count: counts.china   },
    { key: "transit", label: "В пути",            iconName: "ship",         color: "#3b82f6", bg: "#eff6ff", count: counts.transit },
    { key: "sorting", label: "На сортировке",     iconName: "sort",         color: "#8b5cf6", bg: "#f5f3ff", count: counts.sorting },
    { key: "ready",   label: "Готовы к выдаче",   iconName: "check_circle", color: "#10b981", bg: "#ecfdf5", count: counts.ready   },
  ];

  if (loading) {
    return (
      <div suppressHydrationWarning style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Загрузка...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* TOPBAR */}
      <div style={{ background: "#fff", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/dashboard/profile" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#e8edf2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="user" size={20} color="#64748b" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0a1e3d", lineHeight: 1.2 }}>
              {client?.first_name || client?.full_name || "Клиент"}
            </div>
            <div style={{ fontSize: 11, color: "#005eaa", fontWeight: 500 }}>{client?.client_code}</div>
          </div>
          <Icon name="chevron_right" size={16} color="#cbd5e1" />
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/notifications" style={{ textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Icon name="bell" size={20} color="#0a1e3d" />
              {unread > 0 && (
                <div style={{ position: "absolute", top: 4, right: 4, minWidth: 18, height: 18, background: "#f97316", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", border: "2px solid #fff" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{unread}</span>
                </div>
              )}
            </div>
          </Link>
          <Link href="/dashboard/assistant" style={{ textDecoration: "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f4f6f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="headphones" size={20} color="#0a1e3d" />
            </div>
          </Link>
        </div>
      </div>

      {/* BALANCE */}
      <div style={{ background: "#0a1e3d", margin: "14px 14px 0", borderRadius: 20, padding: "20px 22px", display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 6 }}>Баланс</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>
            {(client?.balance ?? 0).toLocaleString()} сом
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>Основной счёт</div>
          <button style={{ marginTop: 10, fontSize: 11, color: "#4a9fd4", background: "rgba(0,94,170,0.2)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
            Пополнить
          </button>
        </div>
        <div style={{ width: "0.5px", background: "rgba(255,255,255,0.1)", margin: "0 20px" }} />
        <Link href="/dashboard/bonuses" style={{ flex: 1, textDecoration: "none" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, marginBottom: 6 }}>Бонусы</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>
            {(client?.bonus_balance ?? 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>
            ≈ {Math.round((client?.bonus_balance ?? 0) * 0.1).toLocaleString()} сом
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 3 }}>
            История <Icon name="chevron_right" size={11} color="rgba(255,255,255,0.3)" />
          </div>
        </Link>
      </div>

      <Link href="/dashboard/bonuses" style={{ display: "block", background: "#fff", margin: "10px 14px 0", borderRadius: 16, border: "0.5px solid #e8edf2", padding: "16px 18px", textDecoration: "none" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
    {LOYALTY_LEVELS.map((l, i) => {
      const current = getLoyaltyLevel(totalOrders);
      const currentIdx = LOYALTY_LEVELS.findIndex(x => x.key === current.key);
      const thisIdx = LOYALTY_LEVELS.findIndex(x => x.key === l.key);
      return (
        <div key={l.key} style={{ display: "flex", alignItems: "center", flex: i < LOYALTY_LEVELS.length - 1 ? "1 1 0" : "0 0 auto" }}>
          <div style={{ width: l.key === current.key ? 13 : 10, height: l.key === current.key ? 13 : 10, borderRadius: "50%", background: thisIdx > currentIdx ? "#e2e8f0" : l.color, flexShrink: 0 }} />
          {i < LOYALTY_LEVELS.length - 1 && (
            <div style={{ flex: 1, height: 1.5, background: thisIdx < currentIdx ? l.color : "#e2e8f0", margin: "0 4px" }} />
          )}
        </div>
      );
    })}
  </div>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
    <div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>Ваш уровень</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0a1e3d" }}>{getLoyaltyLevel(totalOrders).label}</div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>До {getNextLevel(getLoyaltyLevel(totalOrders).key)?.label ?? "Максимум"}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#005eaa" }}>{getLevelProgress(totalOrders, getLoyaltyLevel(totalOrders).key)}%</div>
    </div>
  </div>
  <div style={{ height: 6, background: "#f0f2f5", borderRadius: 6, overflow: "hidden", marginBottom: 6 }}>
    <div style={{ width: `${getLevelProgress(totalOrders, getLoyaltyLevel(totalOrders).key)}%`, height: "100%", background: getLoyaltyLevel(totalOrders).color, borderRadius: 6 }} />
  </div>
  <div style={{ fontSize: 11, color: "#94a3b8" }}>
    {getLoyaltyLevel(totalOrders).cashback}% кэшбэк · {getNextLevel(getLoyaltyLevel(totalOrders).key) ? `ещё ${(getNextLevel(getLoyaltyLevel(totalOrders).key)?.minOrders ?? 0) - totalOrders} заказов до ${getNextLevel(getLoyaltyLevel(totalOrders).key)?.label}` : "Максимальный уровень"}
  </div>
</Link>

      {/* QUICK ACTIONS */}
      <div style={{ padding: "16px 14px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            { iconName: "search",     label: "Отследить груз", sub: null,           href: "/dashboard/assistant" },
            { iconName: "calculator", label: "Калькулятор",    sub: null,           href: "/dashboard/assistant" },
            { iconName: "yuan",       label: "Купить юани",    sub: "¥1 = 12.45 сом", href: "#"                    },
          ].map((q, i) => (
            <Link key={i} href={q.href} style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 14, padding: "14px 10px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              <Icon name={q.iconName} size={22} color="#005eaa" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0a1e3d", lineHeight: 1.3 }}>{q.label}</span>
              {q.sub && <span style={{ fontSize: 10, color: "#005eaa", fontWeight: 600 }}>{q.sub}</span>}
            </Link>
          ))}
        </div>
      </div>

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
                <Icon name={tile.iconName} size={18} color={tile.color} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#0a1e3d", lineHeight: 1, marginBottom: 4 }}>{tile.count}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.3 }}>{tile.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* CLIENT CODE */}
      <div style={{ padding: "12px 14px 0" }}>
        <button onClick={() => copy(client?.client_code ?? "")} style={{ width: "100%", background: "#0a1e3d", border: "none", borderRadius: 14, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="id" size={17} color="rgba(255,255,255,0.6)" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>Ваш код клиента</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: 1.5 }}>{client?.client_code}</div>
            </div>
          </div>
          <span style={{ borderRadius: 8, padding: "7px 13px", fontSize: 11, color: "#fff", fontWeight: 600, background: copied ? "#10b981" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 5, transition: "background .2s" }}>
            <Icon name={copied ? "check" : "copy"} size={13} color="#fff" />
            {copied ? "Скопировано" : "Скопировать"}
          </span>
        </button>
      </div>

      {/* REFERRAL & DELIVERY */}
      <div style={{ padding: "12px 14px 0" }}>
        {[
          { iconName: "users", iconColor: "#005eaa", iconBg: "#eff6ff", title: "Реферальная программа",            sub: "Приглашайте друзей — зарабатывайте бонусы", href: "/dashboard/profile"   },
          { iconName: "truck", iconColor: "#10b981", iconBg: "#f0fdf4", title: "Доставка по городу и Кыргызстану", sub: "Быстро, надёжно, с отслеживанием",          href: "/dashboard/assistant" },
        ].map((row, i) => (
          <Link key={i} href={row.href} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 14, padding: "13px 15px", textDecoration: "none", marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: row.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={row.iconName} size={20} color={row.iconColor} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{row.title}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{row.sub}</div>
            </div>
            <Icon name="chevron_right" size={18} color="#d1d5db" />
          </Link>
        ))}
      </div>

      {/* NEWS */}
      <div style={{ padding: "4px 14px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#0a1e3d" }}>Новости и акции</span>
          <button style={{ fontSize: 12, color: "#005eaa", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Все ›</button>
        </div>
        <div style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 16, padding: "14px", display: "flex", gap: 12 }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="newspaper" size={26} color="#94a3b8" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0a1e3d", lineHeight: 1.4, marginBottom: 4 }}>Снижение цен на доставку с 1 июня</div>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5, marginBottom: 8 }}>Тарифы по Кыргызстану снижены на 15%</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#c4c9d4" }}>18 мая 2026</span>
              <span style={{ fontSize: 10, background: "#eff6ff", color: "#005eaa", padding: "3px 9px", borderRadius: 20, fontWeight: 700 }}>Акция</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}