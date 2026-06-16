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

const statusMap: Record<string, string> = {
  china_warehouse: "🟡 На складе в Китае",
  in_transit: "🔵 В пути",
  bishkek_arrived: "🟢 В Бишкеке",
  sorting: "🟣 На сортировке",
  ready_pickup: "📦 Готов к выдаче",
  completed: "✅ Выдано",
  problem: "🔴 Проблема",
};

export default function AdminCommentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .not("note", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setShipments([]);
    } else {
      const onlyWithComments = (data || []).filter((item) =>
        item.note?.trim()
      );

      setShipments(onlyWithComments);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, []);

  const filteredShipments = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = shipments.filter((item) => {
      const matchesSearch =
        !q ||
        item.tracking_code?.toLowerCase().includes(q) ||
        item.client_code?.toLowerCase().includes(q) ||
        item.batch_code?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      switch (activeTab) {
        case "active":
          return item.status !== "completed";

        case "ready":
          return item.status === "ready_pickup";

        case "completed":
          return item.status === "completed";

        case "problem":
          return item.status === "problem";

        case "unknown":
          return item.client_code === "unknown";

        default:
          return true;
      }
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sort === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [shipments, search, sort, activeTab]);

  const totalComments = shipments.length;
  const problemComments = shipments.filter(
    (item) => item.status === "problem"
  ).length;
  const unknownComments = shipments.filter(
    (item) => item.client_code === "unknown"
  ).length;
  const readyComments = shipments.filter(
    (item) => item.status === "ready_pickup"
  ).length;

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Комментарии к посылкам</h1>
            <p className="mt-2 text-slate-600">
              Все посылки, где менеджер оставил комментарий.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <Link
    href="/admin/comments/batches"
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    Комментарии партий
  </Link>

  <Link
    href="/admin"
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    ← Назад в CRM
  </Link>
</div>
</div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего с комментариями</p>
            <p className="mt-2 text-3xl font-bold">{totalComments}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемные</p>
            <p className="mt-2 text-3xl font-bold">{problemComments}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Неизвестные</p>
            <p className="mt-2 text-3xl font-bold">{unknownComments}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Готовы к выдаче</p>
            <p className="mt-2 text-3xl font-bold">{readyComments}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Список посылок</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск: трек, клиент, партия, текст..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600 md:w-[360px]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["all", "Все"],
              ["active", "Активные"],
              ["ready", "Готовы"],
              ["completed", "Выдано"],
              ["problem", "Проблемы"],
              ["unknown", "Неизвестные"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  activeTab === key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Показано: <strong>{filteredShipments.length}</strong> посылок с
            комментариями
          </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredShipments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border bg-yellow-50/60 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        💬 Комментарий к посылке
                      </div>

                      <h3 className="mt-3 break-all text-xl font-bold">
                        {item.tracking_code}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">
                          Клиент: {item.client_code}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Партия: {item.batch_code || "-"}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Статус:{" "}
                          {item.status
                            ? statusMap[item.status] || item.status
                            : "-"}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Вес: {item.weight ? `${item.weight} кг` : "-"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm text-slate-500">Комментарий</p>
                        <p className="mt-2 whitespace-pre-wrap text-slate-800">
                          {item.note}
                        </p>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Добавлено в систему:{" "}
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("ru-RU")
                          : "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Последнее обновление:{" "}
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString("ru-RU")
                          : "-"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Link
                        href={`/admin/shipments/${item.tracking_code}`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
                      >
                        Открыть посылку
                      </Link>

                      {item.client_code !== "unknown" && (
                        <Link
                          href={`/admin/clients/${item.client_code}`}
                          className="rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
                        >
                          Открыть клиента
                        </Link>
                      )}

                      {item.batch_code && (
                        <Link
                          href={`/admin/batches/${item.batch_code}`}
                          className="rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
                        >
                          Открыть партию
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredShipments.length === 0 && (
                <p className="text-slate-500">
                  Посылки с комментариями не найдены.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}