import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const resend = new Resend(process.env.RESEND_API_KEY!);
const GREEN_API_ID = process.env.GREEN_API_ID!;
const GREEN_API_TOKEN = process.env.GREEN_API_TOKEN!;

const STATUS_LABELS: Record<string, string> = {
  china_warehouse: "На складе в Китае",
  in_transit:      "В пути",
  bishkek_arrived: "В Бишкеке",
  sorting:         "На сортировке",
  ready_pickup:    "Готов к выдаче",
  completed:       "Выдано",
  problem:         "Проблема",
};

const STATUS_MESSAGES: Record<string, string> = {
  china_warehouse: "Ваш груз поступил на склад в Китае и ожидает отправки.",
  in_transit:      "Ваш груз отправлен и в пути в Кыргызстан. Ожидаемое время доставки 7–14 дней.",
  bishkek_arrived: "Ваш груз прибыл в Бишкек и проходит таможенное оформление.",
  sorting:         "Ваш груз на сортировочном складе. Скоро будет готов к выдаче.",
  ready_pickup:    "Ваш груз готов к выдаче! Приходите за ним в удобное для вас время.",
  completed:       "Ваш груз успешно выдан. Спасибо, что выбрали 3X Cargo!",
  problem:         "По вашему грузу возникла проблема. Свяжитесь с нами для уточнения деталей.",
};

type Shipment = {
  tracking_code: string;
  weight: number | null;
  chargeable_weight: number | null;
};

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(chatId: number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    return res.ok;
  } catch { return false; }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
async function sendWhatsApp(phone: string, message: string) {
  try {
    const cleaned = phone.replace(/\D/g, "");
    const url = `https://api.green-api.com/waInstance${GREEN_API_ID}/sendMessage/${GREEN_API_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: `${cleaned}@c.us`, message }),
    });
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* not json */ }
    return res.ok && !data.error;
  } catch { return false; }
}

// ── Email ─────────────────────────────────────────────────────────────────────
async function sendEmail(
  to: string,
  title: string,
  message: string,
  shipments: Shipment[],
  batchCode: string,
) {
  try {
    const totalWeight = shipments.reduce((sum, s) => sum + (s.chargeable_weight ?? s.weight ?? 0), 0);

    const rows = shipments.map(s => {
      const w = s.chargeable_weight ?? s.weight ?? 0;
      return `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f4f8;font-size:13px;color:#0a1e3d;font-weight:600">${s.tracking_code}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f0f4f8;font-size:13px;color:#475569;text-align:center">${w} кг</td>
        </tr>`;
    }).join("");

    const { error } = await resend.emails.send({
      from: "3X Cargo <noreply@truvelax.com>",
      to,
      subject: title,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px">
          <div style="background:#0a1e3d;border-radius:16px;padding:24px;margin-bottom:20px;text-align:center">
            <h1 style="color:#fff;font-size:20px;margin:0">3X Cargo</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:4px 0 0">Обновление статуса груза</p>
          </div>

          <div style="background:#fff;border:1px solid #e8edf2;border-radius:16px;padding:24px;margin-bottom:16px">
            <h2 style="color:#0a1e3d;font-size:16px;margin:0 0 10px">${title}</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 18px">${message}</p>

            <div style="background:#f8fafc;border-radius:10px;padding:4px 0;margin-bottom:16px">
              <div style="padding:8px 14px;border-bottom:1px solid #e8edf2;display:flex;justify-content:space-between">
                <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Партия</span>
                <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Вес</span>
              </div>
              <div style="padding:8px 14px">
                <span style="font-size:13px;font-weight:700;color:#005eaa">${batchCode}</span>
              </div>
            </div>

            <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #e8edf2">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#94a3b8;text-align:left;text-transform:uppercase">Трек-код</th>
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;color:#94a3b8;text-align:center;text-transform:uppercase">Вес</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                <tr style="background:#eff6ff">
                  <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#0a1e3d">Итого: ${shipments.length} посылок</td>
                  <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#005eaa;text-align:center">${totalWeight.toFixed(2)} кг</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px">3xcargo.kg</p>
        </div>
      `,
    });
    if (error) { console.error("Resend error:", error); return false; }
    return true;
  } catch (e) { console.error("Email error:", e); return false; }
}

// ── Build text for TG / WA ────────────────────────────────────────────────────
function buildTextMessage(
  title: string,
  message: string,
  shipments: Shipment[],
  batchCode: string,
  isTelegram: boolean,
): string {
  const totalWeight = shipments.reduce((sum, s) => sum + (s.chargeable_weight ?? s.weight ?? 0), 0);

  const header = isTelegram
    ? `<b>${title}</b>\n\n${message}\n\n<b>Партия:</b> ${batchCode}\n`
    : `*${title}*\n\n${message}\n\nПартия: ${batchCode}\n`;

  const divider = isTelegram ? "─────────────────" : "-----------------";

  const rows = shipments.map((s, i) => {
    const w = s.chargeable_weight ?? s.weight ?? 0;
    return isTelegram
      ? `${i + 1}. <code>${s.tracking_code}</code>  —  ${w} кг`
      : `${i + 1}. ${s.tracking_code}  —  ${w} кг`;
  }).join("\n");

  const footer = isTelegram
    ? `\n${divider}\n<b>Итого:</b> ${shipments.length} посылок · ${totalWeight.toFixed(2)} кг`
    : `\n${divider}\nИтого: ${shipments.length} посылок · ${totalWeight.toFixed(2)} кг`;

  return header + "\n" + divider + "\n" + rows + footer;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { batch_code, status, channels: reqChannels } = await req.json();

    if (!batch_code || !status) {
      return NextResponse.json({ error: "batch_code и status обязательны" }, { status: 400 });
    }

    const selectedChannels: string[] = reqChannels || ["telegram", "whatsapp", "email"];
    const title = `Статус груза обновлён: ${STATUS_LABELS[status] || status}`;
    const message = STATUS_MESSAGES[status] || `Статус вашего груза изменён на: ${STATUS_LABELS[status] || status}`;

    // Все посылки партии
    const { data: allShipments } = await supabase
      .from("shipments")
      .select("client_code, tracking_code, weight, chargeable_weight")
      .eq("batch_code", batch_code)
      .neq("client_code", "unknown");

    if (!allShipments || allShipments.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "Нет клиентов в партии" });
    }

    // Группируем по client_code
    const byClient = new Map<string, Shipment[]>();
    for (const s of allShipments) {
      if (!byClient.has(s.client_code)) byClient.set(s.client_code, []);
      byClient.get(s.client_code)!.push({
        tracking_code: s.tracking_code,
        weight: s.weight,
        chargeable_weight: s.chargeable_weight,
      });
    }

    // Получаем данные клиентов
    const clientCodes = [...byClient.keys()];
    const { data: clients } = await supabase
      .from("clients")
      .select("client_code, telegram_chat_id, email, phone")
      .in("client_code", clientCodes);

    if (!clients || clients.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "Клиенты не найдены" });
    }

    let sent = 0, failed = 0;

    for (const client of clients) {
      const shipments = byClient.get(client.client_code) || [];
      let ok = false;

      if (selectedChannels.includes("telegram") && client.telegram_chat_id) {
        const text = buildTextMessage(title, message, shipments, batch_code, true);
        const result = await sendTelegram(client.telegram_chat_id, text);
        if (result) ok = true;
      }

      if (selectedChannels.includes("whatsapp") && client.phone) {
        const text = buildTextMessage(title, message, shipments, batch_code, false);
        const result = await sendWhatsApp(client.phone, text);
        if (result) ok = true;
      }

      if (selectedChannels.includes("email") && client.email) {
        const result = await sendEmail(client.email, title, message, shipments, batch_code);
        if (result) ok = true;
      }

      // Сохраняем в client_notifications
      await supabase.from("client_notifications").insert({
        client_code: client.client_code,
        title,
        message,
        channel: "system",
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      if (ok) sent++; else failed++;
    }

    return NextResponse.json({ ok: true, sent, failed, total: clients.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}