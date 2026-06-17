import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function askAI(message: string, clientCode: string | null) {
  try {
    let context = "";
    if (clientCode) {
      const { data: shipments } = await supabase
        .from("shipments")
        .select("tracking_code, status, weight")
        .eq("client_code", clientCode)
        .not("status", "eq", "completed")
        .order("created_at", { ascending: false })
        .limit(5);

      const statusMap: Record<string, string> = {
        china_warehouse: "На складе в Китае",
        in_transit: "В пути",
        sorting: "На сортировке",
        bishkek_arrived: "Прибыл в Бишкек",
        ready_pickup: "Готов к выдаче",
      };

      if (shipments && shipments.length > 0) {
        context = `\nАктивные заказы клиента ${clientCode}:\n` + shipments.map(s =>
          `- Трек: ${s.tracking_code}, Статус: ${statusMap[s.status] || s.status}, Вес: ${s.weight}кг`
        ).join("\n");
      }
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: `Ты дружелюбный AI ассистент карго компании 3X Cargo (3xcargo.kg).
Отвечай как живой менеджер — тепло, по-человечески, на русском языке.
На простые вопросы типа "как дела?" отвечай естественно и с юмором.
Будь краток но информативен. Используй эмодзи умеренно.

О КОМПАНИИ 3X CARGO:
- Доставка товаров из Китая в Кыргызстан с 2019 года
- Сайт: 3xcargo.kg
- Телефон/WhatsApp: +996 220 343 053
- Instagram: @3xcargo.kg

ТАРИФЫ:
- Доставка: 2.8$ за кг
- Объёмный вес: Д×Ш×В / 6000 (если больше реального — считаем объёмный)

СРОКИ:
- Китай → Бишкек: 7-12 дней
- Хранение на складе в Бишкеке: 7 дней бесплатно

СКЛАД В КИТАЕ:
- Адрес склада выдаётся после регистрации в личном кабинете
- Город: Гуанчжоу

ВЫДАЧА В БИШКЕКЕ:
- Адрес: ул. Логвиненко 55А, Бишкек
- Часы работы: Пн-Сб 10:00-18:00
- При получении нужен код клиента (формат 3X-XXXX)

ОПЛАТА:
- Наличные при получении
- Перевод на карту
- Онлайн через личный кабинет

ЗАПРЕЩЁННЫЕ ТОВАРЫ:
- Оружие, наркотики, легковоспламеняющиеся жидкости
- Поддельные брендовые товары
- Скоропортящиеся продукты

БОНУСНАЯ ПРОГРАММА:
- Бронза (0-9 заказов): 1% кэшбэк
- Серебро (10-24): 3% кэшбэк
- Золото (25-49): 5% кэшбэк
- Платинум (50+): 8% кэшбэк

Если не знаешь ответа — скажи что уточнишь у менеджера: +996 220 343 053
${context}`,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    console.log("Anthropic response:", JSON.stringify(data).slice(0, 200));
    return data.content?.[0]?.text || "Извините, не смог обработать запрос.";
  } catch (e) {
    console.error("AI error:", e);
    return "Извините, произошла ошибка. Попробуйте позже.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const text: string = message.text || "";
    const username: string = message.from?.username || "";
    const firstName: string = message.from?.first_name || "";

    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const clientCode = parts[1]?.trim().toUpperCase();

      if (!clientCode) {
        await sendMessage(chatId,
          `👋 Привет, ${firstName}!\n\nЯ AI помощник 3X Cargo.\n\nДля привязки аккаунта введите:\n<code>/start ВАШ_КОД</code>\n\nНапример: <code>/start 3X-1234</code>`
        );
        return NextResponse.json({ ok: true });
      }

      const { data: client, error } = await supabase
        .from("clients")
        .select("id, client_code, first_name")
        .eq("client_code", clientCode)
        .single();

      if (error || !client) {
        await sendMessage(chatId, `❌ Клиент с кодом <b>${clientCode}</b> не найден.`);
        return NextResponse.json({ ok: true });
      }

      await supabase.from("telegram_bot_users").upsert({
        chat_id: chatId, username, first_name: firstName, client_code: clientCode,
      }, { onConflict: "chat_id" });

      await supabase.from("clients").update({ telegram_chat_id: chatId }).eq("client_code", clientCode);

      await sendMessage(chatId,
        `✅ Отлично, ${firstName}!\n\nТелеграм привязан к аккаунту <b>${clientCode}</b>.\n\nТеперь пишите любые вопросы — я отвечу с помощью AI! 🚀`
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/status") {
      const { data: botUser } = await supabase
        .from("telegram_bot_users")
        .select("client_code")
        .eq("chat_id", chatId)
        .single();

      if (!botUser) {
        await sendMessage(chatId, `Привяжите аккаунт командой:\n<code>/start ВАШ_КОД</code>`);
        return NextResponse.json({ ok: true });
      }

      const { data: shipments } = await supabase
        .from("shipments")
        .select("tracking_code, status, weight")
        .eq("client_code", botUser.client_code)
        .not("status", "eq", "completed")
        .order("created_at", { ascending: false })
        .limit(5);

      const statusMap: Record<string, string> = {
        china_warehouse: "🏭 На складе в Китае",
        in_transit: "🚢 В пути",
        sorting: "📦 На сортировке",
        bishkek_arrived: "🏙 Прибыл в Бишкек",
        ready_pickup: "✅ Готов к выдаче",
      };

      if (!shipments || shipments.length === 0) {
        await sendMessage(chatId, "У вас нет активных заказов.");
        return NextResponse.json({ ok: true });
      }

      const list = shipments.map(s =>
        `• <b>${s.tracking_code}</b>\n  ${statusMap[s.status] || s.status} · ${s.weight}кг`
      ).join("\n\n");

      await sendMessage(chatId, `📋 <b>Ваши активные заказы:</b>\n\n${list}`);
      return NextResponse.json({ ok: true });
    }

    if (text === "/help") {
      await sendMessage(chatId,
        `🤖 <b>Команды:</b>\n\n/start КОД — привязать аккаунт\n/status — статус заказов\n/help — помощь\n\nИли просто напишите вопрос — отвечу с AI! 💬`
      );
      return NextResponse.json({ ok: true });
    }

    const { data: botUser } = await supabase
      .from("telegram_bot_users")
      .select("client_code")
      .eq("chat_id", chatId)
      .single();

    await sendMessage(chatId, "⏳");
    const reply = await askAI(text, botUser?.client_code || null);
    await sendMessage(chatId, reply);

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ ok: true });
  }
}