"use client";
export const dynamic = 'force-dynamic';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


type Branch = {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  working_hours: string;
};

type Client = {
  client_code: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  house: string;
  pickup_point: string;
};

type Shipment = {
  id: number;
  client_code: string;
  tracking_code: string;
  status: string | null;
  location: string | null;
  weight: number | null;
  created_at: string;
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

export default function DashboardPage() {
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.push("/login");
        return;
      }

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

     if (clientError || !clientData) {
        router.push("/login");
        return;
      }

      setClient(clientData);
      const { data: branchesData } = await supabase
        .from("branches")
        .select("*")
        .eq("country", "KG")
        .eq("is_active", true)
        .order("name");

      setBranches(branchesData || []);

      if (clientData.branch_id) {
        const { data: currentBranch } = await supabase
          .from("branches")
          .select("*")
          .eq("id", clientData.branch_id)
          .single();
        setSelectedBranch(currentBranch);
      }

      
   const { data: shipmentData, error: shipmentError } = await supabase
  .from("shipments")
  .select("*")
  .eq("user_id", authData.user.id)
  .order("created_at", { ascending: false });

      if (shipmentError) {
        console.error(shipmentError);
      }

      setShipments(shipmentData || []);

const { data: eventsData, error: eventsError } = await supabase
  .from("tracking_events")
  .select("*")
  .eq("client_code", clientData.client_code)
  .order("created_at", { ascending: false });

if (eventsError) {
  console.error(eventsError);
}

setTrackingEvents(eventsData || []);

setLoading(false);
    };

    loadDashboard();
  }, [router]);

  const activeShipments = useMemo(() => {
  return shipments.filter((item) =>
    activeStatuses.includes(item.status || "")
  );
}, [shipments]);

const historyShipments = useMemo(() => {
  return shipments.filter((item) => item.status === "completed");
}, [shipments]);

const getEventsByTrackingCode = (trackingCode: string) => {
  return trackingEvents.filter(
    (event) => event.tracking_code === trackingCode
  );
};
  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

const changeBranch = async (branchId: number) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;

    const { error } = await supabase
      .from("clients")
      .update({ branch_id: branchId })
      .eq("user_id", authData.user.id);

    if (!error) {
      const branch = branches.find((b) => b.id === branchId);
      setSelectedBranch(branch || null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f1ed] px-6 py-16">
        Загрузка...
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-[#f3f1ed] px-6 py-16">
        Профиль не найден.
      </main>
    );
  }

  const warehouseAddress =
    "China, Guangzhou, Warehouse 3X Cargo, Logvinenko Client Line";

  const receiver = `${client.client_code} ${client.first_name} ${client.last_name}`;
  const fullAddress = `${warehouseAddress}. Client code: ${client.client_code}`;
  const allMarketData = `Получатель: ${receiver}
Телефон: ${client.phone}
Адрес: ${fullAddress}
Комментарий: Client code: ${client.client_code}`;

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>

          <button
            onClick={logout}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Выйти
          </button>
        </div>

        <section className="grid gap-3 md:grid-cols-5">
          <Link href="/tracking" className="rounded-2xl bg-white p-5 shadow-sm">
            Отследить
          </Link>
          <Link href="/calculator" className="rounded-2xl bg-white p-5 shadow-sm">
            Калькулятор
          </Link>
          <a href="#active" className="rounded-2xl bg-white p-5 shadow-sm">
            Мои посылки
          </a>
          <a href="#history" className="rounded-2xl bg-white p-5 shadow-sm">
            История
          </a>
          <a href="#profile" className="rounded-2xl bg-white p-5 shadow-sm">
            Профиль
          </a>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">Ваш личный код</p>
          <h2 className="mt-3 text-5xl font-bold tracking-tight">
            {client.client_code}
          </h2>

          <p className="mt-4 text-slate-600">
            Используйте этот код при отправке товаров на склад в Китае.
          </p>

          <button
            onClick={() => copyText("Код скопирован", client.client_code)}
            className="mt-5 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white"
          >
            Скопировать код
          </button>

          {copied && <p className="mt-3 text-sm text-green-600">{copied}</p>}
        </section>

        <section id="active" className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Мои посылки</h2>

          {activeShipments.length === 0 ? (
            <p className="mt-3 text-slate-500">
              Активных посылок пока нет.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {activeShipments.map((item) => (
                <div key={item.id} className="rounded-2xl border p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Трек-код</p>
                      <h3 className="text-lg font-bold">{item.tracking_code}</h3>
                    </div>

                    <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                      {item.status ? statusMap[item.status] || item.status : "Статус не указан"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                    <p>Локация: {item.location || "-"}</p>
                    <p>Вес: {item.weight ? `${item.weight} кг` : "-"}</p>
                    <p>Код клиента: {item.client_code}</p>
                  </div>
                  <div className="mt-4 rounded-2xl border bg-slate-50">
  <button
    type="button"
    onClick={() =>
      setOpenHistory(
        openHistory === item.tracking_code ? null : item.tracking_code
      )
    }
    className="flex w-full items-center justify-between px-4 py-3 text-left"
  >
    <span className="text-sm font-semibold text-slate-700">
      История статуса
    </span>

    <span className="text-lg text-slate-500">
      {openHistory === item.tracking_code ? "↑" : "↓"}
    </span>
  </button>

  {openHistory === item.tracking_code && (
    <div className="border-t px-4 py-4">
      {getEventsByTrackingCode(item.tracking_code).length === 0 ? (
        <p className="text-sm text-slate-500">
          История появится после обновления статуса.
        </p>
      ) : (
        <div className="space-y-3">
          {getEventsByTrackingCode(item.tracking_code).map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-semibold text-slate-900">
                {event.status ? statusMap[event.status] || event.status : "-"}
              </p>

              <p className="text-xs text-slate-500">
                {event.created_at
                  ? new Date(event.created_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>

              {event.location && (
                <p className="text-xs text-slate-500">
                  Локация: {event.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="profile" className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Профиль</h2>
            <div className="mt-4 space-y-2 text-slate-700">
              <p>Имя: {client.first_name}</p>
              <p>Фамилия: {client.last_name}</p>
              <p>Телефон: {client.phone}</p>
              <p>Email: {client.email}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Адрес и пункт выдачи</h2>
            <div className="mt-4 space-y-2 text-slate-700">
              <p>Город: {client.city}</p>
              <p>
                Адрес: {client.street}, {client.house}
              </p>
              <p>Пункт выдачи: {client.pickup_point}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Полезная информация</h2>

          <div className="mt-4 space-y-3">
            {[
              ["Обучение", "Поможем разобраться, как покупать и продавать товары из Китая."],
              ["Покупка юаней", "Можно обменять юани для оплаты поставщиков."],
              ["Запрещённые товары", "Перед отправкой уточняйте ограничения у менеджера."],
              ["Обрешётка", "Для хрупких и ценных грузов можно заказать защитную обрешётку."],
            ].map(([title, text]) => (
              <details key={title} className="rounded-2xl border p-4">
                <summary className="cursor-pointer font-semibold">{title}</summary>
                <p className="mt-3 text-sm text-slate-600">{text}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Китай → Бишкек / Авто</h2>

          <div className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
            <p>Срок доставки: 7–12 дней</p>
            <p>Актуальный тариф: $2.8/кг</p>
            <p>Адрес склада: {warehouseAddress}</p>
            <p>Отправки: каждый день</p>
            <p>Выходные: только Китайский Новый год</p>
            <p>Заказов доставлено: 500 000+</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">Pinduoduo — как заполнить адрес</h2>

  <p className="mt-2 text-sm text-slate-500">
    Данные подставлены автоматически. Нажмите “Скопировать” и вставьте в нужное поле.
  </p>

  {copied && (
    <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
      {copied}
    </p>
  )}

  <div className="mt-5 flex justify-center">
    <div className="relative w-full max-w-[430px] rounded-3xl bg-white shadow-sm">
      <img
        src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/site-images/pdd.png%20(1).png"
        alt="Pinduoduo address form"
        className="w-full rounded-3xl"
      />

      <div className="absolute left-[96px] top-[60px] right-[24px] flex items-center justify-between gap-2">
        <span className="max-w-[230px] bg-white text-[15px] font-medium text-slate-900">
          {receiver}
        </span>
        <button
          onClick={() => copyText("Получатель скопирован", receiver)}
          className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[96px] top-[116px] right-[24px] flex items-center justify-between gap-2">
        <span className="bg-white text-[15px] font-medium text-slate-900">
          +8615739538448
        </span>
        <button
          onClick={() => copyText("Телефон скопирован", "+8615739538448")}
          className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[96px] top-[173px] right-[24px] flex items-center justify-between gap-2">
  <span className="max-w-[210px] bg-white px-1 text-[14px] font-medium text-slate-900">
    广东省 广州市 荔湾区
  </span>

  <span className="shrink-0 rounded-lg bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
    Выберите вручную
  </span>
</div>

      <div className="absolute left-[96px] top-[222px] right-[24px] flex items-start justify-between gap-2">
        <span className="max-w-[225px] bg-white text-[13px] font-medium leading-snug text-slate-900">
          环市西路宇宙鞋城D543A档口 {client.client_code}
        </span>
        <button
          onClick={() =>
            copyText(
              "Адрес скопирован",
              `环市西路宇宙鞋城D543A档口 ${client.client_code}`
            )
          }
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>
    </div>
  </div>

  <div className="mt-4 flex justify-center">
    <button
      onClick={() =>
        copyText(
          "Все данные скопированы",
          `收货人: ${receiver}
手机号: +8615739538448
地区: 广东省 广州市 荔湾区 站前街道
详细地址: 环市西路宇宙鞋城D543A档口 ${client.client_code}`
        )
      }
      className="w-full max-w-[430px] rounded-2xl bg-red-600 px-6 py-4 text-center font-semibold text-white"
    >
      Скопировать всё
    </button>
  </div>
</section>
<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">Taobao — как заполнить адрес</h2>

  <p className="mt-2 text-sm text-slate-500">
    В поле региона выберите адрес вручную, остальные данные можно скопировать.
  </p>

  {copied && (
    <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
      {copied}
    </p>
  )}

  <div className="mt-5 flex justify-center">
    <div className="relative w-full max-w-[430px] rounded-3xl bg-white shadow-sm">
      <img
        src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/site-images/taobao.png"
        alt="Taobao address form"
        className="w-full rounded-3xl"
      />

      <div className="absolute right-[255px] top-[44px]">
  <span className="rounded-lg bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
    Выберите вручную
  </span>
</div>

      <div className="absolute left-[28px] top-[135px] right-[24px] flex items-center justify-between gap-2">
        <span className="max-w-[250px] bg-white text-[14px] font-medium text-slate-900">
          环市西路宇宙鞋城D543A档口 {client.client_code}
        </span>
        <button
          onClick={() =>
            copyText(
              "Адрес скопирован",
              `环市西路宇宙鞋城D543A档口 ${client.client_code}`
            )
          }
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[28px] top-[210px] right-[24px] flex items-center justify-between gap-2">
        <span className="max-w-[250px] bg-white text-[15px] font-medium text-slate-900">
          {receiver}
        </span>
        <button
          onClick={() => copyText("Получатель скопирован", receiver)}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[72px] top-[260px] right-[24px] flex items-center justify-between gap-2">
        <span className="bg-white text-[15px] font-medium text-slate-900">
          15739538448
        </span>
        <button
          onClick={() => copyText("Телефон скопирован", "15739538448")}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>
    </div>
  </div>

  <div className="mt-4 flex justify-center">
    <button
      onClick={() =>
        copyText(
          "Все данные Taobao скопированы",
          `地区: 广东省 广州市 荔湾区 站前街道
详细地址: 环市西路宇宙鞋城D543A档口 ${client.client_code}
收货人: ${receiver}
手机号: 15739538448`
        )
      }
      className="w-full max-w-[430px] rounded-2xl bg-orange-600 px-6 py-4 text-center font-semibold text-white"
    >
      Скопировать всё
    </button>
  </div>
</section>
<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">1688 — как заполнить адрес</h2>

  <p className="mt-2 text-sm text-slate-500">
    Регион выберите вручную, остальные данные можно скопировать и вставить в поля.
  </p>

  {copied && (
    <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
      {copied}
    </p>
  )}

  <div className="mt-5 flex justify-center">
    <div className="relative w-full max-w-[430px] rounded-3xl bg-white shadow-sm">
      <img
        src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/site-images/1688.png"
        alt="1688 address form"
        className="w-full rounded-3xl"
      />

      <div className="absolute right-[28px] top-[300px]">
        <span className="rounded-lg bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
          Выберите вручную
        </span>
      </div>

      <div className="absolute left-[185px] top-[372px] right-[28px] flex items-center justify-between gap-2">
        <span className="max-w-[190px] bg-white/95 px-1 text-[13px] font-medium leading-snug text-slate-900">
          环市西路宇宙鞋城D543A档口 {client.client_code}
        </span>
        <button
          onClick={() =>
            copyText(
              "Адрес скопирован",
              `环市西路宇宙鞋城D543A档口 ${client.client_code}`
            )
          }
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[185px] top-[465px] right-[28px] flex items-center justify-between gap-2">
        <span className="max-w-[190px] bg-white/95 px-1 text-[14px] font-medium text-slate-900">
          {receiver}
        </span>
        <button
          onClick={() => copyText("Получатель скопирован", receiver)}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[228px] top-[533px] right-[8px] flex items-center justify-between gap-2">
  <span className="bg-white/95 px-1 text-[14px] font-medium text-slate-900">
    15739538448
  </span>

  <button
    onClick={() => copyText("Телефон скопирован", "15739538448")}
    className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white"
  >
    Скопировать
  </button>
</div>

      <div className="absolute left-[185px] top-[591px] right-[28px] flex items-center justify-between gap-2">
        <span className="bg-white/95 px-1 text-[14px] font-medium text-slate-900">
          510145
        </span>
        <button
          onClick={() => copyText("Индекс скопирован", "510145")}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>
    </div>
  </div>

  <div className="mt-4 flex justify-center">
    <button
      onClick={() =>
        copyText(
          "Все данные 1688 скопированы",
          `地区: 广东省 广州市 荔湾区 站前街道
地址: 环市西路宇宙鞋城D543A档口 ${client.client_code}
姓名: ${receiver}
手机号: 15739538448
邮政编码: 510145`
        )
      }
      className="w-full max-w-[430px] rounded-2xl bg-orange-600 px-6 py-4 text-center font-semibold text-white"
    >
      Скопировать всё
    </button>
  </div>
</section>
<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold">Poizon — как заполнить адрес</h2>

  <p className="mt-2 text-sm text-slate-500">
    Регион уже указан на скрине. Скопируйте получателя, телефон и детальный адрес.
  </p>

  {copied && (
    <p className="mt-3 rounded-xl bg-green-50 px-4 py-2 text-center text-sm font-medium text-green-700">
      {copied}
    </p>
  )}

  <div className="mt-5 flex justify-center">
    <div className="relative w-full max-w-[430px] rounded-3xl bg-white shadow-sm">
      <img
        src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/site-images/poizon.png"
        alt="Poizon address form"
        className="w-full rounded-3xl"
      />

      <div className="absolute left-[95px] top-[67px] right-[24px] flex items-center justify-between gap-2">
        <span className="max-w-[215px] bg-white/95 px-1 text-[14px] font-medium text-slate-900">
          {receiver}
        </span>
        <button
          onClick={() => copyText("Получатель скопирован", receiver)}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute left-[150px] top-[121px] right-[24px] flex items-center justify-between gap-2">
        <span className="bg-white/95 px-1 text-[14px] font-medium text-slate-900">
          15739538448
        </span>
        <button
          onClick={() => copyText("Телефон скопирован", "15739538448")}
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>

      <div className="absolute right-[178px] top-[152px]">
        <span className="rounded-lg bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700">
          Выберите вручную
        </span>
      </div>

      <div className="absolute left-[95px] top-[230px] right-[24px] flex items-start justify-between gap-2">
        <span className="max-w-[215px] bg-white/95 px-1 text-[13px] font-medium leading-snug text-slate-900">
          环市西路宇宙鞋城D543A档口 {client.client_code}
        </span>
        <button
          onClick={() =>
            copyText(
              "Адрес скопирован",
              `环市西路宇宙鞋城D543A档口 ${client.client_code}`
            )
          }
          className="shrink-0 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
        >
          Скопировать
        </button>
      </div>
    </div>
  </div>

  <div className="mt-4 flex justify-center">
    <button
      onClick={() =>
        copyText(
          "Все данные Poizon скопированы",
          `收货人: ${receiver}
手机号: 15739538448
所在地区: 广东省 广州市 荔湾区 站前街道
详细地址: 环市西路宇宙鞋城D543A档口 ${client.client_code}`
        )
      }
      className="w-full max-w-[430px] rounded-2xl bg-cyan-600 px-6 py-4 text-center font-semibold text-white"
    >
      Скопировать всё
    </button>
  </div>
</section>

        <section id="history" className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">История посылок</h2>

          {historyShipments.length === 0 ? (
            <p className="mt-3 text-slate-500">История пока пустая.</p>
          ) : (
            <div className="mt-5 grid gap-4">
              {historyShipments.map((item) => (
                <div key={item.id} className="rounded-2xl border p-5">
                  <p className="font-bold">{item.tracking_code}</p>
                  <p className="mt-2 text-sm text-slate-600">
{item.status ? statusMap[item.status] || item.status : "-"} •{" "}
{item.weight || "-"} кг
                  </p>
                  <div className="mt-4 rounded-2xl border bg-slate-50">
  <button
    type="button"
    onClick={() =>
      setOpenHistory(
        openHistory === item.tracking_code ? null : item.tracking_code
      )
    }
    className="flex w-full items-center justify-between px-4 py-3 text-left"
  >
    <span className="text-sm font-semibold text-slate-700">
      История статуса
    </span>

    <span className="text-lg text-slate-500">
      {openHistory === item.tracking_code ? "↑" : "↓"}
    </span>
  </button>

  {openHistory === item.tracking_code && (
    <div className="border-t px-4 py-4">
      {getEventsByTrackingCode(item.tracking_code).length === 0 ? (
        <p className="text-sm text-slate-500">
          История появится после обновления статуса.
        </p>
      ) : (
        <div className="space-y-3">
          {getEventsByTrackingCode(item.tracking_code).map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-semibold text-slate-900">
                {event.status ? statusMap[event.status] || event.status : "-"}
              </p>

              <p className="text-xs text-slate-500">
                {event.created_at
                  ? new Date(event.created_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>

              {event.location && (
                <p className="text-xs text-slate-500">
                  Локация: {event.location}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
                </div>
              ))}
            </div>
          )}
        </section>

<section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Пункт выдачи</h2>

          {selectedBranch && (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">{selectedBranch.name}</p>
              <p className="mt-1 text-sm text-blue-700">{selectedBranch.address}</p>
              <p className="text-sm text-blue-700">{selectedBranch.phone}</p>
              <p className="text-sm text-blue-700">{selectedBranch.working_hours}</p>
            </div>
          )}

          <div className="mt-4 grid gap-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => changeBranch(branch.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selectedBranch?.id === branch.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <p className="font-semibold">{branch.name}</p>
                <p className="text-sm text-slate-500">{branch.address}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Изменение данных</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <button className="rounded-2xl border px-5 py-4 font-semibold">
              Изменить профиль
            </button>
            <button className="rounded-2xl border px-5 py-4 font-semibold">
              Сменить пароль
            </button>
            <button className="rounded-2xl border px-5 py-4 font-semibold">
              Сменить email / телефон
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-blue-600 p-6 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold">Нужна помощь с доставкой?</h2>
          <p className="mt-2 text-blue-100">
            Оставьте заявку — менеджер свяжется с вами.
          </p>

          <Link
            href="/contact"
            className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 font-semibold text-blue-700"
          >
            Оставить заявку
          </Link>
        </section>
      </div>
    </main>
  );
}