import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GREEN_API_ID = process.env.GREEN_API_ID!;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

async function sendWhatsApp(phone: string, message: string) {
  const cleaned = phone.replace(/\D/g, "");
  const chatId = `${cleaned}@c.us`;
  await fetch(
    `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    }
  );
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
        max_tokens: 400,
        system: `Ты дружелюбный AI ассистент карго компании 3X Cargo.
Отвечай как живой менеджер — тепло, кратко, на языке клиента (русский/кыргызский/английский).
Используй эмодзи умеренно. Отвечай в формате WhatsApp — без HTML тегов.

О КОМПАНИИ:
- Доставка из Китая в Кыргызстан с 2019 года
- Сайт: 3xcargo.kg
- Телефон: +996 220 343 053
- Адрес выдачи: ул. Логвиненко 55А, Бишкек
- Часы работы: Пн-Сб 10:00-18:00

ТАРИФЫ:
- 2.8$ за кг
- Объёмный вес: Д×Ш×В / 6000
- Сроки: 7-12 дней

Если не знаешь — дай телефон менеджера: +996 220 343 053
${context}`,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    return data.content?.[0]?.text || "Извините, попробуйте позже.";
  } catch (e) {
    console.error("AI error:", e);
    return "Извините, произошла ошибка. Позвоните нам: +996 220 343 053";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("WhatsApp webhook:", JSON.stringify(body).slice(0, 200));

    // Green API формат
    const typeWebhook = body?.typeWebhook;

    // Обрабатываем только входящие сообщения
    if (typeWebhook !== "incomingMessageReceived") {
      return NextResponse.json({ ok: true });
    }

    const messageData = body?.messageData;
    const senderData = body?.senderData;

    if (!messageData || !senderData) {
      return NextResponse.json({ ok: true });
    }

    // Только текстовые сообщения
    if (messageData.typeMessage !== "textMessage") {
      return NextResponse.json({ ok: true });
    }

    const text = messageData.textMessageData?.textMessage || "";
    const senderPhone = senderData.sender?.replace("@c.us", "") || "";

    if (!text || !senderPhone) {
      return NextResponse.json({ ok: true });
    }

    // Ищем клиента по номеру телефона
    const { data: client } = await supabase
      .from("clients")
      .select("client_code, first_name")
      .eq("phone", `+${senderPhone}`)
      .single();

    // AI ответ
    const reply = await askAI(text, client?.client_code || null);
    await sendWhatsApp(senderPhone, reply);

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("WhatsApp webhook error:", e);
    return NextResponse.json({ ok: true });
  }
}
export async function GET() {
  return NextResponse.json({ ok: true, status: "WhatsApp webhook active" });
}