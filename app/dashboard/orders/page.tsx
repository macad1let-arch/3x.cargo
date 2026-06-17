"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient, getShipments, Shipment, STATUS_MAP } from "@/lib/supabase-dashboard";

const TABS = [
  { key: "all",       label: "Все"        },
  { key: "china",     label: "В Китае"    },
  { key: "transit",   label: "В пути"     },
  { key: "sorting",   label: "Сортировка" },
  { key: "ready",     label: "К выдаче"   },
  { key: "completed", label: "Выдано"     },
];

function matchTab(status: string, tab: string): boolean {
  if (tab === "all")       return true;
  if (tab === "china")     return status === "china_warehouse" || status === "Поступила на склад в Китае";
  if (tab === "transit")   return status === "in_transit";
  if (tab === "sorting")   return status === "sorting" || status === "bishkek_arrived";
  if (tab === "ready")     return status === "ready_pickup";
  if (tab === "completed") return status === "completed";
  return false;
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: "#94a3b8", bg: "#f1f5f9", iconName: "box" };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.bg, borderRadius: 20, padding: "3px 10px" }}>
      <Icon name={s.iconName} size={11} color={s.color} />
      <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
    </div>
  );
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("status") ?? "all";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const client = await getClient(user.id);
      if (!client) { setLoading(false); return; }

      const data = await getShipments(client.client_code);
      setShipments(data);
      setLoading(false);

      channel = supabase
        .channel("shipments-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shipments",
            filter: `client_code=eq.${client.client_code}`,
          },
          async () => {
            const updated = await getShipments(client.client_code);
            setShipments(updated);
          }
        )
        .subscribe();
    }

    load();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const filtered = shipments.filter(s => {
    const matchesTab = matchTab(s.status, tab);
    const matchesSearch = search.trim() === "" || s.tracking_code.toLowerCase().includes(search.trim().toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 13, color: "#94a3b8" }}>Загрузка...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#fff", padding: "14px 20px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0a1e3d", marginBottom: 14 }}>Мои заказы</div>

        {/* SEARCH */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="search" size={16} color="#94a3b8" />
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по трек-коду..."
            style={{ width: "100%", boxSizing: "border-box", background: "#f4f6f9", border: "none", borderRadius: 12, padding: "10px 14px 10px 36px", fontSize: 13, color: "#0a1e3d", outline: "none" }}
          />
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {TABS.map(t => {
            const count = t.key === "all" ? shipments.length : shipments.filter(s => matchTab(s.status, t.key)).length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? "#005eaa" : "#f0f2f5", color: active ? "#fff" : "#64748b", display: "flex", alignItems: "center", gap: 5 }}
              >
                {t.label}
                {count > 0 && (
                  <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: active ? "#fff" : "#64748b", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIST */}
      <div style={{ padding: "12px 14px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="box" size={26} color="#cbd5e1" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0a1e3d", marginBottom: 6 }}>Заказов нет</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>По выбранному фильтру ничего не найдено</div>
          </div>
        ) : (
          filtered.map(s => {
            const info = STATUS_MAP[s.status] ?? { label: s.status, color: "#94a3b8", bg: "#f1f5f9", iconName: "box" };
            const date = new Date(s.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
            const amount = s.final_amount ?? s.delivery_cost ?? 0;
            const weight = s.chargeable_weight ?? s.weight ?? 0;

            return (
              <div key={s.id} style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 16, padding: "16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: info.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={info.iconName} size={18} color={info.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d", letterSpacing: 0.3 }}>{s.tracking_code}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{date}</div>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div style={{ height: 0.5, background: "#f0f2f5", margin: "0 0 10px" }} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Вес</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0a1e3d" }}>{weight} кг</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Стоимость</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0a1e3d" }}>
                      {amount > 0 ? `₸ ${amount.toLocaleString()}` : "—"}
                    </div>
                  </div>
                  {s.location && (
                    <div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2 }}>Локация</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", lineHeight: 1.3 }}>{s.location}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}