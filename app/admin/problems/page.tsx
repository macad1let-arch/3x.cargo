"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: number;
  client_code: string;
  tracking_code: string;
  batch_code: string | null;
  status: string | null;
  location: string | null;
  weight: number | null;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};

type Client = {
  id: number;
  client_code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  telegram_username: string | null;
  client_note: string | null;
  created_at: string;
  updated_at: string | null;
};

const statusMap: Record<string, string> = {
  china_warehouse: "🟡 На складе в Китае",
  in_transit: "🔵 В пути",
  bishkek_arrived: "🟢 В Бишкеке",
  sorting: "🟣 На сортировке",
  ready_pickup: "📦 Готов к выдаче",
  completed: "✅ Выдано",
  problem: "🔴 Проблема",
};

export default function AdminProblemsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const loadProblems = async () => {
    setLoading(true);

    const { data: shipmentData, error: shipmentError } = await supabase
      .from("shipments")
      .select("*")
      .eq("status", "problem")
      .order("updated_at", { ascending: false });

    if (shipmentError) {
      console.error(shipmentError);
      setShipments([]);
    } else {
      setShipments(shipmentData || []);
    }

    const { data: clientsData, error: clientsError } = await supabase
      .from("clients")
      .select("*");

    if (clientsError) {
      console.error(clientsError);
      setClients([]);
    } else {
      setClients(clientsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const problemClientCodes = useMemo(() => {
    return Array.from(
      new Set(
        shipments
          .map((item) => item.client_code)
          .filter((code) => code && code !== "unknown")
      )
    );
  }, [shipments]);

  const problemClients = useMemo(() => {
    return clients.filter((client) =>
      problemClientCodes.includes(client.client_code)
    );
  }, [clients, problemClientCodes]);

  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = shipments.filter((item) => {
      const matchesSearch =
        !q ||
        item.tracking_code?.toLowerCase().includes(q) ||
        item.client_code?.toLowerCase().includes(q) ||
        item.batch_code?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      switch (activeTab) {
        case "shipments":
          return true;

        case "clients":
          return false;

        case "comments":
          return Boolean(item.note?.trim());

        case "unknown":
          return item.client_code === "unknown";

        default:
          return true;
      }
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sort === "oldest") return dateA - dateB;

      return dateB - dateA;
    });
  }, [shipments, search, activeTab, sort]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (activeTab === "shipments" || activeTab === "unknown") return [];

    const filtered = problemClients.filter((client) => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`;

      const matchesSearch =
        !q ||
        client.client_code?.toLowerCase().includes(q) ||
        fullName.toLowerCase().includes(q) ||
        client.phone?.toLowerCase().includes(q) ||
        client.email?.toLowerCase().includes(q) ||
        client.telegram_username?.toLowerCase().includes(q) ||
        client.client_note?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeTab === "comments") {
        return Boolean(client.client_note?.trim());
      }

      return true;
    });

    return filtered;
  }, [problemClients, search, activeTab]);

  const unknownProblems = shipments.filter(
    (item) => item.client_code === "unknown"
  ).length;

  const withComments = shipments.filter((item) => item.note?.trim()).length;

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
          >
            ← В CRM
          </Link>

          <Link
            href="/admin/unknown"
            className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
          >
            Неизвестные →
          </Link>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl font-bold">Проблемы</h1>
          <p className="mt-2 text-slate-600">
            Центр контроля всех проблемных посылок и клиентов.
          </p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемных посылок</p>
            <p className="mt-2 text-3xl font-bold">{shipments.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемных клиентов</p>
            <p className="mt-2 text-3xl font-bold">{problemClients.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unknown</p>
            <p className="mt-2 text-3xl font-bold">{unknownProblems}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">С комментарием</p>
            <p className="mt-2 text-3xl font-bold">{withComments}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Список проблем</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["all", "Все"],
                  ["shipments", "Посылки"],
                  ["clients", "Клиенты"],
                  ["comments", "С комментарием"],
                  ["unknown", "Unknown"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      activeTab === key
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-[620px] xl:items-end">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск: трек, клиент, партия, телефон, комментарий..."
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-red-600"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 w-fit rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none focus:border-red-600"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Показано:{" "}
            <strong>{filteredShipments.length + filteredClients.length}</strong>{" "}
            записей
          </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 space-y-5">
              {filteredClients.length > 0 && (
                <div className="rounded-2xl border border-slate-200">
                  <div className="border-b bg-slate-50 px-4 py-3">
                    <h3 className="font-bold">Проблемные клиенты</h3>
                  </div>

                  <div className="divide-y">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="font-bold text-blue-600">
                            {client.client_code}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {client.first_name || "-"} {client.last_name || ""}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              Телефон: {client.phone || "-"}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              Telegram: {client.telegram_username || "-"}
                            </span>
                          </div>

                          {client.client_note && (
                            <p className="mt-2 rounded-xl bg-yellow-50 p-3 text-sm text-slate-700">
                              💬 {client.client_note}
                            </p>
                          )}
                        </div>

                        <Link
                          href={`/admin/clients/${client.client_code}`}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
                        >
                          Открыть клиента
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredShipments.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b bg-slate-50 px-4 py-3">
                    <h3 className="font-bold">Проблемные посылки</h3>
                  </div>

                  <table className="w-full table-fixed border-collapse text-[14px]">
                    <thead className="bg-slate-50">
                      <tr className="border-b text-left text-slate-500">
                        <th className="w-[190px] px-3 py-4 font-semibold">
                          Трек
                        </th>
                        <th className="w-[110px] px-3 py-4 font-semibold">
                          Клиент
                        </th>
                        <th className="w-[110px] px-3 py-4 font-semibold">
                          Партия
                        </th>
                        <th className="w-[140px] px-3 py-4 font-semibold">
                          Локация
                        </th>
                        <th className="w-[80px] px-3 py-4 text-center font-semibold">
                          Вес
                        </th>
                        <th className="w-[130px] px-3 py-4 text-center font-semibold">
                          Обновлено
                        </th>
                        <th className="w-[190px] px-3 py-4 text-right font-semibold">
                          Действие
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredShipments.map((item) => (
                        <tr
                          key={item.id}
                          className={`border-b border-slate-200 transition hover:bg-slate-50 ${
                            item.note ? "bg-yellow-50/40" : "bg-white"
                          }`}
                        >
                          <td className="px-3 py-4 align-middle">
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/admin/shipments/${item.tracking_code}`}
                                className="break-all font-bold text-blue-600 hover:underline"
                              >
                                {item.tracking_code}
                              </Link>

                              {item.note && (
                                <span className="w-fit rounded-full bg-yellow-100 px-2 py-1 text-[11px] font-semibold text-yellow-700">
                                  💬 Комментарий
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-4 align-middle">
                            {item.client_code === "unknown" ? (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                unknown
                              </span>
                            ) : (
                              <Link
                                href={`/admin/clients/${item.client_code}`}
                                className="font-semibold text-blue-600 hover:underline"
                              >
                                {item.client_code}
                              </Link>
                            )}
                          </td>

                          <td className="px-3 py-4 align-middle">
                            {item.batch_code ? (
                              <Link
                                href={`/admin/batches/${item.batch_code}`}
                                className="font-semibold text-blue-600 hover:underline"
                              >
                                {item.batch_code}
                              </Link>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-3 py-4 align-middle">
                            {item.location || "-"}
                          </td>

                          <td className="px-3 py-4 text-center align-middle whitespace-nowrap">
                            {item.weight ? `${item.weight} кг` : "-"}
                          </td>

                          <td className="px-3 py-4 text-center align-middle whitespace-nowrap">
                            {item.updated_at ? (
                              <div className="leading-tight">
                                <p>
                                  {new Date(item.updated_at).toLocaleDateString(
                                    "ru-RU"
                                  )}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {new Date(
                                    item.updated_at
                                  ).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="px-3 py-4 text-right align-middle">
                            <div className="flex justify-end gap-2">
                              {item.client_code !== "unknown" && (
                                <Link
                                  href={`/admin/clients/${item.client_code}`}
                                  className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                                >
                                  Клиент
                                </Link>
                              )}

                              <Link
                                href={`/admin/shipments/${item.tracking_code}`}
                                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Открыть
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filteredShipments.length === 0 && filteredClients.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-5 text-slate-500">
                  Проблемы не найдены.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}