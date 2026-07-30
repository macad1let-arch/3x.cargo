import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

type HistoryMessage = {
  role: "user" | "assistant";
  text: string;
};

const companyPrompt = `Ты — помощник карго-компании 3X Cargo, которая доставляет товары из Китая в Кыргызстан.

СТИЛЬ ОТВЕТОВ:
- Отвечай на русском языке понятно и доброжелательно.
- Сначала дай прямой ответ, затем короткие шаги, если они нужны.
- Не используй markdown-заголовки, звёздочки и лишние приветствия.
- Не придумывай цены, статусы и правила. Если данных недостаточно, предложи связаться с менеджером.
- Не обещай точную дату доставки: указывай обычный срок 7–12 дней.

ОСНОВНЫЕ ДАННЫЕ:
- Тариф доставки: 2,8 доллара за кг.
- Минимальный расчётный вес: 0,1 кг.
- Обычный срок доставки: 7–12 дней после отправки из Китая.
- Бесплатное хранение после прибытия: 7 дней.
- Объёмный вес: длина × ширина × высота / 6000. Оплачивается больший вес — фактический или объёмный.

СКЛАД В КИТАЕ:
- Получатель: 龙生 и индивидуальный код клиента.
- Телефон: 18745081507.
- Регион: 广东省 广州市 荔湾区.
- Подробный адрес: 站前路宇宙鞋城D区512-档口 и индивидуальный код клиента.
- Код клиента обязательно должен быть в получателе и в подробном адресе.

ВЫДАЧА В БИШКЕКЕ:
- Адрес: Логвиненко, 55А.
- Время работы: 10:00–19:00.
- Для получения нужен индивидуальный код клиента.
- Бесплатное хранение: 7 дней.

СТАТУСЫ:
- china_warehouse — посылка поступила на склад в Китае.
- in_transit — посылка находится в пути.
- sorting — посылка сортируется.
- bishkek_arrived — посылка прибыла в Бишкек.
- ready_pickup — посылка готова к выдаче.
- completed — посылка выдана.

ВАЖНО:
- Хрупкие товары лучше заранее согласовать и заказать защитную упаковку.
- Электронику, жидкости и другие особые категории нужно согласовать до покупки.
- Контакт менеджера и WhatsApp: +996 220 343 053.
- Сайт: 3xcargo.kg.
- Если пользователь спрашивает о своём заказе, используй только данные из раздела «ДАННЫЕ КЛИЕНТА» ниже.
- Если точного ответа нет, скажи об этом прямо и укажи номер +996 220 343 053.`;

async function askClaude({
  userMessage,
  history,
  clientContext,
}: {
  userMessage: string;
  history: HistoryMessage[];
  clientContext: string;
}) {
  const conversation = history
    .filter(
      (item) =>
        (item.role === "user" || item.role === "assistant") &&
        typeof item.text === "string",
    )
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.text.slice(0, 1500),
    }));

  conversation.push({
    role: "user",
    content: userMessage.slice(0, 2000),
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `${companyPrompt}\n\nДАННЫЕ КЛИЕНТА:\n${clientContext}`,
      messages: conversation,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  return (
    data.content?.find((item) => item.type === "text")?.text ||
    "Не удалось получить ответ. Напишите менеджеру: +996 220 343 053."
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: HistoryMessage[];
    };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Введите сообщение" },
        { status: 400 },
      );
    }

    const authorization = request.headers.get("authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    let clientContext =
      "Пользователь не авторизован. Не показывай данные заказов.";

    if (accessToken) {
      const {
        data: { user },
      } = await supabase.auth.getUser(accessToken);

      if (user) {
        const { data: client } = await supabase
          .from("clients")
          .select("client_code, first_name, last_name")
          .eq("user_id", user.id)
          .maybeSingle();

        if (client) {
          const { data: shipments } = await supabase
            .from("shipments")
            .select(
              "tracking_code, status, weight, chargeable_weight, delivery_cost, final_amount, created_at, updated_at",
            )
            .eq("client_code", client.client_code)
            .order("created_at", { ascending: false })
            .limit(10);

          const shipmentLines =
            shipments && shipments.length > 0
              ? shipments
                  .map(
                    (shipment) =>
                      `- ${shipment.tracking_code}: статус ${shipment.status}, вес ${
                        shipment.chargeable_weight ?? shipment.weight ?? "не указан"
                      } кг, к оплате ${
                        shipment.final_amount ??
                        shipment.delivery_cost ??
                        "не указано"
                      } сом`,
                  )
                  .join("\n")
              : "Заказов пока нет.";

          clientContext = [
            `Имя: ${client.first_name || ""} ${client.last_name || ""}`.trim(),
            `Индивидуальный код: ${client.client_code}`,
            "Последние заказы:",
            shipmentLines,
          ].join("\n");
        }
      }
    }

    const reply = await askClaude({
      userMessage: message,
      history: Array.isArray(body.history) ? body.history : [],
      clientContext,
    });

    return NextResponse.json({ ok: true, reply });
  } catch (error) {
    console.error("Assistant API error:", error);
    return NextResponse.json(
      { error: "Помощник временно недоступен" },
      { status: 500 },
    );
  }
}