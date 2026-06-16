"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: number;
  client_code: string;
  tracking_code: string;
  batch_code: string | null;
  status: string | null;
  weight: number | null;
  created_at: string;
  updated_at: string | null;
};

type Batch = {
  id: number;
  batch_code: string;
  status: string | null;
  departure_date: string | null;
  arrival_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string | null;
};

type BatchNote = {
  id: number;
  batch_code: string;
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

const activeStatuses = [
  "china_warehouse",
  "in_transit",
  "bishkek_arrived",
  "sorting",
  "ready_pickup",
  "problem",
];

export default function AdminBatchesPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
const [batchesData, setBatchesData] = useState<Batch[]>([]);
const [batchNotes, setBatchNotes] = useState<BatchNote[]>([]);
const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadShipments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .not("batch_code", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setShipments(data || []);

    const { data: batchData, error: batchError } = await supabase
  .from("batches")
  .select("*");

if (batchError) {
  console.error(batchError);
} else {
  setBatchesData(batchData || []);
}



const { data: notesData, error: notesError } = await supabase
  .from("batch_notes")
  .select("*");

if (notesError) {
  console.error(notesError);
} else {
  setBatchNotes(notesData || []);
}

setLoading(false);
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const batches = useMemo(() => {
    const grouped: Record<string, Shipment[]> = {};

    shipments.forEach((item) => {
      if (!item.batch_code) return;

      if (!grouped[item.batch_code]) {
        grouped[item.batch_code] = [];
      }

      grouped[item.batch_code].push(item);
    });

    return Object.entries(grouped)
      .map(([batch_code, items]) => {
        const totalWeight = items.reduce(
          (sum, item) => sum + (item.weight || 0),
          0
        );

        const active = items.filter((item) =>
          activeStatuses.includes(item.status || "")
        ).length;

        const ready = items.filter(
          (item) => item.status === "ready_pickup"
        ).length;

        const completed = items.filter(
          (item) => item.status === "completed"
        ).length;

        const problem = items.filter((item) => item.status === "problem").length;
        const unknown = items.filter(
  (item) => item.client_code === "unknown"
).length;

        const latestUpdate = items
          .map((item) => item.updated_at || item.created_at)
          .sort()
          .reverse()[0];

       const batchInfo = batchesData.find(
  (batch) => batch.batch_code === batch_code
);

const mainStatus = batchInfo?.status || "china_warehouse";

const createdAt = items
  .map((item) => item.created_at)
  .sort()[0];

const batchNote = batchNotes.find(
  (note) => note.batch_code === batch_code
);

return {
  batch_code,
  total: items.length,
  totalWeight,
  active,
  ready,
  completed,
  problem,
  unknown,
  createdAt,
  latestUpdate,
  mainStatus,
  batchInfo,
  note: batchNote?.note || "",
};
      })
      .sort(
        (a, b) =>
          new Date(b.latestUpdate || 0).getTime() -
          new Date(a.latestUpdate || 0).getTime()
      );
  }, [shipments, batchNotes, batchesData]);

  const filteredBatches = useMemo(() => {
  const q = search.trim().toLowerCase();

  return batches.filter((batch) => {
    const matchesSearch =
      !q || batch.batch_code.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    switch (activeTab) {
  case "active":
    return batch.active > 0;

  case "completed":
    return batch.total > 0 && batch.completed === batch.total;

  case "problem":
    return batch.problem > 0;

  case "unknown":
    return batch.unknown > 0;

  default:
    return true;
}
  });
}, [batches, search, activeTab]);

  const totalBatches = batches.length;
  const totalShipments = shipments.length;
  const totalWeight = shipments.reduce((sum, item) => sum + (item.weight || 0), 0);
  const problemBatches = batches.filter((b) => b.problem > 0).length;

  const updateBatchStatus = async (batchCode: string, status: string) => {
  const normalizedBatchCode = batchCode.trim().toUpperCase();
  const now = new Date().toISOString();

  const batchShipments = shipments.filter(
    (item) => item.batch_code === normalizedBatchCode
  );

  const { error: batchError } = await supabase.from("batches").upsert(
    {
      batch_code: normalizedBatchCode,
      status,
      updated_at: now,
    },
    { onConflict: "batch_code" }
  );

  if (batchError) {
    console.error(batchError);
    alert("Ошибка изменения статуса партии.");
    return;
  }

  const { error: shipmentsError } = await supabase
    .from("shipments")
    .update({
      status,
      updated_at: now,
    })
    .eq("batch_code", normalizedBatchCode);

  if (shipmentsError) {
    console.error(shipmentsError);
    alert("Статус партии изменён, но ошибка при обновлении посылок.");
    return;
  }

  for (const shipment of batchShipments) {
    await supabase.from("tracking_events").insert([
      {
        shipment_id: shipment.id,
        tracking_code: shipment.tracking_code,
        client_code: shipment.client_code,
        batch_code: shipment.batch_code || null,
        status,
        location: "",
        note: "Статус партии изменён через select",
      },
    ]);
  }

  await loadShipments();
};

const handleBatchesImport = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    if (!rows.length) {
      alert("Excel пустой или не удалось прочитать строки.");
      return;
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.trim(), value])
      );

      let client_code = String(normalizedRow.client_code || "").trim();

      if (!client_code) {
        client_code = "unknown";
      }

      const tracking_code = String(normalizedRow.tracking_code || "")
        .trim()
        .toUpperCase();

      const batch_code = String(normalizedRow.batch_code || "")
        .trim()
        .toUpperCase();

      const status = String(normalizedRow.status || "china_warehouse").trim();
      const location = String(normalizedRow.location || "Гуанчжоу").trim();
      const weightRaw = normalizedRow.weight;

      if (!tracking_code || !batch_code) {
        skippedCount++;
        continue;
      }

      const { error } = await supabase.from("shipments").upsert(
        {
          client_code,
          tracking_code,
          batch_code,
          status,
          location,
          weight: weightRaw ? Number(weightRaw) : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tracking_code" }
      );

      if (error) {
  console.error("Ошибка импорта партий:", row, error);
  errorCount++;
} else {
  await supabase.from("batches").upsert(
    {
      batch_code,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "batch_code" }
  );

  successCount++;
}
    }

    alert(
      `Импорт завершён: добавлено/обновлено ${successCount}, пропущено ${skippedCount}, ошибок ${errorCount}.`
    );

    e.target.value = "";
    await loadShipments();
  } catch (error) {
    console.error(error);
    alert("Ошибка чтения Excel файла.");
  }
};

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Партии</h1>
            <p className="mt-2 text-slate-600">
              Управление партиями, весом, статусами и проблемными грузами.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
          >
            ← Назад в CRM
          </Link>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего партий</p>
            <p className="mt-2 text-3xl font-bold">{totalBatches}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Посылок в партиях</p>
            <p className="mt-2 text-3xl font-bold">{totalShipments}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Общий вес</p>
            <p className="mt-2 text-3xl font-bold">
              {totalWeight.toFixed(2)} кг
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемные партии</p>
            <p className="mt-2 text-3xl font-bold">{problemBatches}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h2 className="text-xl font-bold">Все партии</h2>

  <div className="flex flex-col gap-3 md:flex-row">
    <label className="cursor-pointer rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
      Импорт Excel
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleBatchesImport}
        className="hidden"
      />
    </label>

    <input
      placeholder="Поиск партии: AUTO-001"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600 md:w-[320px]"
    />
  </div>
</div>

<div className="mt-4 flex flex-wrap gap-2">
  {[
  ["all", "Все"],
  ["active", "Активные"],
  ["completed", "Завершённые"],
  ["problem", "Проблемные"],
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
  Показано: <strong>{filteredBatches.length}</strong> партий
</div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-5 overflow-x-visible">
  <table className="w-full table-fixed text-left text-sm">
                <thead>
  <tr className="border-b text-slate-500">
    <th className="w-[85px] py-3 text-center">Дата</th>
<th className="w-[125px] text-center">Партия</th>
    <th className="w-[160px] text-center">Статус</th>
    <th className="w-[70px] text-center">Всего</th>
    <th className="w-[90px] text-center">Активные</th>
    <th className="w-[80px] text-center">Готовы</th>
    <th className="w-[80px] text-center">Выдано</th>
    <th className="w-[95px] text-center">Проблемы</th>
    <th className="w-[90px] text-center">Unknown</th>
    <th className="w-[95px] text-center">Вес</th>
    <th className="w-[110px] text-center">Обновлено</th>
    <th className="w-[95px] text-center">Действие</th>
  </tr>
                </thead>

                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr
  key={batch.batch_code}
  className={`border-b align-middle hover:bg-slate-50 ${
    batch.note ? "bg-yellow-50/60" : ""
  }`}
>
  <td className="py-4 whitespace-nowrap">
    {batch.createdAt
      ? new Date(batch.createdAt).toLocaleDateString("ru-RU")
      : "-"}
  </td>

<td className="py-4 text-center align-middle">
  <div className="flex flex-col items-center justify-center gap-1">
    <span className="font-bold leading-none">{batch.batch_code}</span>

    {batch.note && (
      <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 whitespace-nowrap">
        💬 Комментарий
      </span>
    )}
  </div>
</td>

<td className="py-4">
  <select
    value={batch.mainStatus}
    onChange={(e) => updateBatchStatus(batch.batch_code, e.target.value)}
    className="mx-auto block w-[160px] rounded-lg border px-2 py-1.5 text-[11px] font-semibold outline-none focus:border-blue-600"
  >
    {Object.entries(statusMap).map(([value, label]) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
</td>

  <td className="text-center">{batch.total}</td>
  <td className="text-center">{batch.active}</td>
  <td className="text-center">{batch.ready}</td>
  <td className="text-center">{batch.completed}</td>

  <td className="text-center">
    {batch.problem > 0 ? (
      <span className="font-bold text-red-600">{batch.problem}</span>
    ) : (
      "0"
    )}
  </td>

  <td className="text-center">
    {batch.unknown > 0 ? (
      <span className="font-bold text-orange-600">{batch.unknown}</span>
    ) : (
      "0"
    )}
  </td>

  <td className="text-center whitespace-nowrap">
    {batch.totalWeight.toFixed(2)} кг
  </td>

  <td className="text-center whitespace-nowrap">
    {batch.latestUpdate ? (
      <div className="leading-tight">
        <p>{new Date(batch.latestUpdate).toLocaleDateString("ru-RU")}</p>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(batch.latestUpdate).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    ) : (
      "-"
    )}
  </td>

  <td className="text-center">
    <Link
      href={`/admin/batches/${batch.batch_code}`}
      className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
    >
      Открыть
    </Link>
  </td>
</tr>
                  ))}
                </tbody>
              </table>

              {filteredBatches.length === 0 && (
                <p className="mt-5 text-slate-500">Партии не найдены.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}