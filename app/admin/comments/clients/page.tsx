"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Client = {
  id: number;
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
  created_at: string;
  updated_at: string | null;
};

export default function ClientNotesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .not("client_note", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setClients([]);
    } else {
      setClients((data || []).filter((client) => client.client_note?.trim()));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = clients.filter((client) => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`;
      const fullAddress = `${client.city || ""} ${client.street || ""} ${
        client.house || ""
      } ${client.pickup_point || ""}`;

      return (
        !q ||
        client.client_code?.toLowerCase().includes(q) ||
        fullName.toLowerCase().includes(q) ||
        client.phone?.toLowerCase().includes(q) ||
        client.email?.toLowerCase().includes(q) ||
        client.telegram_username?.toLowerCase().includes(q) ||
        fullAddress.toLowerCase().includes(q) ||
        client.client_note?.toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();

      if (sort === "oldest") return dateA - dateB;

      return dateB - dateA;
    });
  }, [clients, search, sort]);

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Заметки по клиентам</h1>
            <p className="mt-2 text-slate-600">
              Все клиенты, у которых есть внутренняя заметка менеджера.
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
              href="/admin/clients"
              className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
            >
              База клиентов
            </Link>

            <Link
              href="/admin"
              className="rounded-2xl bg-white px-5 py-3 font-semibold shadow-sm"
            >
              ← Назад в CRM
            </Link>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Клиентов с заметкой</p>
            <p className="mt-2 text-3xl font-bold">{clients.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Показано</p>
            <p className="mt-2 text-3xl font-bold">{filteredClients.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Сортировка</p>
            <p className="mt-2 text-lg font-bold">
              {sort === "newest" ? "Сначала новые" : "Сначала старые"}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold">Список заметок</h2>

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
                placeholder="Поиск: код, имя, телефон, заметка..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-600 md:w-[420px]"
              />
            </div>
          </div>

          {loading ? (
            <p className="mt-5 text-slate-500">Загрузка...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-3xl border bg-yellow-50/60 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        💬 Заметка клиента
                      </div>

                      <h3 className="mt-3 text-xl font-bold">
                        {client.client_code}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">
                          {client.first_name || "-"} {client.last_name || ""}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Телефон: {client.phone || "-"}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1">
                          Telegram: {client.telegram_username || "-"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-sm text-slate-500">
                          Заметка менеджера
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-slate-800">
                          {client.client_note}
                        </p>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        Обновлено:{" "}
                        {client.updated_at
                          ? new Date(client.updated_at).toLocaleString("ru-RU")
                          : "-"}
                      </p>
                    </div>

                    <Link
                      href={`/admin/clients/${client.client_code}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
                    >
                      Открыть клиента
                    </Link>
                  </div>
                </div>
              ))}

              {filteredClients.length === 0 && (
                <p className="text-slate-500">
                  Клиенты с заметками не найдены.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}