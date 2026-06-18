"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Pencil,
  RefreshCw,
  Save,
  Scale,
  User,
  X,
  Truck,
} from "lucide-react";

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

type TrackingEvent = {
  id: number;
  shipment_id: number | null;
  tracking_code: string;
  client_code: string | null;
  batch_code: string | null;
  status: string | null;
  location: string | null;
  note: string | null;
  created_at: string;
};

type EditForm = {
  client_code: string;
  tracking_code: string;
  batch_code: string;
  status: string;
  weight: string;
  location: string;
  note: string;
  delivery_cost: string;
};

const statusOptions = [
  { value: "china_warehouse", label: "На складе в Китае" },
  { value: "in_transit", label: "В пути" },
  { value: "bishkek_arrived", label: "В Бишкеке" },
  { value: "sorting", label: "На сортировке" },
  { value: "ready_pickup", label: "Готов к выдаче" },
  { value: "completed", label: "Выдано" },
  { value: "problem", label: "Проблема" },
];

const statusMap: Record<string, string> = Object.fromEntries(
  statusOptions.map((status) => [status.value, status.label])
);

const statusStyles: Record<string, string> = {
  china_warehouse: "bg-yellow-50 text-yellow-700 ring-yellow-100",
  in_transit: "bg-blue-50 text-blue-700 ring-blue-100",
  bishkek_arrived: "bg-green-50 text-green-700 ring-green-100",
  sorting: "bg-violet-50 text-violet-700 ring-violet-100",
  ready_pickup: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  problem: "bg-red-50 text-red-700 ring-red-100",
};

const getStatusLabel = (status?: string | null) => {
  if (!status) return "Без статуса";
  return statusMap[status] || status;
};

const getStatusStyle = (status?: string | null) => {
  if (!status) return "bg-slate-50 text-slate-600 ring-slate-100";
  return statusStyles[status] || "bg-slate-50 text-slate-600 ring-slate-100";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("ru-RU");
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ru-RU");
};

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminShipmentPage() {
  const params = useParams();
  const router = useRouter();

  const rawTracking = params.tracking_code;

  const trackingCode = Array.isArray(rawTracking)
    ? decodeURIComponent(rawTracking[0] || "")
    : decodeURIComponent(String(rawTracking || ""));

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState("");

  const [editForm, setEditForm] = useState<EditForm>({
    client_code: "",
    tracking_code: "",
    batch_code: "",
    status: "china_warehouse",
    weight: "",
    location: "",
    note: "",
    delivery_cost: "",
  });

  const currentStatusStyle = useMemo(
    () => getStatusStyle(shipment?.status),
    [shipment?.status]
  );

  const loadShipment = useCallback(async () => {
    setLoading(true);
    setMsg("");

    if (!trackingCode) {
      setShipment(null);
      setEvents([]);
      setLoading(false);
      return;
    }

    const [shipmentResult, eventsResult] = await Promise.all([
      supabase
        .from("shipments")
        .select(
          "id, client_code, tracking_code, batch_code, status, location, weight, delivery_cost, final_amount, note, created_at, updated_at"
        )
        .eq("tracking_code", trackingCode)
        .maybeSingle(),

      supabase
        .from("tracking_events")
        .select(
          "id, shipment_id, tracking_code, client_code, batch_code, status, location, note, created_at"
        )
        .eq("tracking_code", trackingCode)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (shipmentResult.error) {
      console.error("Ошибка загрузки посылки:", shipmentResult.error);
      setShipment(null);
      setEvents([]);
      setLoading(false);
      return;
    }

    if (eventsResult.error) {
      console.error("Ошибка загрузки истории:", eventsResult.error);
    }

    const shipmentData = shipmentResult.data || null;

    setShipment(shipmentData);
    setEvents(eventsResult.data || []);

    if (shipmentData) {
      setEditForm({
        client_code: shipmentData.client_code || "",
        tracking_code: shipmentData.tracking_code || "",
        batch_code: shipmentData.batch_code || "",
        status: shipmentData.status || "china_warehouse",
        weight:
          shipmentData.weight !== null && shipmentData.weight !== undefined
            ? String(shipmentData.weight)
            : "",
        location: shipmentData.location || "",
        note: shipmentData.note || "",
        delivery_cost: (shipmentData as any).delivery_cost !== null ? String((shipmentData as any).delivery_cost) : "",
      });
    }

    setLoading(false);
  }, [trackingCode]);

  useEffect(() => {
    loadShipment();
  }, [loadShipment]);

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${label} скопирован.`);
    } catch {
      setMsg("Не удалось скопировать.");
    }
  };

  const createTrackingEvent = async (
    currentShipment: Shipment,
    status: string,
    location: string | null,
    note: string
  ) => {
    const { error } = await supabase.from("tracking_events").insert([
      {
        shipment_id: currentShipment.id,
        tracking_code: currentShipment.tracking_code,
        client_code: currentShipment.client_code,
        batch_code: currentShipment.batch_code || null,
        status,
        location: location || currentShipment.location || "",
        note,
      },
    ]);

    if (error) {
      console.error("Ошибка создания истории:", error);
    }
  };

  const quickUpdateStatus = async (newStatus: string) => {
    if (!shipment) return;

    setActionLoading(true);
    setMsg("");

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("shipments")
      .update({
        status: newStatus,
        updated_at: now,
      })
      .eq("id", shipment.id);

    if (error) {
      console.error(error);
      setMsg("Ошибка изменения статуса.");
      setActionLoading(false);
      return;
    }

    await createTrackingEvent(
      shipment,
      newStatus,
      shipment.location,
      "Статус изменён из карточки посылки"
    );

    setMsg("Статус обновлён.");
    await loadShipment();
    setActionLoading(false);
  };

  const saveShipmentChanges = async () => {
    if (!shipment) return;

    const newTrackingCode = editForm.tracking_code.trim().toUpperCase();

    if (!newTrackingCode) {
      setMsg("Трек-код не может быть пустым.");
      return;
    }

    setActionLoading(true);
    setMsg("");

    const cleanedClientCode = editForm.client_code.trim() || "unknown";
    const cleanedBatchCode = editForm.batch_code.trim()
      ? editForm.batch_code.trim().toUpperCase()
      : null;
    const cleanedLocation = editForm.location.trim() || null;
    const cleanedNote = editForm.note.trim() || null;
    const cleanedStatus = editForm.status || "china_warehouse";
    const weightValue = editForm.weight ? Number(editForm.weight) : null;
    const deliveryCostValue = editForm.delivery_cost ? Number(editForm.delivery_cost) : null;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("shipments")
      .update({
        client_code: cleanedClientCode,
        tracking_code: newTrackingCode,
        batch_code: cleanedBatchCode,
        status: cleanedStatus,
        weight: weightValue,
        delivery_cost: deliveryCostValue,
        final_amount: deliveryCostValue,
        location: cleanedLocation,
        note: cleanedNote,
        updated_at: now,
      })
      .eq("id", shipment.id);

    if (error) {
      console.error(error);
      setMsg("Ошибка сохранения посылки.");
      setActionLoading(false);
      return;
    }

    if (cleanedBatchCode) {
      const { error: batchError } = await supabase.from("batches").upsert(
        {
          batch_code: cleanedBatchCode,
          status: "china_warehouse",
          updated_at: now,
        },
        { onConflict: "batch_code" }
      );

      if (batchError) {
        console.error("Ошибка обновления партии:", batchError);
      }
    }

    await supabase.from("tracking_events").insert([
      {
        shipment_id: shipment.id,
        tracking_code: newTrackingCode,
        client_code: cleanedClientCode,
        batch_code: cleanedBatchCode,
        status: cleanedStatus,
        location: cleanedLocation || "",
        note: "Посылка отредактирована",
      },
    ]);

    setEditMode(false);
    setMsg("Изменения сохранены.");

    if (newTrackingCode !== shipment.tracking_code) {
      router.replace(`/admin/shipments/${encodeURIComponent(newTrackingCode)}`);
      setActionLoading(false);
      return;
    }

    await loadShipment();
    setActionLoading(false);
  };

  if (loading) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-blue-600" size={34} />
        <p className="mt-4 text-sm font-semibold text-slate-500">
          Загрузка посылки...
        </p>
      </div>
    </div>
  );
}

if (!shipment) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        href="/admin/shipments"
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Назад к посылкам
      </Link>

      <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-red-400" size={44} />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          Посылка не найдена
        </h1>
        <p className="mt-2 break-all text-slate-500">{trackingCode}</p>
      </div>
    </div>
  );
}

return (
  <div className="mx-auto max-w-[1500px]">
    <div className="mb-6">
      <Link
        href="/admin/shipments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Назад к посылкам
      </Link>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all text-4xl font-bold tracking-tight text-slate-950">
              {shipment.tracking_code}
            </h1>

            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ring-1 ${currentStatusStyle}`}
            >
              {getStatusLabel(shipment.status)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Карточка посылки, данные клиента и история движения
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => copyText(shipment.tracking_code, "Трек-код")}
            className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Copy size={18} />
            Копировать трек
          </button>

          <button
            onClick={() => setEditMode((value) => !value)}
            className={`flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-bold shadow-sm transition ${
              editMode
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {editMode ? <X size={18} /> : <Pencil size={18} />}
            {editMode ? "Закрыть" : "Редактировать"}
          </button>
        </div>
      </div>
    </div>

    {msg && (
      <div className="mb-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700">
        {msg}
      </div>
    )}

    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <User size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Клиент</p>

            <div className="mt-1 flex items-center gap-2">
              {shipment.client_code === "unknown" ? (
                <span className="text-lg font-bold text-orange-600">
                  unknown
                </span>
              ) : (
                <Link
                  href={`/admin/clients/${encodeURIComponent(
                    shipment.client_code
                  )}`}
                  className="break-all text-lg font-bold text-slate-950 hover:text-blue-600 hover:underline"
                >
                  {shipment.client_code}
                </Link>
              )}

              <button
                onClick={() => copyText(shipment.client_code, "Код клиента")}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <Copy size={15} />
              </button>
            </div>

            {shipment.client_code !== "unknown" && (
              <Link
                href={`/admin/clients/${encodeURIComponent(
                  shipment.client_code
                )}`}
                className="mt-2 inline-block text-xs font-bold text-blue-600 hover:underline"
              >
                Перейти к клиенту
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Boxes size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Партия</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="break-all text-lg font-bold text-slate-950">
                {shipment.batch_code || "-"}
              </p>

              {shipment.batch_code && (
                <button
                  onClick={() => copyText(shipment.batch_code || "", "Партия")}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <Copy size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Scale size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Вес</p>
            <p className="mt-1 text-lg font-bold text-slate-950">
              {shipment.weight ? `${shipment.weight} кг` : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <MapPin size={22} />
          </div>

          <div>
            <p className="text-sm text-slate-500">Локация</p>
            <p className="mt-1 break-all text-lg font-bold text-slate-950">
              {shipment.location || "-"}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Управление посылкой
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Быстрое изменение статуса и полное редактирование
        </p>

        <div className="mt-6">
          <label className="text-sm font-bold text-slate-700">Статус</label>

          <div className="relative mt-2">
            <select
              value={shipment.status || ""}
              disabled={actionLoading}
              onChange={(event) => quickUpdateStatus(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-400">
            Изменение статуса сохранится и попадёт в историю
          </p>
        </div>

        {editMode && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-bold text-slate-950">
              Редактировать данные
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-bold text-slate-600">
                  Трек-код
                </label>
                <input
                  value={editForm.tracking_code}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      tracking_code: event.target.value.toUpperCase(),
                    })
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600">
                  Код клиента
                </label>
                <input
                  value={editForm.client_code}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      client_code: event.target.value,
                    })
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600">
                  Партия
                </label>
                <input
                  value={editForm.batch_code}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      batch_code: event.target.value.toUpperCase(),
                    })
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600">
                  Статус
                </label>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      status: event.target.value,
                    })
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-600"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
  <label className="text-sm font-bold text-slate-600">
    Вес, кг
  </label>
  <input
    type="number"
    value={editForm.weight}
    onChange={(event) => {
      const w = event.target.value;
      const cost = w ? Math.round(parseFloat(w) * 2.8 * 88) : 0;
      setEditForm({ ...editForm, weight: w, delivery_cost: cost > 0 ? String(cost) : "" });
    }}
    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
  />
</div>

              <div>
  <label className="text-sm font-bold text-slate-600">Стоимость (сом)</label>
  <input
    type="number"
    value={editForm.delivery_cost}
    onChange={(event) => setEditForm({ ...editForm, delivery_cost: event.target.value })}
    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
  />
</div>

              <div>
                <label className="text-sm font-bold text-slate-600">
                  Локация
                </label>
                <input
                  value={editForm.location}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      location: event.target.value,
                    })
                  }
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-slate-600">
                  Комментарий
                </label>
                <textarea
                  value={editForm.note}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      note: event.target.value,
                    })
                  }
                  placeholder="Например: проверить упаковку, клиент просил уточнить вес..."
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none transition focus:border-blue-600"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={saveShipmentChanges}
                disabled={actionLoading}
                className="flex h-12 items-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Сохранить изменения
              </button>

              <button
                onClick={() => setEditMode(false)}
                disabled={actionLoading}
                className="h-12 rounded-2xl bg-slate-100 px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {shipment.note && !editMode && (
          <div className="mt-6 rounded-2xl border border-yellow-100 bg-yellow-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500">
                <MessageSquare size={19} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Комментарий менеджера
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {shipment.note}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Даты и система</h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Clock size={17} />
                Добавлено
              </div>
              <p className="text-sm font-bold text-slate-700">
                {formatDateTime(shipment.created_at)}
              </p>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <RefreshCw size={17} />
                Обновлено
              </div>
              <p className="text-sm font-bold text-slate-700">
                {formatDateTime(shipment.updated_at)}
              </p>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <FileText size={17} />
                ID в базе
              </div>
              <p className="text-sm font-bold text-slate-700">
                #{shipment.id}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-950">
              История статусов
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              {events.length}
            </span>
          </div>

          {events.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              Истории статусов пока нет.
            </p>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute bottom-5 left-[18px] top-5 w-px bg-slate-200" />

              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  <div
                    className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                      index === 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {index === 0 ? <Truck size={18} /> : <Clock size={18} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">
                          {getStatusLabel(event.status)}
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {event.location || "-"}
                        </p>

                        {event.note && (
                          <p className="mt-1 text-xs text-slate-400">
                            {event.note}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right text-xs font-semibold text-slate-500">
                        <p>{formatDate(event.created_at)}</p>
                        <p className="mt-1">{formatTime(event.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {events.length >= 50 && (
                <button className="mt-3 h-11 w-full rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200">
                  Показано последние 50 событий
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
  );
}