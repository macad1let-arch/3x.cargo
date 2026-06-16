"use client";
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Home,
  Package,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Activity,
  Boxes,
  Users,
  Warehouse,
  ClipboardList,
  CreditCard,
  CircleDollarSign,
  Target,
  MessageCircle,
  Bot,
  Handshake,
  BadgeJapaneseYen,
  GraduationCap,
  Bell,
  Megaphone,
  UserCog,
  BarChart3,
  Settings,
  Plane,
  Truck,
  Search,
  FileSpreadsheet,
  ScanLine,
  Send,
  MessageSquare,
  Plus,
  UserSearch,
  UserX,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  CalendarDays,
  ChevronDown,
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

export default function AdminPage() {

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState("");
  const loadShipments = async () => {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setShipments(data || []);
};

  useEffect(() => {
    loadShipments();
  }, []);

  const stats = useMemo(() => {
  const today = new Date().toDateString();

  return {
    total: shipments.length,
    todayAdded: shipments.filter(
      (s) => new Date(s.created_at).toDateString() === today
    ).length,
    active: shipments.filter((s) => s.status !== "completed").length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    bishkekArrived: shipments.filter((s) => s.status === "bishkek_arrived").length,
    ready: shipments.filter((s) => s.status === "ready_pickup").length,
    completed: shipments.filter((s) => s.status === "completed").length,
    problem: shipments.filter((s) => s.status === "problem").length,
    unknown: shipments.filter((s) => s.client_code === "unknown").length,
    withComments: shipments.filter((s) => s.note).length,
    totalWeight: shipments.reduce((sum, s) => sum + (s.weight || 0), 0),
  };
}, [shipments]);

const batchOptions = useMemo(() => {
  const batches = shipments
    .map((item) => item.batch_code)
    .filter((batch): batch is string => Boolean(batch));

  return Array.from(new Set(batches)).sort();
}, [shipments]);

const activeBatches = useMemo(() => {
  return batchOptions.filter((batch) => {
    const batchShipments = shipments.filter((s) => s.batch_code === batch);
    return !batchShipments.every((s) => s.status === "completed");
  });
}, [batchOptions, shipments]);


const kpiCards = [
  {
    label: "Посылок всего",
    value: stats.total,
    icon: Package,
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    text: "text-blue-600",
    sub: `Сегодня добавлено: ${stats.todayAdded}`,
  },
  {
    label: "В пути",
    value: stats.inTransit,
    icon: Plane,
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    text: "text-orange-600",
    sub: "Едут в Кыргызстан",
  },
  {
    label: "Прибыло в Бишкек",
    value: stats.bishkekArrived,
    icon: Truck,
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    text: "text-violet-600",
    sub: "На месте",
  },
  {
    label: "Готово к выдаче",
    value: stats.ready,
    icon: CheckCircle2,
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    text: "text-green-600",
    sub: "Можно выдавать",
  },
  {
    label: "Выдано",
    value: stats.completed,
    icon: CheckCircle2,
    bg: "bg-slate-50",
    iconBg: "bg-slate-100",
    text: "text-slate-700",
    sub: "Завершено",
  },
  {
    label: "Проблемные",
    value: stats.problem,
    icon: AlertTriangle,
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    text: "text-red-600",
    sub: "Требуют внимания",
  },
  {
    label: "Неизвестные",
    value: stats.unknown,
    icon: HelpCircle,
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    text: "text-yellow-700",
    sub: "Без клиента",
  },
  {
    label: "Общий вес",
    value: `${stats.totalWeight.toFixed(1)} кг`,
    icon: Activity,
    bg: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    text: "text-cyan-700",
    sub: "По всем посылкам",
  },
];

const attentionItems = [
  {
    label: "Посылки без клиента",
    value: stats.unknown,
    href: "/admin/unknown",
    icon: UserX,
    color: "bg-orange-100 text-orange-700",
  },
  {
    label: "Проблемные посылки",
    value: stats.problem,
    href: "/admin/problems",
    icon: AlertCircle,
    color: "bg-red-100 text-red-700",
  },
  {
    label: "Готовы к выдаче",
    value: stats.ready,
    href: "/admin/shipments",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "С комментариями",
    value: stats.withComments,
    href: "/admin/comments",
    icon: MessageSquare,
    color: "bg-yellow-100 text-yellow-700",
  },
];

const recentEvents = shipments
  .slice(0, 5)
  .map((item) => ({
    title: `Посылка ${item.tracking_code}`,
    subtitle: item.status ? statusMap[item.status] || item.status : "Без статуса",
    time: item.updated_at || item.created_at,
  }));



const getBatchStatus = (batchShipments: Shipment[]) => {
  if (batchShipments.length === 0) return "Пустая";
  if (batchShipments.every((s) => s.status === "completed")) return "Завершена";
  if (batchShipments.some((s) => s.status === "problem")) return "Есть проблема";
  if (batchShipments.some((s) => s.status === "ready_pickup")) return "Готовы к выдаче";
  if (batchShipments.some((s) => s.status === "in_transit")) return "В пути";
  return "В работе";
};


const todayLabel = new Date().toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const weeklyStats = {
  shipments: shipments.filter((s) => new Date(s.created_at) >= weekAgo).length,
  completed: shipments.filter(
    (s) => s.status === "completed" && new Date(s.updated_at || s.created_at) >= weekAgo
  ).length,
  problems: shipments.filter(
    (s) => s.status === "problem" && new Date(s.updated_at || s.created_at) >= weekAgo
  ).length,
  weight: shipments
    .filter((s) => new Date(s.created_at) >= weekAgo)
    .reduce((sum, s) => sum + (s.weight || 0), 0),
};

return (
  <div className="mx-auto max-w-[1600px]">

 <div className="mb-6 flex items-start justify-between gap-4">
  <div className="flex items-start gap-4 -ml-1 -mt-1">
    <div className="pt-0.5">
      <h1 className="text-3xl font-bold leading-none text-slate-950">
        Главная
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Обзор и ключевые показатели
      </p>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <div className="relative w-[420px]">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        placeholder="Поиск по трек-коду, клиенту, телефону..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && search.trim()) {
            window.location.href = `/admin/shipments?search=${encodeURIComponent(
              search.trim()
            )}`;
          }
        }}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-5 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
      />
    </div>

    <Link
      href="/admin/shipments"
      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
    >
      <Plus size={22} />
    </Link>

    <Link
      href="/admin/notifications"
      className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      <Bell size={21} />
      {stats.problem + stats.unknown > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {stats.problem + stats.unknown}
        </span>
      )}
    </Link>

    <div className="hidden h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm xl:flex">
      <CalendarDays size={18} className="text-slate-400" />
      {todayLabel}
    </div>

    <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        A
      </div>
      <span className="hidden text-sm font-semibold text-slate-700 xl:block">
        Админ
      </span>
      <ChevronDown size={16} className="hidden text-slate-400 xl:block" />
    </div>
  </div>
</div>
<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
  {kpiCards.map((card) => {
    const Icon = card.icon;



    return (
      <div
        key={card.label}
        className={`min-h-[142px] rounded-2xl border border-white/70 ${card.bg} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{card.sub}</p>
          </div>

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${card.iconBg} ${card.text}`}
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  })}
</section>

<section className="mt-5 grid gap-5 xl:grid-cols-3">
  <div className="rounded-3xl bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-950">Требует внимания</h2>
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
        {attentionItems.reduce((sum, item) => sum + item.value, 0)}
      </span>
    </div>

    <div className="space-y-3">
      {attentionItems.map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.label}
      href={item.href}
      className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.color}`}>
          <Icon size={20} strokeWidth={2} />
        </div>

        <div>
          <p className="font-semibold text-slate-900">{item.label}</p>
          <p className="mt-1 text-xs text-slate-500">Открыть список</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${item.color}`}>
          {item.value}
        </span>
        <ChevronRight size={18} className="text-slate-300" />
      </div>
    </Link>
  );
})}
    </div>
  </div>

  <div className="rounded-3xl bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-950">Последние события</h2>
      <span className="text-xs font-semibold text-slate-400">Live</span>
    </div>

    <div className="space-y-4">
      {recentEvents.map((event, index) => (
        <div
          key={`${event.title}-${index}`}
          className="flex items-start gap-3 rounded-2xl p-3 hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
  <Package size={20} strokeWidth={2} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">
              {event.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{event.subtitle}</p>
          </div>

          <span className="text-xs text-slate-400">
            {new Date(event.time).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  </div>

  <div className="rounded-3xl bg-white p-6 shadow-sm">
  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-xl font-bold text-slate-950">Статистика за неделю</h2>
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
      7 дней
    </span>
  </div>

  <div className="grid grid-cols-2 gap-3">
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">Посылок</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">
        {weeklyStats.shipments}
      </p>
    </div>

    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">Выдано</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">
        {weeklyStats.completed}
      </p>
    </div>

    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">Проблемы</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">
        {weeklyStats.problems}
      </p>
    </div>

    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">Вес</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">
        {weeklyStats.weight.toFixed(1)} кг
      </p>
    </div>
  </div>

  <div className="mt-5 rounded-2xl bg-blue-50 p-4">
    <p className="text-sm font-semibold text-blue-700">
      За последние 7 дней добавлено {weeklyStats.shipments} посылок.
    </p>
    <p className="mt-1 text-xs text-blue-600/70">
      Позже сюда можно добавить график по дням: посылки, выдачи и выручка.
    </p>
  </div>
</div>
</section>

<section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-slate-950">Быстрые действия</h2>
      <p className="mt-1 text-sm text-slate-500">
        Частые операции для работы с посылками
      </p>
    </div>
  </div>


<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
  {[
  { label: "Добавить посылку", desc: "Создать вручную", icon: Plus, href: "/admin/shipments" },
  { label: "Создать партию", desc: "Новая партия груза", icon: Boxes, href: "/admin/batches" },
  { label: "Найти посылку", desc: "По треку или клиенту", icon: Search, href: "/admin/shipments" },
  { label: "Импорт Excel", desc: "Загрузить список", icon: FileSpreadsheet, href: "/admin/shipments" },
  { label: "Принять оплату", desc: "Касса и баланс", icon: CreditCard, href: "/admin/cash" },
  { label: "Диалоги", desc: "Ответить клиенту", icon: MessageCircle, href: "/admin/dialogs" },
  { label: "Уведомления", desc: "Отправить клиентам", icon: Megaphone, href: "/admin/client-notifications" },
  { label: "AI ассистент", desc: "Автоответы", icon: Bot, href: "/admin/ai" },
].map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.label}
      href={item.href}
      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-sm"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <Icon size={21} strokeWidth={2} />
      </div>

      <p className="mt-4 font-bold text-slate-900">{item.label}</p>
      <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
    </Link>
  );
})}
  </div>
</section>
<section className="mt-5 grid gap-5 xl:grid-cols-2">
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-950">Активные партии</h2>
      <Link href="/admin/batches" className="text-sm font-bold text-blue-600">
        Смотреть все
      </Link>
    </div>

    <div className="space-y-3">
      {activeBatches.slice(0, 4).map((batch) => {
        const batchShipments = shipments.filter((s) => s.batch_code === batch);
        const batchWeight = batchShipments.reduce(
          (sum, s) => sum + (s.weight || 0),
          0
        );

        return (
          <Link
            key={batch}
            href="/admin/batches"
            className="block rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900">Партия {batch}</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {getBatchStatus(batchShipments)}
            </span>

            </div>

            <div className="mt-3 flex justify-between text-sm text-slate-500">
              <span>Посылок: {batchShipments.length}</span>
              <span>Вес: {batchWeight.toFixed(1)} кг</span>
            </div>
          </Link>
        );
      })}

      {activeBatches.length === 0 && (
        <p className="text-sm text-slate-500">Активных партий пока нет.</p>
      )}
    </div>
  </div>

  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-950">Система</h2>
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        Online
      </span>
    </div>

    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Всего партий</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">
          {batchOptions.length}
        </p>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Всего посылок в базе</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">
          {stats.total}
        </p>
      </div>
    </div>
  </div>
      </section>
    </div>
  );
}