import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ error: "Токен или chat_id не настроены" }, { status: 500 });
    }

    const { name, phone, message } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Телефон обязателен" }, { status: 400 });
    }

    const text = [
      "<b>Новая заявка — 3X Cargo</b>",
      "",
      `<b>Имя:</b> ${name || "Не указано"}`,
      `<b>Телефон:</b> ${phone}`,
      `<b>Сообщение:</b> ${message || "Не указано"}`,
      "",
      `<i>${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bishkek" })}</i>`,
    ].join("\n");

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Telegram API error:", err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Server error:", e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}