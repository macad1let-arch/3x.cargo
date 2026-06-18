import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

async function askClaude(userMessage: string, context: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
     system: `Ты ассистент карго компании 3X Cargo. Отвечай коротко, чётко, без приветствий в каждом сообщении, без эмодзи, без звёздочек и markdown разметки. Только суть.

КОМПАНИЯ:
- Доставка из Китая в Кыргызстан с 2019 года
- Сайт: 3xcargo.kg
- WhatsApp/телефон: +996 220 343 053

ТАРИФЫ:
- 2.8$ за кг
- Объёмный вес: Д×Ш×В / 6000
- Сроки: 7-12 дней

СКЛАД В КИТАЕ: Гуанчжоу, адрес в личном кабинете → раздел "Инструкции"

ВЫДАЧА В БИШКЕКЕ:
- ул. Логвиненко 55А
- Пн-Сб 10:00-18:00
- Нужен код клиента (3X-XXXX)

ОПЛАТА: наличные, перевод на карту, онлайн через личный кабинет

ЗАПРЕЩЕНО: оружие, наркотики, легковоспламеняющиеся, подделки, скоропортящееся

БОНУСЫ:
- Новичок (0-2 заказа): 1%
- Бронза (3-10): 2%
- Серебро (11-25): 3%
- Золото (26-49): 5%
- Платина (50+): 7%

Если не знаешь ответа — дай телефон: +996 220 343 053
${context}`,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text || "Извините, не смог обработать запрос.";
}

export async function POST(req: NextRequest) {
  try {
    const { message, client_code } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "message обязателен" }, { status: 400 });
    }

    let context = "";

    // Если есть код клиента — берём его заказы
    if (client_code) {
      const { data: shipments } = await supabase
        .from("shipments")
        .select("tracking_code, status, weight, delivery_cost, created_at")
        .eq("client_code", client_code)
        .order("created_at", { ascending: false })
        .limit(5);

      if (shipments && shipments.length > 0) {
        const statusMap: Record<string, string> = {
          china_warehouse: "На складе в Китае",
          in_transit: "В пути",
          sorting: "На сортировке",
          bishkek_arrived: "Прибыл в Бишкек",
          ready_pickup: "Готов к выдаче",
          completed: "Выдан",
        };

        context = `\nЗаказы клиента ${client_code}:\n` + shipments.map(s =>
          `- Трек: ${s.tracking_code}, Статус: ${statusMap[s.status] || s.status}, Вес: ${s.weight}кг`
        ).join("\n");
      }
    }

    const reply = await askClaude(message, context);

    return NextResponse.json({ ok: true, reply });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}