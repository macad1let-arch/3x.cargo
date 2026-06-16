"use client";
export const dynamic = 'force-dynamic';

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

const statusOptions = [
  { value: "all", label: "Все" },
  { value: "china_warehouse", label: "🟡 На складе в Китае" },
  { value: "in_transit", label: "🔵 В пути" },
  { value: "bishkek_arrived", label: "🟢 В Бишкеке" },
  { value: "sorting", label: "🟣 На сортировке" },
  { value: "ready_pickup", label: "📦 Готов к выдаче" },
  { value: "completed", label: "✅ Выдано" },
  { value: "problem", label: "🔴 Проблема" },
];

const statusMap: Record<string, string> = {
  china_warehouse: "🟡 На складе в Китае",
  in_transit: "🔵 В пути",
  bishkek_arrived: "🟢 В Бишкеке",
  sorting: "🟣 На сортировке",
  ready_pickup: "📦 Готов к выдаче",
  completed: "✅ Выдано",
  problem: "🔴 Проблема",
};

export default function UnknownShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadShipments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("client_code", "unknown")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMsg("Ошибка загрузки неизвестных посылок.");
      setShipments([]);
    } else {
      setShipments(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = shipments.filter((item) => {
      const matchesSearch =
        !q ||
        item.tracking_code?.toLowerCase().includes(q) ||
        item.batch_code?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter !== "all") {
        return item.status === statusFilter;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sort === "oldest") return dateA - dateB;

      return dateB - dateA;
    });
  }, [shipments, search, statusFilter, sort]);

  const totalWeight = filteredShipments.reduce(
    (sum, item) => sum + (item.weight || 0),
    0
  );

  const withComments = shipments.filter((item) => item.note?.trim()).length;

  const assignClientToShipment = async (shipment: Shipment) => {
    const clientCode = prompt("Введите код клиента, например 3X-4198");

    if (!clientCode) return;

    const normalizedClientCode = clientCode.trim();

    const { error } = await supabase
      .from("shipments")
      .update({
        client_code: normalizedClientCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shipment.id);

    if (error) {
      console.error(error);
      setMsg("Ошибка привязки клиента.");
      return;
    }

    await supabase.from("tracking_events").insert([
      {
        shipment_id: shipment.id,
        tracking_code: shipment.tracking_code,
        client_code: normalizedClientCode,
        batch_code: shipment.batch_code || null,
        status: shipment.status || "",
        location: shipment.location || "",
        note: "Посылка привязана к клиенту из раздела неизвестных",
      },
    ]);

    setMsg(`Посылка ${shipment.tracking_code} привязана к ${normalizedClientCode}.`);
    await loadShipments();
  };

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
            href="/admin/clients"
            className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
          >
            Клиенты →
          </Link>
        </div>

        <div className="mt-6">
          <h1 className="text-3xl font-bold">Неизвестные посылки</h1>
          <p className="mt-2 text-slate-600">
            Посылки без привязанного клиента. Здесь их нужно быстро найти и прикрепить к клиенту.
          </p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего неизвестных</p>
            <p className="mt-2 text-3xl font-bold">{shipments.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Показано</p>
            <p className="mt-2 text-3xl font-bold">{filteredShipments.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Общий вес</p>
            <p className="mt-2 text-3xl font-bold">{totalWeight.toFixed(2)} кг</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">С комментарием</p>
            <p className="mt-2 text-3xl font-bold">{withComments}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Список неизвестных посылок</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      statusFilter === status.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:max-w-[620px] xl:items-end">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск: трек, партия, статус, комментарий..."
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-sm outline-none focus:border-blue-600"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 w-fit rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-600"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Показано: <strong>{filteredShipments.length}</strong> посылок
          </div>

          {msg && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
              {msg}
            </div>
          )}

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full table-fixed border-collapse text-[14px]">
                <thead className="bg-slate-50">
                  <tr className="border-b text-left text-slate-500">
                    <th className="w-[190px] px-3 py-4 font-semibold">Трек</th>
                    <th className="w-[110px] px-3 py-4 font-semibold">Партия</th>
                    <th className="w-[160px] px-3 py-4 font-semibold">Статус</th>
                    <th className="w-[120px] px-3 py-4 font-semibold">Локация</th>
                    <th className="w-[80px] px-3 py-4 text-center font-semibold">Вес</th>
                    <th className="w-[130px] px-3 py-4 text-center font-semibold">Добавлено</th>
                    <th className="w-[130px] px-3 py-4 text-center font-semibold">Обновлено</th>
                    <th className="w-[170px] px-3 py-4 text-right font-semibold">Действие</th>
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
                        {item.batch_code || "-"}
                      </td>

                      <td className="px-3 py-4 align-middle">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {item.status ? statusMap[item.status] || item.status : "-"}
                        </span>
                      </td>

                      <td className="px-3 py-4 align-middle">
                        {item.location || "-"}
                      </td>

                      <td className="px-3 py-4 text-center align-middle whitespace-nowrap">
                        {item.weight ? `${item.weight} кг` : "-"}
                      </td>

                      <td className="px-3 py-4 text-center align-middle whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("ru-RU")
                          : "-"}
                      </td>

                      <td className="px-3 py-4 text-center align-middle whitespace-nowrap">
                        {item.updated_at ? (
                          <div className="leading-tight">
                            <p>{new Date(item.updated_at).toLocaleDateString("ru-RU")}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(item.updated_at).toLocaleTimeString("ru-RU", {
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
                          <button
                            onClick={() => assignClientToShipment(item)}
                            className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-200"
                          >
                            Привязать
                          </button>

                          <Link
                            href={`/admin/shipments/${item.tracking_code}`}
                            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Открыть
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredShipments.length === 0 && (
                <p className="p-5 text-slate-500">
                  Неизвестные посылки не найдены.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}