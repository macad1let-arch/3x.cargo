"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const sendLead = async () => {
    setErrorText("");
    setSent(false);

    if (!phone.trim()) {
      setErrorText("Введите номер телефона или WhatsApp.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("leads").insert([
      {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
      },
    ]);

    setLoading(false);

    if (error) {
      setErrorText("Ошибка отправки. Проверьте подключение к базе.");
      console.error(error);
      return;
    }
    await fetch("/api/telegram", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name,
    phone,
    message,
  }),
});

    setName("");
    setPhone("");
    setMessage("");
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold">Оставить заявку</h1>

        <p className="mt-4 text-lg text-slate-600">
          Оставьте контакты — менеджер свяжется с вами и поможет с доставкой.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border border-slate-200 p-4 outline-none"
            />

            <input
              type="tel"
              placeholder="Телефон / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-2xl border border-slate-200 p-4 outline-none"
            />

            <textarea
              placeholder="Что хотите доставить?"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-2xl border border-slate-200 p-4 outline-none"
            />

            <button
              onClick={sendLead}
              disabled={loading}
              className="rounded-2xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Отправляем..." : "Отправить заявку"}
            </button>
          </div>
        </div>

        {sent && (
          <div className="mt-6 rounded-3xl bg-white p-6 text-slate-700 shadow-sm">
            Заявка отправлена. Скоро мы свяжемся с вами.
          </div>
        )}

        {errorText && (
          <div className="mt-6 rounded-3xl bg-red-50 p-6 text-red-700">
            {errorText}
          </div>
        )}
      </div>
    </main>
  );
}