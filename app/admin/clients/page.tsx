"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
  client_code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  street: string | null;
  house: string | null;
  pickup_point: string | null;
  telegram_username: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string | null;
};

type Shipment = {
  id: number;
  client_code: string;
  status: string | null;
  weight: number | null;
  created_at: string;
};

const activeStatuses = [
  "china_warehouse",
  "in_transit",
  "bishkek_arrived",
  "sorting",
  "ready_pickup",
  "problem",
];

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
const [clientTab, setClientTab] = useState("all");
const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientsError) {
      console.error(clientsError);
    }

    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from("shipments")
      .select("id, client_code, status, weight, created_at");

    if (shipmentsError) {
      console.error(shipmentsError);
    }

    setClients(clientsData || []);
    setShipments(shipmentsData || []);
    setLoading(false);
  };
  

  useEffect(() => {
    loadData();
  }, []);

  const clientsWithStats = useMemo(() => {
  return clients.map((client) => {
    const clientShipments = shipments.filter(
      (item) => item.client_code === client.client_code
    );

    const activeCount = clientShipments.filter((item) =>
      activeStatuses.includes(item.status || "")
    ).length;

    const completedCount = clientShipments.filter(
      (item) => item.status === "completed"
    ).length;

    const totalWeight = clientShipments.reduce(
      (sum, item) => sum + (item.weight || 0),
      0
    );

    const lastShipmentDate = clientShipments
      .map((item) => item.created_at)
      .sort()
      .reverse()[0];

    const daysSinceLastShipment = lastShipmentDate
      ? Math.floor(
          (Date.now() - new Date(lastShipmentDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    let segment = "new";

    if (totalWeight >= 100) {
      segment = "vip";
    } else if (clientShipments.length === 0) {
      segment = "new";
    } else if (daysSinceLastShipment !== null && daysSinceLastShipment <= 30) {
      segment = "active";
    } else {
      segment = "inactive";
    }

    return {
      ...client,
      totalShipments: clientShipments.length,
      activeCount,
      completedCount,
      totalWeight,
      lastShipmentDate,
      daysSinceLastShipment,
      segment,
    };
  });
}, [clients, shipments]);

  const filteredClients = useMemo(() => {
  const q = search.trim().toLowerCase();

  return clientsWithStats.filter((client) => {
    const fullName = `${client.first_name || ""} ${client.last_name || ""}`;
    const fullAddress = `${client.city || ""} ${client.street || ""} ${
      client.house || ""
    } ${client.pickup_point || ""}`;

    const matchesSearch =
      !q ||
      client.client_code?.toLowerCase().includes(q) ||
      client.first_name?.toLowerCase().includes(q) ||
      client.last_name?.toLowerCase().includes(q) ||
      fullName.toLowerCase().includes(q) ||
      client.phone?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      client.telegram_username?.toLowerCase().includes(q) ||
      client.city?.toLowerCase().includes(q) ||
      client.street?.toLowerCase().includes(q) ||
      client.house?.toLowerCase().includes(q) ||
      client.pickup_point?.toLowerCase().includes(q) ||
      client.client_note?.toLowerCase().includes(q) ||
      fullAddress.toLowerCase().includes(q) ||
      String(client.totalShipments).includes(q) ||
      String(client.totalWeight).includes(q);

    if (!matchesSearch) return false;

    switch (clientTab) {
      case "new":
        return client.segment === "new";

      case "active":
        return client.segment === "active";

      case "vip":
        return client.segment === "vip";

      case "inactive":
        return client.segment === "inactive";

      case "notes":
        return Boolean(client.client_note?.trim());

      default:
        return true;
    }
  });
}, [clientsWithStats, search, clientTab]);

  const totalClients = clients.length;
  const activeClients = clientsWithStats.filter(
    (client) => client.activeCount > 0
  ).length;
  const clientsWithPackages = clientsWithStats.filter(
    (client) => client.totalShipments > 0
  ).length;

  const vipClients = clientsWithStats.filter(
  (client) => client.segment === "vip"
).length;

const inactiveClients = clientsWithStats.filter(
  (client) => client.segment === "inactive"
).length;

const clientsWithNotes = clientsWithStats.filter(
  (client) => client.client_note?.trim()
).length;

const getSegmentDotClass = (segment: string) => {
  switch (segment) {
    case "new":
      return "bg-blue-500";
    case "active":
      return "bg-green-500";
    case "vip":
      return "bg-purple-500";
    case "inactive":
      return "bg-slate-400";
    default:
      return "bg-slate-300";
  }
};

const getSegmentLabel = (segment: string) => {
  switch (segment) {
    case "new":
      return "Новый";
    case "active":
      return "Активный";
    case "vip":
      return "VIP";
    case "inactive":
      return "Неактивный";
    default:
      return "Без сегмента";
  }
};

const clientTabs = [
  { key: "all", label: "Все", dot: "bg-slate-400" },
  { key: "new", label: "Новые", dot: "bg-blue-500" },
  { key: "active", label: "Активные", dot: "bg-green-500" },
  { key: "vip", label: "VIP", dot: "bg-purple-500" },
  { key: "inactive", label: "Неактивные", dot: "bg-slate-400" },
  { key: "notes", label: "С заметкой", dot: "bg-yellow-400" },
];

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-8 text-slate-900">
  <div className="mx-auto w-full max-w-[1780px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Клиенты</h1>
            <p className="mt-2 text-slate-600">
              Полная база клиентов, контакты, адреса и активность.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
          >
            ← Назад в CRM
          </Link>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего клиентов</p>
            <p className="mt-2 text-3xl font-bold">{totalClients}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Активные клиенты</p>
            <p className="mt-2 text-3xl font-bold">{activeClients}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">С посылками</p>
            <p className="mt-2 text-3xl font-bold">{clientsWithPackages}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего посылок</p>
            <p className="mt-2 text-3xl font-bold">{shipments.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
  <p className="text-sm text-slate-500">VIP</p>
  <p className="mt-2 text-3xl font-bold">{vipClients}</p>
</div>

<div className="rounded-3xl bg-white p-5 shadow-sm">
  <p className="text-sm text-slate-500">С заметкой</p>
  <p className="mt-2 text-3xl font-bold">{clientsWithNotes}</p>
</div>
        </section>

        <section className="mt-6 w-full rounded-3xl bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
    <div>
      <h2 className="text-2xl font-bold">База клиентов</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {clientTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setClientTab(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              clientTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                clientTab === tab.key ? "bg-white" : tab.dot
              }`}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="flex w-full flex-col gap-3 xl:max-w-[620px] xl:items-end">
      <input
        placeholder="Поиск: код, имя, телефон, email, telegram, город, адрес, заметка"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-600"
      />

      <Link
        href="/admin/comments/clients"
        className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Заметки клиентов
      </Link>
    </div>
  </div>

  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
    Показано: <strong>{filteredClients.length}</strong> клиентов
  </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
  <table className="w-full table-fixed border-collapse text-[14px]">
                <thead className="bg-slate-50">
  <tr className="border-b text-left text-slate-500">
    <th className="w-[105px] px-3 py-4 font-semibold">Код</th>
    <th className="w-[165px] px-3 py-4 font-semibold">Клиент</th>
    <th className="w-[135px] px-3 py-4 font-semibold">Телефон</th>
    <th className="w-[180px] px-3 py-4 font-semibold">Email</th>
    <th className="w-[130px] px-3 py-4 font-semibold">Telegram</th>
    <th className="w-[210px] px-3 py-4 font-semibold">Адрес</th>
    <th className="w-[150px] px-3 py-4 font-semibold">Пункт выдачи</th>
    <th className="w-[75px] px-3 py-4 text-center font-semibold">Посылки</th>
    <th className="w-[85px] px-3 py-4 text-center font-semibold">Активные</th>
    <th className="w-[90px] px-3 py-4 text-center font-semibold">Вес</th>
    <th className="w-[115px] px-3 py-4 text-center font-semibold">Регистрация</th>
    <th className="w-[110px] px-3 py-4 text-right font-semibold">Действие</th>
  </tr>
</thead>

                <tbody>
                  {filteredClients.map((client) => (
                    <tr
  key={client.id}
  className={`border-b border-slate-200 transition hover:bg-slate-50 ${
    client.client_note ? "bg-yellow-50/40" : "bg-white"
  }`}
>
  {/* Код */}
  <td className="px-3 py-4 align-middle">
  <div className="flex items-center gap-2 whitespace-nowrap">
    <Link
      href={`/admin/clients/${client.client_code}`}
      className="font-bold text-blue-600 hover:underline"
    >
      {client.client_code}
    </Link>

    <span
      title={getSegmentLabel(client.segment)}
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${getSegmentDotClass(
        client.segment
      )}`}
    />
  </div>
</td>

  <td className="px-3 py-4 align-middle">
  <div className="break-words leading-5 font-medium">
    {client.first_name || "-"} {client.last_name || ""}
  </div>
</td>

<td className="px-3 py-4 align-middle whitespace-nowrap">
  {client.phone || "-"}
</td>

<td className="px-3 py-4 align-middle">
  <div className="break-words leading-5">{client.email || "-"}</div>
</td>

<td className="px-3 py-4 align-middle">
  <div className="break-words leading-5">
    {client.telegram_username || "-"}
  </div>
</td>

<td className="px-3 py-4 align-middle">
  <div className="break-words leading-5">
    {[client.city, client.street, client.house].filter(Boolean).join(", ") ||
      "-"}
  </div>
</td>

<td className="px-3 py-4 align-middle">
  <div className="break-words leading-5">{client.pickup_point || "-"}</div>
</td>

<td className="px-3 py-4 text-center align-middle">
  {client.totalShipments}
</td>

<td className="px-3 py-4 text-center align-middle">
  {client.activeCount}
</td>

<td className="px-3 py-4 text-center align-middle whitespace-nowrap">
  {client.totalWeight.toFixed(2)} кг
</td>

<td className="px-3 py-4 text-center align-middle whitespace-nowrap">
  {client.created_at
    ? new Date(client.created_at).toLocaleDateString("ru-RU")
    : "-"}
</td>

<td className="px-3 py-4 text-right align-middle">
  <Link
    href={`/admin/clients/${client.client_code}`}
    className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Открыть
  </Link>
</td>
</tr>
))}
                </tbody>
              </table>

              {filteredClients.length === 0 && (
                <p className="mt-5 text-slate-500">Клиенты не найдены.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}