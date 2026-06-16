"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Search,
  Plus,
  FileSpreadsheet,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Boxes,
  Download,
  RefreshCw,
  X,
  ChevronRight,
  MoreHorizontal,
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

type ShipmentStats = {
  total: number;
  active: number;
  ready: number;
  completed: number;
  problem: number;
  unknown: number;
  withComments: number;
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
  statusOptions.map((s) => [s.value, s.label])
);

const validStatuses = statusOptions.map((s) => s.value);

const statusStyles: Record<string, string> = {
  china_warehouse: "bg-yellow-50 text-yellow-700 ring-yellow-100",
  in_transit: "bg-blue-50 text-blue-700 ring-blue-100",
  bishkek_arrived: "bg-green-50 text-green-700 ring-green-100",
  sorting: "bg-violet-50 text-violet-700 ring-violet-100",
  ready_pickup: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  completed: "bg-slate-50 text-slate-700 ring-slate-100",
  problem: "bg-red-50 text-red-700 ring-red-100",
};

const emptyStats: ShipmentStats = {
  total: 0,
  active: 0,
  ready: 0,
  completed: 0,
  problem: 0,
  unknown: 0,
  withComments: 0,
};

export default function ShipmentsPage() {
  const searchParams = useSearchParams();
 const [shipments, setShipments] = useState<Shipment[]>([]);
const [totalCount, setTotalCount] = useState(0);
const [stats, setStats] = useState<ShipmentStats>(emptyStats);
const [statsLoading, setStatsLoading] = useState(true);
const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [batchOptions, setBatchOptions] = useState<string[]>([]);
  const [dateSort, setDateSort] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("in_transit");
  const [bulkBatchCode, setBulkBatchCode] = useState("");

  const [form, setForm] = useState({
    client_code: "",
    tracking_code: "",
    batch_code: "",
    status: "china_warehouse",
    location: "Гуанчжоу",
    weight: "",
  });

  const loadShipments = async () => {
  setLoading(true);
  setMsg("");

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("shipments")
    .select(
      "id, client_code, tracking_code, batch_code, status, location, weight, note, created_at, updated_at",
      { count: "exact" }
    );

  const q = debouncedSearch.trim();

  if (q.length >= 8) {
  query = query.or(
    `tracking_code.ilike.%${q}%,client_code.ilike.%${q}%,batch_code.ilike.%${q}%,location.ilike.%${q}%`
  );
} else if (q.length >= 2) {
  query = query.or(
    `client_code.ilike.%${q}%,batch_code.ilike.%${q}%,location.ilike.%${q}%`
  );
}

  if (batchFilter !== "all") {
    query = query.eq("batch_code", batchFilter);
  }

  if (activeTab === "active") {
    query = query.neq("status", "completed");
  }

  if (activeTab === "ready") {
    query = query.eq("status", "ready_pickup");
  }

  if (activeTab === "completed") {
    query = query.eq("status", "completed");
  }

  if (activeTab === "problem") {
    query = query.eq("status", "problem");
  }

  if (activeTab === "unknown") {
    query = query.eq("client_code", "unknown");
  }

  if (activeTab === "comments") {
    query = query.not("note", "is", null);
  }

  if (dateSort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (dateSort === "updated_newest") {
    query = query.order("updated_at", {
      ascending: false,
      nullsFirst: false,
    });
  } else if (dateSort === "updated_oldest") {
    query = query.order("updated_at", {
      ascending: true,
      nullsFirst: false,
    });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    setMsg("Ошибка загрузки посылок.");
    setLoading(false);
    return;
  }

  setShipments(data || []);
  setTotalCount(count || 0);
  setLoading(false);
};

const loadStats = async () => {
  setStatsLoading(true);

  const [
    totalRes,
    completedRes,
    readyRes,
    problemRes,
    unknownRes,
    commentsRes,
  ] = await Promise.all([
    supabase.from("shipments").select("id", { count: "exact", head: true }),

    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),

    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready_pickup"),

    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("status", "problem"),

    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .eq("client_code", "unknown"),

    supabase
      .from("shipments")
      .select("id", { count: "exact", head: true })
      .not("note", "is", null),
  ]);

  const hasError =
    totalRes.error ||
    completedRes.error ||
    readyRes.error ||
    problemRes.error ||
    unknownRes.error ||
    commentsRes.error;

  if (hasError) {
    console.error("Ошибка загрузки KPI:", {
      total: totalRes.error,
      completed: completedRes.error,
      ready: readyRes.error,
      problem: problemRes.error,
      unknown: unknownRes.error,
      comments: commentsRes.error,
    });

    setStatsLoading(false);
    return;
  }

  const total = totalRes.count || 0;
  const completed = completedRes.count || 0;

  setStats({
    total,
    completed,
    active: total - completed,
    ready: readyRes.count || 0,
    problem: problemRes.count || 0,
    unknown: unknownRes.count || 0,
    withComments: commentsRes.count || 0,
  });

  setStatsLoading(false);
};

const loadBatchOptions = async () => {
  const { data, error } = await supabase
    .from("batches")
    .select("batch_code")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Ошибка загрузки партий:", error);
    return;
  }

  const batches = (data || [])
    .map((item) => item.batch_code)
    .filter((batch): batch is string => Boolean(batch));

  setBatchOptions(Array.from(new Set(batches)).sort());
};

  useEffect(() => {
  loadShipments();
}, [currentPage, pageSize, debouncedSearch, activeTab, batchFilter, dateSort]);

useEffect(() => {
  loadStats();
  loadBatchOptions();
}, []);

  useEffect(() => {
  const initialSearch = searchParams.get("search");

  if (initialSearch) {
    setSearch(initialSearch);
  }
}, [searchParams]);


useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

  useEffect(() => {
  setCurrentPage(1);
  setSelectedIds([]);
  setSelectionMode(false);
}, [debouncedSearch, activeTab, batchFilter, dateSort, pageSize]);

useEffect(() => {
  setSelectedIds([]);
}, [currentPage]);
  
  const selectedShipments = useMemo(() => {
    return shipments.filter((item) => selectedIds.includes(item.id));
  }, [shipments, selectedIds]);



  const toggleSelectShipment = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
  if (allVisibleSelected) {
    setSelectedIds((prev) =>
      prev.filter((id) => !paginatedShipments.some((item) => item.id === id))
    );
    return;
  }

  const visibleIds = paginatedShipments.map((item) => item.id);
  setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
};

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const closeSelectionMode = () => {
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const createTrackingEvent = async (
    shipment: Shipment,
    status: string,
    location: string | null
  ) => {
    const { error } = await supabase.from("tracking_events").insert([
      {
        shipment_id: shipment.id,
        tracking_code: shipment.tracking_code,
        client_code: shipment.client_code,
        batch_code: shipment.batch_code || null,
        status,
        location: location || shipment.location || "",
        note: "",
      },
    ]);

    if (error) {
      console.error("Ошибка создания истории статуса:", error);
    }
  };

  const addShipment = async () => {
    setMsg("");

    let client_code = form.client_code.trim();

    if (!client_code) {
      client_code = "unknown";
    }

    const tracking_code = form.tracking_code.trim().toUpperCase();

    if (!tracking_code) {
      setMsg("Заполните трек-код.");
      return;
    }

    const { error } = await supabase.from("shipments").upsert(
      {
        client_code,
        tracking_code,
        batch_code: form.batch_code.trim()
          ? form.batch_code.trim().toUpperCase()
          : null,
        status: form.status,
        location: form.location.trim() || "Гуанчжоу",
        weight: form.weight ? Number(form.weight) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tracking_code" }
    );

    if (error) {
      console.error(error);
      setMsg("Ошибка добавления посылки.");
      return;
    }

    setForm({
      client_code: "",
      tracking_code: "",
      batch_code: "",
      status: "china_warehouse",
      location: "Гуанчжоу",
      weight: "",
    });

    setMsg("Посылка добавлена / обновлена.");
    await Promise.all([loadShipments(), loadStats(), loadBatchOptions()]);
  };

  const updateStatus = async (id: number, status: string) => {
    const shipment = shipments.find((item) => item.id === id);

    if (!shipment) {
      setMsg("Посылка не найдена.");
      return;
    }

    const { error } = await supabase
      .from("shipments")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Ошибка изменения статуса.");
      return;
    }

    await createTrackingEvent(shipment, status, shipment.location);
    await Promise.all([loadShipments(), loadStats()]);
  };

  const assignClientToShipment = async (id: number) => {
    const clientCode = prompt("Введите код клиента, например 3X-4198");

    if (!clientCode) return;

    const { error } = await supabase
      .from("shipments")
      .update({
        client_code: clientCode.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMsg("Ошибка привязки клиента.");
      return;
    }

    setMsg("Посылка привязана к клиенту.");
    await Promise.all([loadShipments(), loadStats()]);
  };

  const bulkUpdateStatus = async () => {
    if (selectedIds.length === 0) {
      setMsg("Выберите хотя бы одну посылку.");
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("shipments")
      .update({
        status: bulkStatus,
        updated_at: now,
      })
      .in("id", selectedIds);

    if (error) {
      console.error(error);
      setMsg("Ошибка массового изменения статуса.");
      return;
    }

    for (const shipment of selectedShipments) {
      await createTrackingEvent(shipment, bulkStatus, shipment.location);
    }

    setMsg(`Статус обновлён у ${selectedIds.length} посылок.`);
    closeSelectionMode();
   await Promise.all([loadShipments(), loadStats()]);
  };

  const bulkUpdateBatch = async () => {
    if (selectedIds.length === 0) {
      setMsg("Выберите хотя бы одну посылку.");
      return;
    }

    const normalizedBatchCode = bulkBatchCode.trim().toUpperCase();

    if (!normalizedBatchCode) {
      setMsg("Введите код партии.");
      return;
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("shipments")
      .update({
        batch_code: normalizedBatchCode,
        updated_at: now,
      })
      .in("id", selectedIds);

    if (error) {
      console.error(error);
      setMsg("Ошибка массового изменения партии.");
      return;
    }

    await supabase.from("batches").upsert(
      {
        batch_code: normalizedBatchCode,
        status: "china_warehouse",
        updated_at: now,
      },
      { onConflict: "batch_code" }
    );

    setMsg(
      `${selectedIds.length} посылок перенесены в партию ${normalizedBatchCode}.`
    );
    setBulkBatchCode("");
    closeSelectionMode();
   await Promise.all([loadShipments(), loadStats(), loadBatchOptions()]);
  };

  const cleanRowValue = (value: any) => String(value || "").trim();

  const processExcelFile = async (file: File) => {
  setMsg("");

  try {
    const data = await file.arrayBuffer();
    const XLSX = await import("xlsx");

    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    if (!rows.length) {
      setMsg("Файл пустой или не удалось прочитать строки.");
      return;
    }

    const now = new Date().toISOString();

    const preparedRows = rows
      .map((row) => {
        const normalizedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key.trim(), value])
        );

        let client_code = cleanRowValue(normalizedRow.client_code);

        if (!client_code) {
          client_code = "unknown";
        }

        const tracking_code = cleanRowValue(
          normalizedRow.tracking_code
        ).toUpperCase();

        const batch_code = cleanRowValue(
          normalizedRow.batch_code
        ).toUpperCase();

        const status = cleanRowValue(normalizedRow.status);
        const location = cleanRowValue(normalizedRow.location) || "Гуанчжоу";
        const weightRaw = normalizedRow.weight;

        if (!tracking_code || !validStatuses.includes(status)) {
          return null;
        }

        return {
          client_code,
          tracking_code,
          batch_code: batch_code || null,
          status,
          location,
          weight: weightRaw ? Number(weightRaw) : null,
          updated_at: now,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const skippedCount = rows.length - preparedRows.length;

    if (preparedRows.length === 0) {
      setMsg(`Не найдено подходящих строк. Пропущено: ${skippedCount}.`);
      return;
    }

    const { error } = await supabase.from("shipments").upsert(preparedRows, {
      onConflict: "tracking_code",
    });

    if (error) {
      console.error("Ошибка bulk Excel import:", error);
      setMsg("Ошибка импорта Excel файла.");
      return;
    }

    const batchRows = Array.from(
      new Set(
        preparedRows
          .map((item) => item.batch_code)
          .filter((batch): batch is string => Boolean(batch))
      )
    ).map((batch_code) => ({
      batch_code,
      status: "china_warehouse",
      updated_at: now,
    }));

    if (batchRows.length > 0) {
      const { error: batchError } = await supabase.from("batches").upsert(
        batchRows,
        {
          onConflict: "batch_code",
        }
      );

      if (batchError) {
        console.error("Ошибка обновления партий:", batchError);
      }
    }

    setMsg(
      `Готово: добавлено/обновлено ${preparedRows.length}, пропущено ${skippedCount}.`
    );

    await Promise.all([loadShipments(), loadStats(), loadBatchOptions()]);
  } catch (error) {
    console.error(error);
    setMsg("Ошибка чтения Excel файла.");
  }
};

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  await processExcelFile(file);
  e.target.value = "";
};
  
  const exportSelectedShipments = async () => {
    if (selectedShipments.length === 0) {
      setMsg("Выберите посылки для экспорта.");
      return;
    }

    const rows = selectedShipments.map((item) => ({
      tracking_code: item.tracking_code,
      client_code: item.client_code,
      batch_code: item.batch_code,
      status: item.status,
      location: item.location,
      weight: item.weight,
      note: item.note || "",
      created_at: item.created_at
        ? new Date(item.created_at).toLocaleString("ru-RU")
        : "",
      updated_at: item.updated_at
        ? new Date(item.updated_at).toLocaleString("ru-RU")
        : "",
    }));

    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "selected_shipments");
    XLSX.writeFile(workbook, "selected_shipments.xlsx");
  };

const tabs = [
  { key: "all", label: "Все", count: stats.total },
  { key: "active", label: "Активные", count: stats.active },
  { key: "ready", label: "Готовы к выдаче", count: stats.ready },
  { key: "completed", label: "Выдано", count: stats.completed },
  { key: "problem", label: "Проблемные", count: stats.problem },
  { key: "unknown", label: "Неизвестные", count: stats.unknown },
  { key: "comments", label: "С комментариями", count: stats.withComments },
];

const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

const paginatedShipments = shipments;

const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;

const endItem = Math.min(currentPage * pageSize, totalCount);


const allVisibleSelected =
  paginatedShipments.length > 0 &&
  paginatedShipments.every((item) => selectedIds.includes(item.id));

  return (
  <div className="mx-auto max-w-[1600px]">

        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ArrowLeft size={22} />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-950">Посылки</h1>
              <p className="mt-1 text-sm text-slate-500">
                Управление всеми посылками, статусами и партиями
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative w-full md:w-[420px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                placeholder="Поиск: трек, клиент, партия, локация..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              Добавить
            </button>

            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FileSpreadsheet size={18} />
              Excel
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          {[
            {
              label: "Всего",
              value: statsLoading ? "..." : stats.total,
              icon: Package,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
  
              {
  label: "Активные",
  value: statsLoading ? "..." : stats.active,
  icon: RefreshCw,
  color: "text-orange-600",
  bg: "bg-orange-50",
},
{
  label: "Готовы",
  value: statsLoading ? "..." : stats.ready,
  icon: CheckCircle2,
  color: "text-green-600",
  bg: "bg-green-50",
},
{
  label: "Выдано",
  value: statsLoading ? "..." : stats.completed,
  icon: CheckCircle2,
  color: "text-slate-600",
  bg: "bg-slate-50",
},
{
  label: "Проблемы",
  value: statsLoading ? "..." : stats.problem,
  icon: AlertTriangle,
  color: "text-red-600",
  bg: "bg-red-50",
},
{
  label: "Неизвестные",
  value: statsLoading ? "..." : stats.unknown,
  icon: HelpCircle,
  color: "text-yellow-700",
  bg: "bg-yellow-50",
},
{
  label: "С комментариями",
  value: statsLoading ? "..." : stats.withComments,
  icon: MessageSquare,
  color: "text-violet-600",
  bg: "bg-violet-50",
},
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {card.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {(showAddForm || showImportBox) && (
          <section className="mt-5 grid gap-5 xl:grid-cols-2">
            {showAddForm && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">
                  Добавить вручную
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Если клиент не найден, можно оставить код пустым — станет unknown.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    placeholder="Код клиента: 3X-4198"
                    value={form.client_code}
                    onChange={(e) =>
                      setForm({ ...form, client_code: e.target.value })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  />

                  <input
                    placeholder="Трек-код"
                    value={form.tracking_code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tracking_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  />

                  <input
                    placeholder="Партия: AUTO-001"
                    value={form.batch_code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        batch_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  />

                  <input
                    placeholder="Локация"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  />

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Вес, кг"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  onClick={addShipment}
                  className="mt-5 h-12 rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Добавить / обновить
                </button>
              </div>
            )}

            {showImportBox && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">
                  Импорт Excel
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Колонки: client_code, tracking_code, batch_code, status,
                  location, weight.
                </p>

                <label
  onDragOver={(e) => {
    e.preventDefault();
  }}
  onDrop={async (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processExcelFile(file);
  }}
  className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-300 hover:bg-blue-50"
>
                  <FileSpreadsheet size={34} className="text-blue-600" />
                  <span className="mt-3 text-lg font-bold text-slate-900">
                    Нажмите или перетащите Excel сюда
                  </span>
                  <span className="mt-1 text-sm text-slate-500">
                    .xlsx, .xls, .csv
                  </span>

                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {msg && (
          <div className="mt-5 rounded-2xl bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-700">
            {msg}
          </div>
        )}

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Все посылки</h2>
              <p className="mt-1 text-sm text-slate-500">
                Показано {shipments.length} из {totalCount} • Вес на странице:{" "}
                {shipments
                 .reduce((sum, item) => sum + (item.weight || 0), 0)
                  .toFixed(1)}{" "}
                   кг

              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
              >
                <option value="all">Все партии</option>
                {batchOptions.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>

              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
              >
                <option value="newest">Добавлено: новые</option>
                <option value="oldest">Добавлено: старые</option>
                <option value="updated_newest">Обновлено: новые</option>
                <option value="updated_oldest">Обновлено: старые</option>
              </select>

              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedIds([]);
                }}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Filter size={18} />
                {selectionMode ? "Отмена" : "Выбрать"}
              </button>

            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
           {tabs.map((tab) => (
  <button
    key={tab.key}
    onClick={() => setActiveTab(tab.key)}
    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
      activeTab === tab.key
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`}
  >
    <span>{tab.label}</span>
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        activeTab === tab.key
          ? "bg-white/20 text-white"
          : "bg-white text-slate-500"
      }`}
    >
      {tab.count}
    </span>
  </button>
))}
        
          </div>

          {selectionMode && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-white px-3 py-1 font-bold text-slate-900">
                    Выбрано: {selectedIds.length}
                  </span>

                  <label className="flex items-center gap-2 rounded-full bg-white px-3 py-1 font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                    />
                    Выбрать все видимые
                  </label>

                  <button
                    onClick={clearSelection}
                    className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Очистить
                  </button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-600"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={bulkUpdateStatus}
                    className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Изменить статус
                  </button>

                  <input
                    placeholder="Партия: AUTO-001"
                    value={bulkBatchCode}
                    onChange={(e) =>
                      setBulkBatchCode(e.target.value.toUpperCase())
                    }
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600"
                  />

                  <button
                    onClick={bulkUpdateBatch}
                    className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Привязать партию
                  </button>

                  <button
                    onClick={exportSelectedShipments}
                    className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Download size={17} />
                    Экспорт
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            {loading ? (
              <p className="py-10 text-center text-slate-500">Загрузка...</p>
            ) : (
              <table className="w-full min-w-[1150px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2">
                      {selectionMode ? "Выбор" : ""}
                    </th>
                    <th className="px-4 py-2">Дата</th>
                    <th className="px-4 py-2">Посылка</th>
                    <th className="px-4 py-2">Клиент</th>
                    <th className="px-4 py-2">Статус</th>
                    <th className="px-4 py-2">Вес</th>
                    <th className="px-4 py-2">Партия</th>
                    <th className="px-4 py-2">Локация</th>
                    <th className="px-4 py-2">Изменить статус</th>
                    <th className="px-4 py-2">Обновлено</th>
                    <th className="px-4 py-2 text-right">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedShipments.map((item) => (
                    <tr
                      key={item.id}
                      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 ${
                        item.note ? "bg-yellow-50/60" : ""
                      }`}
                    >
                      <td className="rounded-l-2xl px-4 py-4">
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectShipment(item.id)}
                            className="h-4 w-4"
                          />
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("ru-RU")
                          : "-"}
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/shipments/${encodeURIComponent(item.tracking_code)}`}
                          className="font-bold text-slate-950 hover:text-blue-600 hover:underline"
                        >
                          {item.tracking_code}
                        </Link>

                        {item.note && (
                          <div className="mt-2 flex w-fit items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                            <MessageSquare size={13} />
                            Комментарий
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {item.client_code === "unknown" ? (
                          <div className="flex flex-col items-start gap-2">
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              unknown
                            </span>

                            <button
                              onClick={() => assignClientToShipment(item.id)}
                              className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100"
                            >
                              Привязать
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={`/admin/clients/${item.client_code}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {item.client_code}
                          </Link>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                            statusStyles[item.status || ""] ||
                            "bg-slate-50 text-slate-600 ring-slate-100"
                          }`}
                        >
                          {item.status ? statusMap[item.status] || item.status : "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {item.weight ? `${item.weight} кг` : "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.batch_code || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.location || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={item.status || ""}
                          onChange={(e) => updateStatus(item.id, e.target.value)}
                          className="h-10 w-[190px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-blue-600"
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {item.updated_at ? (
                          <div>
                            <p>{new Date(item.updated_at).toLocaleDateString("ru-RU")}</p>
                            <p className="text-xs text-slate-400">
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

<td className="rounded-r-2xl px-4 py-4 text-right">
  <div className="flex justify-end">

    <Link
  href={`/admin/shipments/${encodeURIComponent(item.tracking_code)}`}
  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
>
  <MoreHorizontal size={20} />
</Link>

  </div>
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && shipments.length === 0 && (
              <div className="py-12 text-center">
                <Package className="mx-auto text-slate-300" size={42} />
                <p className="mt-3 font-semibold text-slate-700">
                  Посылки не найдены
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Измени фильтр или добавь новую посылку.
                </p>
              </div>
            )}
            {!loading && totalCount > 0 && (
  <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 md:flex-row md:items-center md:justify-between">
    <p className="text-sm text-slate-500">
      Показано {startItem}–{endItem} из {totalCount}
    </p>

    <div className="flex items-center gap-3">
      <button
        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        disabled={currentPage === 1}
        className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Назад
      </button>

      <div className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
        {currentPage} / {totalPages}
      </div>

      <button
        onClick={() =>
          setCurrentPage((page) => Math.min(totalPages, page + 1))
        }
        disabled={currentPage === totalPages}
        className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Далее
      </button>

      <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-600"
      >
        <option value={10}>10 на странице</option>
        <option value={20}>20 на странице</option>
        <option value={50}>50 на странице</option>
        <option value={100}>100 на странице</option>
      </select>
    </div>
  </div>
)}
          </div>
        </section>
        
         </div>
  );
}