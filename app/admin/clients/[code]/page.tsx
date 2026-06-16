"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Client = {
  client_code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  street: string | null;
  house: string | null;
  pickup_point: string | null;
  telegram_username: string | null;
  client_note: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Shipment = {
  id: number;
  tracking_code: string;
  batch_code: string | null;
  status: string | null;
  location: string | null;
  weight: number | null;
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

export default function AdminClientPage() {
  const params = useParams();
  const router = useRouter();

  const code = decodeURIComponent(String(params.code || ""));

  const [client, setClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [clientNote, setClientNote] = useState("");
  const [noteMessage, setNoteMessage] = useState("");

const [editForm, setEditForm] = useState({
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  telegram_username: "",
  city: "",
  street: "",
  house: "",
  pickup_point: "",
});

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("client_code", code)
        .single();

      if (clientError) {
        console.error(clientError);
      }

      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("client_code", code)
        .order("created_at", { ascending: false });

      if (shipmentError) {
        console.error(shipmentError);
      }

      setClient(clientData || null);

if (clientData) {
  setClientNote(clientData.client_note || "");

  setEditForm({
    first_name: clientData.first_name || "",
    last_name: clientData.last_name || "",
    phone: clientData.phone || "",
    email: clientData.email || "",
    telegram_username: clientData.telegram_username || "",
    city: clientData.city || "",
    street: clientData.street || "",
    house: clientData.house || "",
    pickup_point: clientData.pickup_point || "",
  });
}
      setShipments(shipmentData || []);
      setLoading(false);
    };

    if (code) loadClient();
  }, [code]);
  const saveClientNote = async () => {
  if (!client) return;

  const { error } = await supabase
    .from("clients")
    .update({
      client_note: clientNote.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("client_code", code);

  if (error) {
  console.error("Ошибка сохранения заметки клиента:", error);
  alert(error.message);
  return;
}

  setClient({
    ...client,
    client_note: clientNote.trim() || null,
    updated_at: new Date().toISOString(),
  });

  setNoteMessage("Заметка клиента сохранена.");
};
const saveClientChanges = async () => {
  if (!client) return;

  const { error } = await supabase
    .from("clients")
    .update({
      first_name: editForm.first_name.trim() || null,
      last_name: editForm.last_name.trim() || null,
      phone: editForm.phone.trim() || null,
      email: editForm.email.trim() || null,
      telegram_username: editForm.telegram_username.trim() || null,
      city: editForm.city.trim() || null,
      street: editForm.street.trim() || null,
      house: editForm.house.trim() || null,
      pickup_point: editForm.pickup_point.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("client_code", code);

 if (error) {
  console.error("Ошибка сохранения заметки клиента:", error);
  alert(error.message || JSON.stringify(error));
  return;
}

  const updatedClient = {
    ...client,
    first_name: editForm.first_name.trim(),
    last_name: editForm.last_name.trim(),
    phone: editForm.phone.trim(),
    email: editForm.email.trim(),
    telegram_username: editForm.telegram_username.trim(),
    city: editForm.city.trim(),
    street: editForm.street.trim(),
    house: editForm.house.trim(),
    pickup_point: editForm.pickup_point.trim(),
    updated_at: new Date().toISOString(),
  };

  setClient(updatedClient);
  setEditMode(false);
};
  const activeCount = shipments.filter((s) => s.status !== "completed").length;
  const completedCount = shipments.filter((s) => s.status === "completed").length;
  const totalWeight = shipments.reduce((sum, s) => sum + (s.weight || 0), 0);

  if (loading) {

    
    return (
      <main className="min-h-screen bg-[#f3f1ed] px-6 py-10">
        Загрузка...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
       <div className="flex items-center justify-between">
  <button
    onClick={() => router.push("/admin/clients")}
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    ← К клиентам
  </button>

  <button
    onClick={() => router.push("/admin")}
    className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
  >
    Назад в CRM →
  </button>
</div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    <div>
      <p className="text-sm text-slate-500">Код клиента</p>
      <h1 className="mt-2 text-4xl font-bold">{code}</h1>
      {client?.client_note && (
  <div className="mt-3 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
    💬 Есть заметка по клиенту
  </div>
)}
    </div>

    {client && (
      <button
        onClick={() => setEditMode(!editMode)}
        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
      >
        {editMode ? "Закрыть редактирование" : "Редактировать"}
      </button>
    )}
  </div>

  {!client && (
    <p className="mt-4 text-red-600">
      Клиент не найден в базе clients.
    </p>
  )}
</section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего посылок</p>
            <p className="mt-2 text-3xl font-bold">{shipments.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Активные</p>
            <p className="mt-2 text-3xl font-bold">{activeCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Выдано</p>
            <p className="mt-2 text-3xl font-bold">{completedCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Общий вес</p>
            <p className="mt-2 text-3xl font-bold">{totalWeight} кг</p>
          </div>
        </section>

{client && (
  <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-xl font-bold">Заметка менеджера</h2>
        <p className="mt-1 text-sm text-slate-500">
          Внутренняя заметка по клиенту. Клиент её не видит.
        </p>
      </div>

      {client.client_note && (
        <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          💬 Есть заметка
        </span>
      )}
    </div>

    <textarea
      value={clientNote}
      onChange={(e) => setClientNote(e.target.value)}
      placeholder="Например: VIP клиент, часто забывает код, не выдавать без оплаты, звонить перед выдачей..."
      className="mt-4 min-h-[120px] w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
    />

    <button
      onClick={saveClientNote}
      className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
    >
      Сохранить заметку
    </button>
    {noteMessage && (
  <p className="mt-3 text-sm font-semibold text-green-700">
    {noteMessage}
  </p>
)}
  </section>
)}

{client && editMode && (
  <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
    <h2 className="text-xl font-bold">Редактировать клиента</h2>

    <div className="mt-5 grid gap-4 md:grid-cols-3">
      <input
        placeholder="Имя"
        value={editForm.first_name}
        onChange={(e) =>
          setEditForm({ ...editForm, first_name: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Фамилия"
        value={editForm.last_name}
        onChange={(e) =>
          setEditForm({ ...editForm, last_name: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Телефон"
        value={editForm.phone}
        onChange={(e) =>
          setEditForm({ ...editForm, phone: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Email"
        value={editForm.email}
        onChange={(e) =>
          setEditForm({ ...editForm, email: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Telegram"
        value={editForm.telegram_username}
        onChange={(e) =>
          setEditForm({ ...editForm, telegram_username: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Город"
        value={editForm.city}
        onChange={(e) =>
          setEditForm({ ...editForm, city: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Улица"
        value={editForm.street}
        onChange={(e) =>
          setEditForm({ ...editForm, street: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Дом"
        value={editForm.house}
        onChange={(e) =>
          setEditForm({ ...editForm, house: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />

      <input
        placeholder="Пункт выдачи"
        value={editForm.pickup_point}
        onChange={(e) =>
          setEditForm({ ...editForm, pickup_point: e.target.value })
        }
        className="rounded-2xl border px-4 py-3 outline-none focus:border-blue-600"
      />
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      <button
        onClick={saveClientChanges}
        className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white"
      >
        Сохранить изменения
      </button>

      <button
        onClick={() => setEditMode(false)}
        className="rounded-2xl bg-slate-100 px-6 py-3 font-semibold text-slate-700"
      >
        Отмена
      </button>
    </div>
  </section>
)}

        {client && (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Профиль клиента</h2>
              <div className="mt-4 space-y-2 text-slate-700">
                <p>Имя: {client.first_name}</p>
                <p>Фамилия: {client.last_name}</p>
                <p>Телефон: {client.phone}</p>
                <p>Email: {client.email}</p>
                <p>Telegram: {client.telegram_username || "-"}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Адрес клиента</h2>
              <div className="mt-4 space-y-2 text-slate-700">
                <p>Город: {client.city}</p>
                <p>Адрес: {client.street}, {client.house}</p>
                <p>Пункт выдачи: {client.pickup_point}</p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Посылки клиента</h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Трек</th>
                  <th>Партия</th>
                  <th>Статус</th>
                  <th>Локация</th>
                  <th>Вес</th>
                  <th>Дата</th>
                </tr>
              </thead>

              <tbody>
                {shipments.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-4 font-semibold">
  <Link
    href={`/admin/shipments/${item.tracking_code}`}
    className="text-blue-600 hover:underline"
  >
    {item.tracking_code}
  </Link>
</td>
                    <td>{item.batch_code || "-"}</td>
                    <td>
                      {item.status ? statusMap[item.status] || item.status : "-"}
                    </td>
                    <td>{item.location || "-"}</td>
                    <td>{item.weight ? `${item.weight} кг` : "-"}</td>
                    <td>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("ru-RU")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {shipments.length === 0 && (
              <p className="mt-5 text-slate-500">У клиента пока нет посылок.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}