"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Shipment = {
  id: number;
  client_code: string | null;
  name: string | null;
  tracking_code: string;
  status: string | null;
  location: string | null;
  weight: number | null;
  created_at: string;
};

export default function TrackingPage() {
  const [code, setCode] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const track = async () => {
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) return;

    setLoading(true);
    setSearched(false);
    setShipments([]);

    const { data, error } = await supabase
  .from("shipments")
  .select("*")
  .eq("tracking_code", cleanCode);

    setLoading(false);
    setSearched(true);

    if (error) {
      console.error(error);
      return;
    }

    setShipments(data || []);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Отслеживание груза
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Введите трек-код, чтобы проверить статус посылки.
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <input
            type="text"
            placeholder="Например: YT7537319919883"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 uppercase outline-none"
          />

          <button
            onClick={track}
            disabled={loading}
            className="mt-4 w-full rounded-2xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Ищем..." : "Отследить"}
          </button>
        </div>

        {shipments.length > 0 && (
          <div className="mt-6 space-y-4">
            {shipments.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  {item.tracking_code}
                </h2>

                <div className="mt-4 space-y-2 text-slate-700">
                  <p>Код клиента: {item.client_code || "-"}</p>
                  <p>Клиент: {item.name || "-"}</p>
                  <p>
                    Статус:{" "}
                    <span className="font-semibold text-slate-900">
                      {item.status || "-"}
                    </span>
                  </p>
                  <p>Локация: {item.location || "-"}</p>
                  <p>Вес: {item.weight ? `${item.weight} кг` : "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {searched && !loading && shipments.length === 0 && (
          <div className="mt-6 rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
            Посылка не найдена. Проверьте код или свяжитесь с менеджером.
          </div>
        )}
      </div>
    </main>
  );
}