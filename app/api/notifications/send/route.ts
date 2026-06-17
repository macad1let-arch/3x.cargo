import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendTelegram(chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  try {
    const { client_code, title, message, tracking_code } = await req.json();

    if (!client_code || !message) {
      return NextResponse.json({ error: "client_code и message обязательны" }, { status: 400 });
    }

    // Получаем данные клиента
    const { data: client, error } = await supabase
      .from("clients")
      .select("telegram_chat_id, first_name, full_name")
      .eq("client_code", client_code)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    let telegramSent = false;

    // Отправляем в Telegram если привязан
    if (client.telegram_chat_id) {
      const text = [
        `<b>${title || "Уведомление от 3X Cargo"}</b>`,
        "",
        message,
        tracking_code ? `\n📦 Трек-код: <code>${tracking_code}</code>` : "",
      ].filter(Boolean).join("\n");

      telegramSent = await sendTelegram(client.telegram_chat_id, text);
    }

    // Сохраняем в client_notifications
    await supabase.from("client_notifications").insert({
      client_code,
      title: title || "Уведомление",
      message,
      channel: "system",
      status: "sent",
      tracking_code: tracking_code || null,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      telegram_sent: telegramSent,
      has_telegram: !!client.telegram_chat_id,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}