import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = message.text || "";
  const username: string = message.from?.username || "";
  const firstName: string = message.from?.first_name || "";

  // Команда /start с кодом клиента: /start 3X-1234
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const clientCode = parts[1]?.trim().toUpperCase();

    if (!clientCode) {
      await sendMessage(chatId,
        `👋 Привет, ${firstName}!\n\nДля привязки Telegram введите:\n<b>/start ВАШ_КОД</b>\n\nНапример: <code>/start 3X-1234</code>\n\nКод клиента можно найти в личном кабинете на сайте.`
      );
      return NextResponse.json({ ok: true });
    }

    // Проверяем существует ли клиент
    const { data: client, error } = await supabase
      .from("clients")
      .select("id, client_code, first_name")
      .eq("client_code", clientCode)
      .single();

    if (error || !client) {
      await sendMessage(chatId,
        `❌ Клиент с кодом <b>${clientCode}</b> не найден.\n\nПроверьте код в личном кабинете.`
      );
      return NextResponse.json({ ok: true });
    }

    // Сохраняем chat_id
    await supabase.from("telegram_bot_users").upsert({
      chat_id: chatId,
      username,
      first_name: firstName,
      client_code: clientCode,
    }, { onConflict: "chat_id" });

    // Обновляем telegram_chat_id в clients
    await supabase
      .from("clients")
      .update({ telegram_chat_id: chatId })
      .eq("client_code", clientCode);

    await sendMessage(chatId,
      `✅ Отлично, ${firstName}!\n\nТелеграм успешно привязан к аккаунту <b>${clientCode}</b>.\n\nТеперь вы будете получать уведомления о своих грузах здесь.`
    );

    return NextResponse.json({ ok: true });
  }

  // Другие сообщения
  await sendMessage(chatId,
    `Для привязки аккаунта напишите:\n<code>/start ВАШ_КОД_КЛИЕНТА</code>`
  );

  return NextResponse.json({ ok: true });
}