"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: number;
  client_code: string;
  tracking_code: string;
  batch_code: string | null;
  status: string | null;
  weight: number | null;
  location: string | null;
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

type TrackingEvent = {
  id: number;
  shipment_id: number;
  tracking_code: string;
  client_code: string;
  batch_code: string | null;
  status: string | null;
  location: string | null;
  note: string | null;
  created_at: string;
};

const statusOptions = [
  { value: "china_warehouse", label: "🟡 На складе в Китае" },
  { value: "in_transit", label: "🔵 В пути" },
  { value: "bishkek_arrived", label: "🟢 В Бишкеке" },
  { value: "sorting", label: "🟣 На сортировке" },
  { value: "ready_pickup", label: "📦 Готов к выдаче" },
  { value: "completed", label: "✅ Выдано" },
  { value: "problem", label: "🔴 Проблема" },
];

const statusMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((s) => [s.value, s.label])
);

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();

  const batch = decodeURIComponent(String(params.batch || ""));

const [shipments, setShipments] = useState<Shipment[]>([]);
const [events, setEvents] = useState<TrackingEvent[]>([]);
const [loading, setLoading] = useState(true);
const [msg, setMsg] = useState("");
const [batchNote, setBatchNote] = useState("");
const [showBatchHistory, setShowBatchHistory] = useState(false);

  const loadShipments = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("batch_code", batch)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    setMsg("Ошибка загрузки партии.");
  } else {
    setShipments(data || []);
  }

  const { data: eventsData, error: eventsError } = await supabase
    .from("tracking_events")
    .select("*")
    .eq("batch_code", batch)
    .order("created_at", { ascending: false });

  if (eventsError) {
    console.error(eventsError);
  } else {
    setEvents(eventsData || []);
  }
const { data: noteData, error: noteError } = await supabase
  .from("batch_notes")
  .select("*")
  .eq("batch_code", batch)
  .single();

if (noteError && noteError.code !== "PGRST116") {
  console.error(noteError);
}

setBatchNote(noteData?.note || "");
  setLoading(false);
};

  useEffect(() => {
    if (batch) loadShipments();
  }, [batch]);

  const stats = useMemo(() => {
    return {
      total: shipments.length,
      totalWeight: shipments.reduce((sum, item) => sum + (item.weight || 0), 0),
      ready: shipments.filter((item) => item.status === "ready_pickup").length,
      completed: shipments.filter((item) => item.status === "completed").length,
      problem: shipments.filter((item) => item.status === "problem").length,
      unknown: shipments.filter((item) => item.client_code === "unknown").length,
    };
  }, [shipments]);

  const updateShipmentStatus = async (shipment: Shipment, status: string) => {
  setMsg("");

  console.log("Меняем статус:", shipment.tracking_code, status);

  const { error } = await supabase
    .from("shipments")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shipment.id);

  if (error) {
    console.error(error);
    setMsg(`Ошибка изменения статуса: ${error.message}`);
    return;
  }

  await supabase.from("tracking_events").insert([
    {
      shipment_id: shipment.id,
      tracking_code: shipment.tracking_code,
      client_code: shipment.client_code,
      batch_code: shipment.batch_code || null,
      status: status,
      location: shipment.location || "",
      note: "",
    },
  ]);

  setMsg(`Статус обновлён: ${statusMap[status] || status}`);
  await loadShipments();
};

  const updateWholeBatch = async (status: string) => {
    const { error } = await supabase
      .from("shipments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("batch_code", batch);

    if (error) {
      console.error(error);
      setMsg("Ошибка обновления партии.");
      return;
    }

    for (const shipment of shipments) {
      await supabase.from("tracking_events").insert([
        {
          shipment_id: shipment.id,
          tracking_code: shipment.tracking_code,
          client_code: shipment.client_code,
          batch_code: shipment.batch_code || null,
          status,
          location: shipment.location || "",
          note: "Обновлено через страницу партии",
        },
      ]);
    }

    setMsg("Статус всей партии обновлён.");
    await loadShipments();
  };

  const exportBatchToExcel = () => {
  const rows = shipments.map((item) => ({
    tracking_code: item.tracking_code,
    client_code: item.client_code,
    batch_code: item.batch_code,
    status: item.status,
    weight: item.weight,
    location: item.location,
    created_at: item.created_at
      ? new Date(item.created_at).toLocaleString("ru-RU")
      : "",
    updated_at: item.updated_at
      ? new Date(item.updated_at).toLocaleString("ru-RU")
      : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, batch);
  XLSX.writeFile(workbook, `${batch}.xlsx`);
};

const groupedBatchEvents = useMemo(() => {
  const grouped: Record<
    string,
    {
      status: string | null;
      location: string | null;
      note: string | null;
      created_at: string;
      count: number;
    }
  > = {};

  events.forEach((event) => {
    const eventDate = new Date(event.created_at);

    const key = [
      event.status || "",
      event.location || "",
      event.note || "",
      eventDate.toISOString().slice(0, 16),
    ].join("|");

    if (!grouped[key]) {
      grouped[key] = {
        status: event.status,
        location: event.location,
        note: event.note,
        created_at: event.created_at,
        count: 0,
      };
    }

    grouped[key].count += 1;
  });

  return Object.values(grouped).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}, [events]);

const saveBatchNote = async () => {
  const { error } = await supabase.from("batch_notes").upsert(
    {
      batch_code: batch,
      note: batchNote,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "batch_code" }
  );

  if (error) {
    console.error(error);
    setMsg("Ошибка сохранения комментария.");
    return;
  }

  setMsg("Комментарий к партии сохранён.");
};

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
  <button
    onClick={() => router.push("/admin/batches")}
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    ← К партиям
  </button>

  <button
    onClick={() => router.push("/admin")}
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    Назад в CRM →
  </button>
</div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <p className="text-sm text-slate-500">Партия</p>

  <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <h1 className="text-4xl font-bold">{batch}</h1>

    <button
      onClick={exportBatchToExcel}
      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
    >
      Скачать Excel
    </button>
  </div>

  {msg && <p className="mt-4 text-sm text-blue-600">{msg}</p>}
</section>

<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">Комментарий к партии</h2>

  <textarea
    value={batchNote}
    onChange={(e) => setBatchNote(e.target.value)}
    placeholder="Например: партия задержалась на границе, проверить 3 трека, часть груза пришла отдельно..."
    className="mt-4 min-h-[120px] w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
  />

  <button
    onClick={saveBatchNote}
    className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
  >
    Сохранить комментарий
  </button>
</section>

        <section className="mt-6 grid gap-4 md:grid-cols-6">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Посылок</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Вес</p>
            <p className="mt-2 text-3xl font-bold">
              {stats.totalWeight.toFixed(2)} кг
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Готовы</p>
            <p className="mt-2 text-3xl font-bold">{stats.ready}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Выдано</p>
            <p className="mt-2 text-3xl font-bold">{stats.completed}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Проблемы</p>
            <p className="mt-2 text-3xl font-bold">{stats.problem}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unknown</p>
            <p className="mt-2 text-3xl font-bold">{stats.unknown}</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Обновить всю партию</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => updateWholeBatch(status.value)}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold hover:bg-blue-600 hover:text-white"
              >
                {status.label}
              </button>
            ))}
          </div>
        </section>

<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <button
    type="button"
    onClick={() => setShowBatchHistory(!showBatchHistory)}
    className="flex w-full items-center justify-between text-left"
  >
    <div>
      <h2 className="text-xl font-bold">История партии</h2>
      <p className="mt-1 text-sm text-slate-500">
        Все изменения статусов по этой партии
      </p>
    </div>

    <span className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-600">
      {showBatchHistory ? "↑" : "↓"}
    </span>
  </button>

  {showBatchHistory && (
    <div className="mt-5">
      {groupedBatchEvents.length === 0 ? (
        <p className="text-slate-500">
          Истории партии пока нет. Она появится после изменения статуса.
        </p>
      ) : (
        <div className="space-y-3">
          {groupedBatchEvents.map((event, index) => (
            <div
              key={`${event.created_at}-${index}`}
              className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-bold">
                  {event.status
                    ? statusMap[event.status] || event.status
                    : "-"}
                </p>

                {event.location && (
                  <p className="mt-1 text-sm text-slate-500">
                    Локация: {event.location}
                  </p>
                )}

                {event.note && (
                  <p className="mt-1 text-sm text-slate-500">
                    {event.note}
                  </p>
                )}
              </div>

              <div className="text-sm text-slate-600 md:text-right">
                <p>
                  {event.created_at
                    ? new Date(event.created_at).toLocaleDateString("ru-RU")
                    : "-"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {event.created_at
                    ? new Date(event.created_at).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </p>

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {event.count} посылок
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Посылки партии</h2>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-3">Добавлено</th>
                    <th>Трек</th>
                    <th>Клиент</th>
                    <th>Статус</th>
                    <th>Вес</th>
                    <th>Изменить статус</th>
                    <th>Обновлено</th>
                  </tr>
                </thead>

                <tbody>
                  {shipments.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-4">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("ru-RU")
                          : "-"}
                      </td>

                      <td className="font-bold">
                        <Link
                          href={`/admin/shipments/${item.tracking_code}`}
                          className="hover:text-blue-600"
                        >
                          {item.tracking_code}
                        </Link>
                      </td>

                      <td>
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

                      <td>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                          {item.status
                            ? statusMap[item.status] || item.status
                            : "-"}
                        </span>
                      </td>

                      <td>{item.weight ? `${item.weight} кг` : "-"}</td>

                      <td>
                        <select
  value={item.status || ""}
  onChange={(e) => updateShipmentStatus(item, e.target.value)}
  className="w-[210px] rounded-xl border px-3 py-2 text-sm font-semibold outline-none focus:border-blue-600"
>
  {statusOptions.map((status) => (
    <option key={status.value} value={status.value}>
      {status.label}
    </option>
  ))}
</select>
                      </td>

                      <td>
                        {item.updated_at ? (
                          <div>
                            <p>
                              {new Date(item.updated_at).toLocaleDateString(
                                "ru-RU"
                              )}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(item.updated_at).toLocaleTimeString(
                                "ru-RU",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {shipments.length === 0 && (
                <p className="mt-5 text-slate-500">В этой партии нет посылок.</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}