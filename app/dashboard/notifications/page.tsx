"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient } from "@/lib/supabase-dashboard";

type Notification = {
  id: number;
  title: string;
  message: string;
  channel: string;
  status: string;
  created_at: string;
  tracking_code: string | null;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  if (h < 24) return `${h} ч назад`;
  if (d < 7) return `${d} дн назад`;
  return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function channelMeta(channel: string) {
  switch (channel) {
    case "telegram": return { iconName: "message", color: "#0088cc", bg: "#e0f2fe", label: "Telegram" };
    case "whatsapp": return { iconName: "message", color: "#25d366", bg: "#dcfce7", label: "WhatsApp" };
    case "email":    return { iconName: "mail",    color: "#8b5cf6", bg: "#f5f3ff", label: "Email"    };
    case "sms":      return { iconName: "phone",   color: "#f97316", bg: "#fff7ed", label: "SMS"      };
    default:         return { iconName: "bell",    color: "#005eaa", bg: "#eff6ff", label: "Система"  };
  }
}

export default function NotificationsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const client = await getClient(user.id);
      if (!client) { setLoading(false); return; }

      const { data } = await supabase
        .from("client_notifications")
        .select("id, title, message, channel, status, created_at, tracking_code")
        .eq("client_code", client.client_code)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setNotifs(data);
      setLoading(false);
    }
    load();
  }, []);

  const filters = [
    { key: "all",      label: "Все"      },
    { key: "system",   label: "Система"  },
    { key: "telegram", label: "Telegram" },
    { key: "email",    label: "Email"    },
  ];

  const filtered = filter === "all" ? notifs : notifs.filter(n => n.channel === filter);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Загрузка...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", padding: "12px 20px 0", borderBottom: "0.5px solid #e8edf2" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#0a1e3d", marginBottom: 12 }}>
          Уведомления
          {notifs.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 13, background: "#005eaa", color: "#fff", borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>
              {notifs.length}
            </span>
          )}
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {filters.map(f => {
            const count = f.key === "all" ? notifs.length : notifs.filter(n => n.channel === f.key).length;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12,
                cursor: "pointer", whiteSpace: "nowrap", fontWeight: filter === f.key ? 600 : 400,
                border: filter === f.key ? "0.5px solid #005eaa" : "0.5px solid #e2e8f0",
                background: filter === f.key ? "#eff6ff" : "#fff",
                color: filter === f.key ? "#005eaa" : "#64748b",
              }}>
                {f.label}
                {count > 0 && (
                  <span style={{ marginLeft: 5, background: filter === f.key ? "#005eaa" : "#e2e8f0", color: filter === f.key ? "#fff" : "#64748b", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      <div style={{ padding: "12px 14px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff", border: "0.5px solid #e8edf2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Icon name="bell" size={26} color="#c4c9d4" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0a1e3d", marginBottom: 4 }}>Уведомлений нет</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Здесь будут появляться все уведомления</div>
          </div>
        ) : (
          filtered.map((n) => {
            const ch = channelMeta(n.channel);
            const isNew = n.status === "queued" || n.status === "sent";
            return (
              <div key={n.id} style={{
                background: "#fff", borderRadius: 14,
                border: isNew ? "0.5px solid #bfdbfe" : "0.5px solid #e8edf2",
                padding: "14px", marginBottom: 8,
                display: "flex", gap: 12, alignItems: "flex-start",
                position: "relative",
              }}>
                {isNew && (
                  <div style={{ position: "absolute", top: 14, right: 14, width: 8, height: 8, background: "#005eaa", borderRadius: "50%" }} />
                )}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: ch.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={ch.iconName} size={20} color={ch.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d", lineHeight: 1.3, flex: 1, paddingRight: 20 }}>
                      {n.title || "Уведомление"}
                    </div>
                    <div style={{ fontSize: 10, color: "#c4c9d4", flexShrink: 0 }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                  {n.message && (
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 6 }}>
                      {n.message}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {n.tracking_code && (
                      <span style={{ fontSize: 10, background: "#f0f4f8", color: "#005eaa", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                        {n.tracking_code}
                      </span>
                    )}
                    <span style={{ fontSize: 10, color: "#c4c9d4" }}>{ch.label}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}