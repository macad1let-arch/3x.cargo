"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type BatchNote = {
  id: number;
  batch_code: string;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};

type Shipment = {
  id: number;
  batch_code: string | null;
  status: string | null;
  weight: number | null;
  client_code: string;
};

export default function AdminBatchCommentsPage() {
  const [batchNotes, setBatchNotes] = useState<BatchNote[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);

    const { data: notesData, error: notesError } = await supabase
      .from("batch_notes")
      .select("*")
      .not("note", "is", null)
      .order("updated_at", { ascending: false });

    if (notesError) {
      console.error(notesError);
    }

    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from("shipments")
      .select("id, batch_code, status, weight, client_code");

    if (shipmentsError) {
      console.error(shipmentsError);
    }

    setBatchNotes((notesData || []).filter((item) => item.note?.trim()));
    setShipments(shipmentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const batchesWithStats = useMemo(() => {
    return batchNotes.map((note) => {
      const batchShipments = shipments.filter(
        (item) => item.batch_code === note.batch_code
      );

      const totalWeight = batchShipments.reduce(
        (sum, item) => sum + (item.weight || 0),
        0
      );

      const problemCount = batchShipments.filter(
        (item) => item.status === "problem"
      ).length;

      const unknownCount = batchShipments.filter(
        (item) => item.client_code === "unknown"
      ).length;

      const readyCount = batchShipments.filter(
        (item) => item.status === "ready_pickup"
      ).length;

      const completedCount = batchShipments.filter(
        (item) => item.status === "completed"
      ).length;

      return {
        ...note,
        totalShipments: batchShipments.length,
        totalWeight,
        problemCount,
        unknownCount,
        readyCount,
        completedCount,
      };
    });
  }, [batchNotes, shipments]);

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = batchesWithStats.filter((item) => {
      return (
        !q ||
        item.batch_code.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sort === "oldest") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });
  }, [batchesWithStats, search, sort]);

  const totalComments = batchNotes.length;
  const totalProblemBatches = batchesWithStats.filter(
    (item) => item.problemCount > 0
  ).length;
  const totalUnknownBatches = batchesWithStats.filter(
    (item) => item.unknownCount > 0
  ).length;

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Комментарии к партиям</h1>
            <p className="mt-2 text-slate-600">
              Все партии, где менеджер оставил комментарий.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/comments"
              className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
            >
              Комментарии посылок
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
            <p className="text-sm text-slate-500">Партий с комментариями</p>
            <p className="mt-2 text-3xl font-bold">{totalComments}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемные партии</p>
            <p className="mt-2 text-3xl font-bold">{totalProblemBatches}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">С unknown</p>
            <p className="mt-2 text-3xl font-bold">{totalUnknownBatches}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Показано</p>
            <p className="mt-2 text-3xl font-bold">{filteredBatches.length}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Список партий</h2>

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
                placeholder="Поиск: партия, текст комментария..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600 md:w-[380px]"
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredBatches.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border bg-yellow-50/60 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        💬 Комментарий к партии
                      </div>

                      <h3 className="mt-3 break-all text-xl font-bold">
                        {item.batch_code}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">
                          Посылок: {item.totalShipments}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Вес: {item.totalWeight.toFixed(2)} кг
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Готовы: {item.readyCount}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Выдано: {item.completedCount}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Проблемы: {item.problemCount}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Unknown: {item.unknownCount}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm text-slate-500">Комментарий</p>
                        <p className="mt-2 whitespace-pre-wrap text-slate-800">
                          {item.note}
                        </p>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Создано:{" "}
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
                        href={`/admin/batches/${item.batch_code}`}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
                      >
                        Открыть партию
                      </Link>

                      <Link
                        href={`/admin?batch=${item.batch_code}`}
                        className="rounded-xl bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700"
                      >
                        Посылки партии
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {filteredBatches.length === 0 && (
                <p className="text-slate-500">
                  Партии с комментариями не найдены.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}