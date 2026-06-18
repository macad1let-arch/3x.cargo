"use client";
import { useState, useEffect, Suspense } from "react";
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

type TrackingEvent = {
  id: number;
  status: string;
  created_at: string;
  note: string | null;
  location: string | null;
};

function OrderCard({ s, isOpen, onToggle, supabase }: {
  s: Shipment;
  isOpen: boolean;
  onToggle: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
}) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const info = STATUS_MAP[s.status] ?? { label: s.status, color: "#94a3b8", bg: "#f1f5f9", iconName: "box" };
  const date = new Date(s.updated_at || s.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  const amount = s.final_amount ?? s.delivery_cost ?? 0;
  const weight = s.chargeable_weight ?? s.weight ?? 0;

  useEffect(() => {
  if (!isOpen || events.length > 0) return;
  setEventsLoading(true);
  supabase
    .from("tracking_events")
    .select("id, status, created_at, note, location")
    .eq("tracking_code", s.tracking_code)
    .order("created_at", { ascending: false })
    .then((result: { data: TrackingEvent[] | null }) => {
      setEvents((result.data as TrackingEvent[]) || []);
      setEventsLoading(false);
    });
}, [isOpen]);

  return (
    <div style={{ background: "#fff", border: "0.5px solid #e8edf2", borderRadius: 16, marginBottom: 10, overflow: "hidden" }}>
      {/* MAIN ROW */}
      <div style={{ padding: "16px" }}>
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

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <span style={{ fontSize: 12, color: "#94a3b8" }}>Вес:</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d" }}>{weight} кг</span>
  </div>
  {amount > 0 && (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>Стоимость:</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d" }}>{amount.toLocaleString()} сом</span>
    </div>
  )}
</div>

        {/* Toggle button */}
        <button onClick={onToggle} style={{ width: "100%", background: isOpen ? "#f0f2f5" : "#f8fafc", border: "none", borderRadius: 10, padding: "9px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>История статусов</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isOpen && <span style={{ fontSize: 11, color: "#94a3b8" }}>Закрыть</span>}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </button>
      </div>

      {/* ACCORDION */}
      {isOpen && (
        <div style={{ borderTop: "0.5px solid #f0f2f5", padding: "14px 16px" }}>
          {eventsLoading ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            </div>
          ) : events.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "10px 0" }}>История событий пуста</div>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 13, top: 8, bottom: 8, width: 1.5, background: "#e8edf2" }} />
              {events.map((e, i) => {
                const eInfo = STATUS_MAP[e.status] ?? { label: e.status, color: "#94a3b8", bg: "#f1f5f9", iconName: "box" };
                const eDate = new Date(e.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
                const eTime = new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={e.id} style={{ display: "flex", gap: 12, marginBottom: i < events.length - 1 ? 14 : 0, position: "relative" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? eInfo.color : "#f0f2f5", flexShrink: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
  <Icon name={eInfo.iconName} size={13} color={i === 0 ? "#fff" : "#94a3b8"} />
</div>
<div style={{ flex: 1, paddingTop: 1 }}>
  <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? eInfo.color : "#374151" }}>{eInfo.label}</div>
  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{eDate} · {eTime}</div>
</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
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
  const [openId, setOpenId] = useState<number | null>(null);

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
        .on("postgres_changes", { event: "*", schema: "public", table: "shipments", filter: `client_code=eq.${client.client_code}` },
          async () => {
            const updated = await getShipments(client.client_code);
            setShipments(updated);
          })
        .subscribe();
    }

    load();
    return () => { if (channel) supabase.removeChannel(channel); };
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
      <div style={{ background: "#fff", padding: "14px 20px 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0a1e3d", marginBottom: 14 }}>Мои заказы</div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="search" size={16} color="#94a3b8" />
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по трек-коду..."
            style={{ width: "100%", boxSizing: "border-box", background: "#f4f6f9", border: "none", borderRadius: 12, padding: "10px 14px 10px 36px", fontSize: 13, color: "#0a1e3d", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {TABS.map(t => {
            const count = t.key === "all" ? shipments.length : shipments.filter(s => matchTab(s.status, t.key)).length;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? "#005eaa" : "#f0f2f5", color: active ? "#fff" : "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
                {t.label}
                {count > 0 && <span style={{ background: active ? "rgba(255,255,255,0.25)" : "#e2e8f0", color: active ? "#fff" : "#64748b", borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

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
          filtered.map(s => (
            <OrderCard
              key={s.id}
              s={s}
              isOpen={openId === s.id}
              onToggle={() => setOpenId(openId === s.id ? null : s.id)}
              supabase={supabase}
            />
          ))
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
      <OrdersContent />
    </Suspense>
  );
}