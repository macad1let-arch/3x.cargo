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
- Минимальный заказ: нет

СРОКИ:
- Китай → Бишкек: 7-12 дней
- Хранение на складе в Бишкеке: 7 дней бесплатно

СКЛАД В КИТАЕ:
- Адрес склада выдаётся после регистрации в личном кабинете (раздел "Инструкции")
- Город: Гуанчжоу

ВЫДАЧА В БИШКЕКЕ:
- Адрес: ул. Логвиненко 55А, Бишкек
- Часы работы: Пн-Сб 10:00-18:00
- При получении нужен код клиента (формат 3X-XXXX)

ОПЛАТА:
- Наличные при получении
- Перевод на карту
- Онлайн через личный кабинет (баланс)

ЗАПРЕЩЁННЫЕ ТОВАРЫ:
- Оружие и боеприпасы
- Наркотики
- Легковоспламеняющиеся жидкости
- Поддельные брендовые товары
- Скоропортящиеся продукты

БОНУСНАЯ ПРОГРАММА:
- Бронза (0-9 заказов): 1% кэшбэк
- Серебро (10-24 заказа): 3% кэшбэк
- Золото (25-49 заказов): 5% кэшбэк
- Платинум (50+ заказов): 8% кэшбэк

ЛИЧНЫЙ КАБИНЕТ:
- Регистрация на 3xcargo.kg
- Отслеживание заказов в реальном времени
- История заказов и бонусов
- Уведомления через Telegram, WhatsApp, Email

ЧАСТЫЕ ВОПРОСЫ:
- Как узнать адрес склада в Китае? → Зарегистрируйтесь на сайте, в разделе "Инструкции"
- Как отследить груз? → В личном кабинете или напишите трек-код мне
- Можно ли купить товар в Китае через вас? → Да, услуга выкупа доступна
- Как работает объёмный вес? → Если товар лёгкий но большой, считаем Д×Ш×В÷6000

Если клиент спрашивает статус заказа — используй данные из контекста ниже.
Если не знаешь ответа — скажи что уточнишь у менеджера и дай телефон: +996 220 343 053
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