"use client";
import { useState } from "react";
import Link from "next/link";

const STEPS = [
  { n: 1, title: "Зарегистрируйтесь", desc: "Получите личный код клиента — он нужен для всех заказов", icon: "👤" },
  { n: 2, title: "Выберите товар", desc: "Найдите нужный товар на Taobao, 1688, Poizon или Pinduoduo", icon: "🛍️" },
  { n: 3, title: "Укажите наш адрес", desc: "При оформлении заказа вставьте адрес склада 3X Cargo в Гуанчжоу", icon: "📦" },
  { n: 4, title: "Товар едет к вам", desc: "7–12 дней — и посылка прибудет в Бишкек. Следите за статусом в разделе Заказы", icon: "✈️" },
  { n: 5, title: "Получите посылку", desc: "Приходите в пункт выдачи по адресу Логвиненко 55А или закажите доставку", icon: "✅" },
];

const MARKETPLACES = [
  {
    id: "taobao",
    name: "Taobao",
    color: "#ff6900",
    fields: [
      { label: "Регион", value: "广东省 广州市 荔湾区 站前街道", manual: true },
      { label: "Детальный адрес", value: "环市西路宇宙鞋城D543A档口 [ВАШ КОД]", copy: true },
      { label: "Получатель", value: "3X Cargo", copy: true },
      { label: "Телефон", value: "15739538448", copy: true },
    ],
  },
  {
    id: "1688",
    name: "1688",
    color: "#ff4a00",
    fields: [
      { label: "Регион", value: "广东省 广州市 荔湾区 站前街道", manual: true },
      { label: "Детальный адрес", value: "环市西路宇宙鞋城D543A档口 [ВАШ КОД]", copy: true },
      { label: "Получатель", value: "3X Cargo", copy: true },
      { label: "Телефон", value: "15739538448", copy: true },
      { label: "Индекс", value: "510145", copy: true },
    ],
  },
  {
    id: "pinduoduo",
    name: "Pinduoduo",
    color: "#e02e75",
    fields: [
      { label: "Получатель", value: "3X Cargo", copy: true },
      { label: "Телефон", value: "+8615739538448", copy: true },
      { label: "Регион", value: "广东省 广州市 荔湾区", manual: true },
      { label: "Детальный адрес", value: "环市西路宇宙鞋城D543A档口 [ВАШ КОД]", copy: true },
    ],
  },
  {
    id: "poizon",
    name: "Poizon",
    color: "#00b96b",
    fields: [
      { label: "Получатель", value: "3X Cargo", copy: true },
      { label: "Телефон", value: "15739538448", copy: true },
      { label: "Регион", value: "广东省 广州市 荔湾区 站前街道", manual: true },
      { label: "Детальный адрес", value: "环市西路宇宙鞋城D543A档口 [ВАШ КОД]", copy: true },
    ],
  },
];

const FAQS = [
  {
    icon: "⭐",
    title: "Бонусная программа",
    items: [
      "За каждый кг доставки начисляются бонусные баллы",
      "Бронза → Серебро → Золото → Платина",
      "Чем выше уровень — тем больше скидка",
      "Баллы можно использовать при оплате",
    ],
  },
  {
    icon: "👥",
    title: "Реферальная программа",
    items: [
      "Поделитесь своим кодом с другом",
      "Когда друг оформит первый заказ — вы получаете бонусы",
      "Нет ограничений на количество рефералов",
      "Бонусы зачисляются автоматически",
    ],
  },
  {
    icon: "📦",
    title: "Обрешётка (защита груза)",
    items: [
      "Хрупкие товары рекомендуем упаковывать в обрешётку",
      "Без обрешётки груз едет под ответственность клиента",
      "Стоимость уточняйте у менеджера",
      "Заказать можно через WhatsApp",
    ],
  },
  {
    icon: "⚖️",
    title: "Объёмный вес",
    items: [
      "Если коробка лёгкая но большая — считается объёмный вес",
      "Формула: Длина × Ширина × Высота / 6000",
      "Оплачивается больший из двух весов",
      "Используйте калькулятор на главной странице",
    ],
  },
  {
    icon: "🚫",
    title: "Запрещённые товары",
    items: [
      "Горючие и химические вещества",
      "Лекарства и наркотики",
      "Оружие и острые предметы",
      "Продукты питания",
      "Ноутбуки и смартфоны (только по согласованию)",
    ],
  },
];

export default function InstructionsPage() {
  const [activeMarket, setActiveMarket] = useState("taobao");
  const [copied, setCopied] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const copyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeMP = MARKETPLACES.find(m => m.id === activeMarket)!;

  return (
    <div style={{ background: "#f4f6f9", minHeight: "100vh", paddingBottom: 24 }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "16px 20px 14px", borderBottom: "1px solid #f0f2f5" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0a1e3d" }}>Инструкция</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Как заказывать из Китая</div>
      </div>

      <div style={{ padding: "16px 14px 0" }}>

        {/* Steps */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "18px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 14 }}>С чего начать</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {STEPS.map((step, idx) => (
              <div key={step.n} style={{ display: "flex", gap: 14, paddingBottom: idx < STEPS.length - 1 ? 16 : 0, position: "relative" }}>
                {idx < STEPS.length - 1 && (
                  <div style={{ position: "absolute", left: 19, top: 40, width: 2, height: "calc(100% - 24px)", background: "#e8f0fb" }} />
                )}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#eff6ff", border: "2px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                  {step.icon}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d" }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address card */}
        <div style={{ background: "linear-gradient(135deg, #0a1e3d, #005eaa)", borderRadius: 20, padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Адрес склада в Китае</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>环市西路宇宙鞋城D543A档口</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginBottom: 12 }}>Guangdong, Guangzhou, Liwan District</div>
          <button
            onClick={() => copyText("环市西路宇宙鞋城D543A档口", "Адрес")}
            style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {copied === "Адрес" ? "✓ Скопировано" : "Скопировать адрес"}
          </button>
        </div>

        {/* Marketplaces */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "18px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0a1e3d", marginBottom: 14 }}>Как заполнить адрес</div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
            {MARKETPLACES.map(m => (
              <button key={m.id} onClick={() => setActiveMarket(m.id)}
                style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                  background: activeMarket === m.id ? m.color : "#f1f5f9",
                  color: activeMarket === m.id ? "#fff" : "#64748b" }}>
                {m.name}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeMP.fields.map((field, idx) => (
              <div key={idx} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{field.label}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0a1e3d", lineHeight: 1.4, flex: 1 }}>{field.value}</div>
                  {field.manual && (
                    <span style={{ background: "#fff7ed", color: "#ea580c", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>Вручную</span>
                  )}
                  {field.copy && (
                    <button onClick={() => copyText(field.value, field.label + idx)}
                      style={{ background: copied === field.label + idx ? "#dcfce7" : "#eff6ff", color: copied === field.label + idx ? "#16a34a" : "#2563eb", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                      {copied === field.label + idx ? "✓" : "Копировать"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const all = activeMP.fields.filter(f => f.copy).map(f => `${f.label}: ${f.value}`).join("\n");
              copyText(all, "all_" + activeMP.id);
            }}
            style={{ width: "100%", marginTop: 14, background: activeMP.color, color: "#fff", border: "none", borderRadius: 14, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {copied === "all_" + activeMP.id ? "✓ Всё скопировано" : `Скопировать все данные ${activeMP.name}`}
          </button>
        </div>

        {/* FAQ blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} style={{ background: "#fff", borderRadius: 16, overflow: "hidden" }}>
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {faq.icon}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#0a1e3d" }}>{faq.title}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: openFaq === idx ? "rotate(180deg)" : "none", transition: ".2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openFaq === idx && (
                <div style={{ padding: "0 16px 14px 66px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {faq.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2563eb", marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0a1e3d" }}>Остались вопросы?</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Напишите нам в WhatsApp</div>
          </div>
          <a href="https://wa.me/996220343053" style={{ background: "#16a34a", color: "#fff", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
            Написать
          </a>
        </div>

      </div>
    </div>
  );
}