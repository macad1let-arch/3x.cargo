"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ChevronDown,
  Clock3,
  PackageOpen,
  Search,
  Weight,
  WalletCards,
  X,
} from "lucide-react";
import { Icon } from "@/lib/dashboard";
import {
  getClient,
  getShipments,
  STATUS_MAP,
  type Shipment,
} from "@/lib/supabase-dashboard";

const tabs = [
  { key: "all", label: "Все" },
  { key: "china", label: "В Китае" },
  { key: "transit", label: "В пути" },
  { key: "ready", label: "Готово к выдаче" },
  { key: "completed", label: "Выдано" },
];

type TrackingEvent = {
  id: number;
  status: string;
  created_at: string;
  note: string | null;
  location: string | null;
};

function matchesTab(status: string, tab: string) {
  if (tab === "all") return true;
  if (tab === "china") {
    return (
      status === "china_warehouse" ||
      status === "Поступила на склад в Китае"
    );
  }
  if (tab === "transit") return status === "in_transit";
  if (tab === "ready") return status === "ready_pickup";
  if (tab === "completed") return status === "completed";
  return false;
}

function statusInfo(status: string) {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      color: "#64748B",
      bg: "#F1F5F9",
      iconName: "box",
    }
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const info = statusInfo(status);

  return (
    <span
      className="inline-flex max-w-[145px] items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ background: info.bg, color: info.color }}
    >
      <Icon name={info.iconName} size={13} color={info.color} />
      <span className="truncate text-[11px] font-semibold leading-4">
        {info.label}
      </span>
    </span>
  );
}

function OrderCard({
  shipment,
  open,
  onToggle,
  supabase,
}: {
  shipment: Shipment;
  open: boolean;
  onToggle: () => void;
  supabase: ReturnType<typeof createBrowserClient>;
}) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const info = statusInfo(shipment.status);
  const date = formatDate(shipment.updated_at || shipment.created_at);
  const amount = Number(
    shipment.final_amount ?? shipment.delivery_cost ?? 0,
  );
  const weight = Number(
    shipment.chargeable_weight ?? shipment.weight ?? 0,
  );

  useEffect(() => {
    if (!open || eventsLoaded) return;

    let active = true;
    setEventsLoading(true);

    async function loadEvents() {
      const result = await supabase
        .from("tracking_events")
        .select("id, status, created_at, note, location")
        .eq("tracking_code", shipment.tracking_code)
        .order("created_at", { ascending: false });

      if (!active) return;

      const trackingEvents =
        (result.data as unknown as TrackingEvent[] | null) ?? [];

      setEvents(trackingEvents);
      setEventsLoaded(true);
      setEventsLoading(false);
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, [open, eventsLoaded, shipment.tracking_code, supabase]);

  return (
    <article className="overflow-hidden rounded-[18px] border border-[#DCE5F3] bg-white">
      <div className="px-4 pb-3.5 pt-4">
        <div className="flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px]"
            style={{ background: info.bg }}
          >
            <Icon name={info.iconName} size={21} color={info.color} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-5 tracking-[0.1px]">
              {shipment.tracking_code}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-4 text-[#71809A]">
              <Clock3 size={12} strokeWidth={1.8} />
              Обновлено {date}
            </p>
          </div>

          <StatusBadge status={shipment.status} />
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <InfoCell
            icon={<Weight size={17} strokeWidth={1.8} />}
            label="Вес"
            value={weight > 0 ? `${weight} кг` : "Уточняется"}
          />
          <InfoCell
            icon={<WalletCards size={17} strokeWidth={1.8} />}
            label="К оплате"
            value={amount > 0 ? `${amount.toLocaleString("ru-RU")} сом` : "—"}
          />
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={[
            "mt-3 flex h-11 w-full items-center justify-between rounded-[13px]",
            "px-3.5 text-[13px] font-semibold transition",
            open
              ? "bg-[#EDF3FF] text-[#1744A7]"
              : "bg-[#F7F9FD] text-[#5F708A] active:bg-[#F0F4FA]",
          ].join(" ")}
          aria-expanded={open}
        >
          <span>История статусов</span>
          <ChevronDown
            size={18}
            strokeWidth={1.9}
            className={[
              "transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-[#E9EDF4] bg-[#FBFCFE] px-4 py-4">
          {eventsLoading ? (
            <div className="grid min-h-20 place-items-center">
              <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#E2E8F2] border-t-[#1744A7]" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-[13px] font-medium text-[#71809A]">
                История пока не добавлена
              </p>
            </div>
          ) : (
            <div>
              {events.map((event, index) => {
                const eventInfo = statusInfo(event.status);
                const current = index === 0;
                const eventDate = new Date(event.created_at);

                return (
                  <div
                    key={event.id}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {index !== events.length - 1 && (
                      <span className="absolute bottom-0 left-[13px] top-7 w-px bg-[#DDE5F0]" />
                    )}

                    <span
                      className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[#FBFCFE]"
                      style={{
                        background: current ? eventInfo.color : "#E7ECF3",
                      }}
                    >
                      <Icon
                        name={eventInfo.iconName}
                        size={13}
                        color={current ? "#FFFFFF" : "#8390A5"}
                      />
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className="text-[13px] font-semibold leading-4"
                        style={{
                          color: current ? eventInfo.color : "#36445A",
                        }}
                      >
                        {eventInfo.label}
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-[#71809A]">
                        {eventDate.toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })}
                        {" · "}
                        {eventDate.toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                      {event.note && (
                        <p className="mt-1 text-[12px] leading-[17px] text-[#5F708A]">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-[13px] bg-[#F7F9FD] px-3 py-2.5">
      <span className="shrink-0 text-[#1744A7]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium leading-3.5 text-[#71809A]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[12px] font-semibold leading-4">
          {value}
        </p>
      </div>
    </div>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("status") || "all";
  const initialTab = tabs.some((item) => item.key === requestedTab)
    ? requestedTab
    : "all";

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<Shipment["id"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;
      if (!user) {
        setLoading(false);
        return;
      }

      const client = await getClient(user.id);

      if (cancelled) return;
      if (!client) {
        setLoading(false);
        return;
      }

      const currentShipments = await getShipments(client.client_code);

      if (cancelled) return;
      setShipments(currentShipments);
      setLoading(false);

      const channelName = `shipments-${client.client_code}-${crypto.randomUUID()}`;

      channel = supabase
        .channel(channelName)
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
            if (!cancelled) setShipments(updated);
          },
        )
        .subscribe();
    }

    load();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = shipments.filter(
    (shipment) =>
      matchesTab(shipment.status, tab) &&
      (!normalizedSearch ||
        shipment.tracking_code.toLowerCase().includes(normalizedSearch)),
  );

  if (loading) {
    return <OrdersLoader />;
  }

  return (
    <div className="min-h-full bg-white px-5 pb-7 pt-6 text-[#0A1E3D]">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.45px]">
            Мои заказы
          </h1>
          <p className="mt-1 text-[13px] leading-[18px] text-[#71809A]">
            Все ваши посылки в одном месте
          </p>
        </div>

        <span className="rounded-full bg-[#EDF3FF] px-3 py-1.5 text-[12px] font-semibold text-[#1744A7]">
          {shipments.length}
        </span>
      </header>

      <div className="relative mt-5">
        <Search
          size={20}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7890B2]"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Введите трек-код"
          className={[
            "h-[52px] w-full rounded-[16px] border border-[#DCE4EF] bg-white",
            "pl-12 pr-12 text-[16px] font-medium text-[#0A1E3D] outline-none",
            "placeholder:font-normal placeholder:text-[#9AA6B8]",
            "transition focus:border-[#6F94E8] focus:ring-2 focus:ring-[#EAF0FF]",
          ].join(" ")}
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[12px] text-[#71809A] active:bg-[#F1F4F9]"
            aria-label="Очистить поиск"
          >
            <X size={18} strokeWidth={1.9} />
          </button>
        )}
      </div>

      <div className="-mx-5 mt-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {tabs.map((item) => {
            const active = tab === item.key;
            const count =
              item.key === "all"
                ? shipments.length
                : shipments.filter((shipment) =>
                    matchesTab(shipment.status, item.key),
                  ).length;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key);
                  setOpenId(null);
                }}
                className={[
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5",
                  "text-[12px] font-semibold transition",
                  active
                    ? "bg-[#1744A7] text-white"
                    : "bg-[#F1F4F9] text-[#5F708A]",
                ].join(" ")}
              >
                {item.label}
                {count > 0 && (
                  <span
                    className={[
                      "min-w-[18px] rounded-full px-1.5 text-[10px] leading-[18px]",
                      active
                        ? "bg-white/[0.18] text-white"
                        : "bg-white text-[#71809A]",
                    ].join(" ")}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[#F1F4F9] text-[#8B98AC]">
              <PackageOpen size={27} strokeWidth={1.7} />
            </span>
            <h2 className="mt-4 text-[16px] font-semibold">
              {search ? "Ничего не найдено" : "Заказов пока нет"}
            </h2>
            <p className="mt-1.5 max-w-[260px] text-[13px] leading-[18px] text-[#71809A]">
              {search
                ? "Проверьте трек-код или очистите строку поиска"
                : "Когда посылка поступит на склад, она появится здесь"}
            </p>
          </div>
        ) : (
          filtered.map((shipment) => (
            <OrderCard
              key={shipment.id}
              shipment={shipment}
              open={openId === shipment.id}
              onToggle={() =>
                setOpenId(openId === shipment.id ? null : shipment.id)
              }
              supabase={supabase}
            />
          ))
        )}
      </section>
    </div>
  );
}

function OrdersLoader() {
  return (
    <div className="grid min-h-[70dvh] place-items-center bg-white">
      <div className="text-center">
        <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-[3px] border-[#E7EDF7] border-t-[#1744A7]" />
        <p className="mt-3 text-[13px] font-medium text-[#71809A]">
          Загружаем заказы
        </p>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoader />}>
      <OrdersContent />
    </Suspense>
  );
}