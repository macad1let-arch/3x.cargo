import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const resend = new Resend(process.env.RESEND_API_KEY!);

async function sendTelegram(chatId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.ok;
}

async function sendEmail(to: string, title: string, message: string, trackingCode?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "3X Cargo <noreply@send.truvelax.com>",
      to,
      subject: title || "Уведомление от 3X Cargo",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="background: #0a1e3d; border-radius: 16px; padding: 24px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">3X Cargo</h1>
            <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0;">Уведомление</p>
          </div>
          <div style="background: #fff; border: 1px solid #e8edf2; border-radius: 16px; padding: 24px;">
            <h2 style="color: #0a1e3d; font-size: 16px; margin: 0 0 12px;">${title || "Уведомление"}</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">${message}</p>
            ${trackingCode ? `<div style="background: #eff6ff; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #005eaa; font-weight: 600;">📦 Трек-код: ${trackingCode}</div>` : ""}
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">3xcargo.kg</p>
        </div>
      `,
    });
    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return false;
    }
    console.log("Email sent:", data);
    return true;
  } catch (e) {
    console.error("Email exception:", e);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { client_code, title, message, tracking_code, channels } = await req.json();

    if (!client_code || !message) {
      return NextResponse.json({ error: "client_code и message обязательны" }, { status: 400 });
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select("telegram_chat_id, first_name, full_name, email")
      .eq("client_code", client_code)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    const selectedChannels = channels || ["telegram", "email"];
    let telegramSent = false;
    let emailSent = false;

    // Telegram
    if (selectedChannels.includes("telegram") && client.telegram_chat_id) {
      const text = [
        `<b>${title || "Уведомление от 3X Cargo"}</b>`,
        "",
        message,
        tracking_code ? `\n📦 Трек-код: <code>${tracking_code}</code>` : "",
      ].filter(Boolean).join("\n");
      telegramSent = await sendTelegram(client.telegram_chat_id, text);
    }

    // Email
    if (selectedChannels.includes("email") && client.email) {
      emailSent = await sendEmail(client.email, title, message, tracking_code);
    }

    // Сохраняем в базу
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
      email_sent: emailSent,
      has_telegram: !!client.telegram_chat_id,
      has_email: !!client.email,
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}