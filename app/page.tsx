"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GraduationCap,
  Package,
  Tag,
  Clock3,
  Coins,
  ShoppingCart,
  Store,
  Plane,
  Gift
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ChatWidget from "@/components/ChatWidget";
// ── DATA ──────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    bg: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/logo15.webp",
    bgMobile: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/logo4000.webp",
    objPos: "center 73%",
    eyebrow: "Карго из Китая для бизнеса и личных заказов",
    title: "2.8$/кг • 7–12 дней",
    btnText: "Получить код склада →",
    btnHref: "/learn",
  },
  {
    bg: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/logo14.webp",
    bgMobile: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/logo3000.webp",
    objPos: "center 88%",
    eyebrow: "✈️  Прямые рейсы Гуанчжоу → Бишкек",
    title: "Доставляем грузы из Китая",
    sub: "От 0.8$ до 2.8$ за кг · 7–12 дней",
    btnText: "Получить код клиента",
    btnHref: "/register",
  },
];
const HIW_STEPS = [
  { tag: "Шаг 1", title: "Регистрация",  desc: "Получите личный код клиента за 1 минуту — бесплатно",                       ssLabel: "Регистрация" },
  { tag: "Шаг 2", title: "Заказ товара", desc: "Укажите наш адрес склада при оформлении на Taobao, 1688, Poizon",           ssLabel: "Заказ" },
  { tag: "Шаг 3", title: "Приём и фото", desc: "Принимаем, фотографируем и проверяем каждый груз на складе в Китае",        ssLabel: "Фото груза" },
  { tag: "Шаг 4", title: "Доставка",     desc: "7–12 дней — Гуанчжоу → Бишкек без задержек",                               ssLabel: "Трекинг" },
];

const FAQS = [
  { q: "Как получить адрес склада в Китае?", a: "Зарегистрируйтесь на сайте — адрес склада и личный код клиента появятся в личном кабинете сразу после регистрации. Это бесплатно и занимает 1 минуту." },
  { q: "Как отследить свой груз?", a: "Введите трек-код в форму отслеживания на главной странице. Статус обновляется на каждом этапе — от склада в Китае до выдачи в Бишкеке." },
  { q: "Есть ли у вас обучение по закупкам из Китая?", a: "Да, проводим оффлайн-обучение в Бишкеке. Вы узнаете как находить поставщиков, делать заказы на Taobao, 1688, Poizon и правильно оформлять доставку. Подробнее на странице Обучение." },
  { q: "Доставляете ли вы оптовые и крупные партии товаров?", a: "Да, работаем как с физическими лицами, так и с ИП и юридическими лицами. Для оптовых заказов предусмотрены индивидуальные условия — напишите нам в WhatsApp." },
  { q: "Что такое объёмный вес и когда он применяется?", a: "Если посылка лёгкая но большая, стоимость считается по объёму: Длина × Ширина × Высота ÷ 6000. Берётся большее из двух значений — фактический или объёмный вес." },
  { q: "Какие товары запрещены к перевозке?", a: "К перевозке не принимаются горючие вещества, химикаты, лекарства, продукты питания, оружие, ноутбуки, смартфоны. Если вы не уверены, можно ли отправить товар, уточните у менеджера." },
  { q: "Есть ли минимальный вес заказа?", a: "Нет, мы доставляем как небольшие посылки, так и крупные партии товаров. Стоимость от 0.80$ - $2.8 за кг, срок доставки 7–12 дней." },
];

const STATUS_MAP: Record<string, string> = {
  china_warehouse: "На складе в Китае",
  in_transit:      "В пути",
  bishkek_arrived: "Прибыл в Бишкек",
  sorting:         "На сортировке",
  ready_pickup:    "Готов к выдаче",
  completed:       "Выдано",
  problem:         "Требует внимания",
};

const ScreenshotPlaceholder = ({ label }: { label: string }) => (
  <div style={{ marginTop: 16, borderRadius: 16, overflow: "hidden", background: "#f0f4f8", border: "1.5px dashed #c8d8ea", aspectRatio: "16/9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a0b4c8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    <span style={{ fontSize: 12, color: "#a0b4c8", fontWeight: 500 }}>Скриншот: {label}</span>
  </div>
);

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

   const OverlayZapresheno = () => (
  <>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(rgba(8,18,45,0.7), transparent)", pointerEvents: "none" }} />

    {/* Заголовок */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 16px 0", pointerEvents: "none", textAlign: "left" }}>
<div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
  Запрещено к перевозке
</div>
</div>

    {/* Подписи верхний ряд */}
<div style={{ position: "absolute", top: "41%", left: 0, right: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "0 14px", pointerEvents: "none", gap: 2 }}>
  {["Горючие вещества", "Химикаты", "Лекарства и наркотики"].map((label, i) => (
    <div key={i} style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.85)", textAlign: "center", borderRadius: 6, padding: "4px 3px", lineHeight: 1.3 }}>{label}</div>
  ))}
</div>

{/* Подписи нижний ряд */}
<div style={{ position: "absolute", top: "74%", left: 0, right: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "0 14px", pointerEvents: "none", gap: 2 }}>
  {["Продукты питания", "Оружие и острые предметы", "Ноутбуки и смартфоны"].map((label, i) => (
   <div key={i} style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.85)", textAlign: "center", borderRadius: 6, padding: "4px 3px", lineHeight: 1.3 }}>{label}</div>
  ))}
</div>

    {/* Градиент снизу */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent, rgba(8,18,45,0.7))", pointerEvents: "none" }} />
  </>
);

const OverlayObreshotka = () => (
  <>
    {/* Верхний градиент */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(rgba(8,18,45,0.7), transparent)", pointerEvents: "none" }} />


    {/* Заголовок */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 14px 0", pointerEvents: "none" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.55)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 3 }}>Хрупкий груз?</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
        Защитите обрешёткой
      </div>
    </div>

    {/* Нижний блок */}
<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
  <div style={{ height: 10 }} />
  
  {/* Текст — отдельно выше */}
  <div style={{ padding: "15px 14px 0px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <svg width="15" height="15" style={{ flexShrink: 0, marginTop: 2 }} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.4, fontWeight: 500 }}>
        Без обрешётки хрупкий груз отправляется{" "}
        <span style={{ fontWeight: 800, color: "#fff" }}>под ответственность клиента.</span>
      </span>
    </div>
  </div>

  {/* Кнопка — отдельно внизу */}
  <div style={{ padding: "6px 12px 26px" }}>
    <a href="https://wa.me/996220343053?text=Хочу заказать обрешётку"
   style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px", borderRadius: 12, background: "#fff", border: "none", textDecoration: "none", pointerEvents: "all" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      <span style={{ fontSize: 13, fontWeight: 800, color: "#005eaa" }}>Заказать обрешётку</span>
    </a>
  </div>
    <div style={{ height:0, background: "linear-gradient(rgba(5,15,50,0), rgba(5,15,50,0.6))" }} />
</div>
  </>
);

const OverlayObemnye = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130, background: "linear-gradient(to bottom, rgba(8,20,50,0.95) 0%, transparent 100%)", pointerEvents: "none" }} />
    
    {/* Заголовок */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "14px 14px 0", pointerEvents: "none" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 4 }}>
        Объёмные посылки
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5, fontWeight: 400, marginBottom: 6 }}>
        Если коробка легкая и занимает много места, стоимость рассчитывается по объёму
      </div>
      </div>

    {/* Нижний блок */}
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "50px 14px 16px", background: "linear-gradient(transparent, rgba(8,20,50,0.95))", pointerEvents: "none" }}>
      <a href="#calculator" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 14px", borderRadius: 12, background: "#fff", border: "none", textDecoration: "none", pointerEvents: "all" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#005eaa" strokeWidth="2.5" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <line x1="14" y1="14" x2="21" y2="14"/>
          <line x1="14" y1="17.5" x2="21" y2="17.5"/>
          <line x1="14" y1="21" x2="21" y2="21"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#005eaa" }}>Рассчитать стоимость</span>
      </a>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 6, textAlign: "center", fontWeight: 500 }}>Узнайте цену перед доставкой</div>
    </div>
  </>
);

const TabCard = React.memo(({ t, pos, activeTab, isMobile, tabs, setActiveTab }: {
  t: any, pos: number | null, activeTab: number, isMobile: boolean, tabs: any[], setActiveTab: (i: number) => void
}) => {
  const style: React.CSSProperties =
    pos === 0 ? { position: "absolute", width: "88%", maxWidth: 400, height: isMobile ? 320 : 420, top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", zIndex: 3, opacity: 1, borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.15)", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", willChange: "transform, opacity", backfaceVisibility: "hidden" as const }
    : pos === 1 ? { position: "absolute", width: "54%", maxWidth: 280, height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(calc(-50% + 42%), -50%) translateZ(0)", zIndex: 2, opacity: 0.55, borderRadius: 20, overflow: "hidden", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", willChange: "transform, opacity", backfaceVisibility: "hidden" as const }
    : pos === -1 ? { position: "absolute", width: "54%", maxWidth: 280, height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(calc(-50% - 42%), -50%) translateZ(0)", zIndex: 2, opacity: 0.55, borderRadius: 20, overflow: "hidden", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", willChange: "transform, opacity", backfaceVisibility: "hidden" as const }
    : { position: "absolute", opacity: 0, pointerEvents: "none" as const, zIndex: 1, width: "54%", height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", willChange: "transform, opacity", backfaceVisibility: "hidden" as const };

  return (
    <div style={style} onClick={() => {
      if (pos === 1) setActiveTab((activeTab + 1) % tabs.length);
      if (pos === -1) setActiveTab((activeTab - 1 + tabs.length) % tabs.length);
    }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <img src={t.img} alt={t.label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: t.objPos || "center 45%", display: "block", cursor: pos !== 0 ? "pointer" : "default" }} />
        <div style={{ position: "absolute", inset: 0, opacity: pos === 0 ? 1 : 0, transition: "opacity 0.3s", willChange: "opacity" }}>
          {t.overlay}
        </div>
      </div>
    </div>
  );
});
TabCard.displayName = "TabCard";

const OVERLAY_ZAPRESHENO = <OverlayZapresheno />;
const OVERLAY_OBRESHOTKA = <OverlayObreshotka />;
const OVERLAY_OBEMNYE = <OverlayObemnye />;

const BONUS_SLIDES = [
  {
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/at1.webp",
    overlay: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
    textPos: "center",
title: "До 5% бонусов на каждый заказ",
sub: "Копите и тратьте на доставки",
footer: false,
    btn: "",
    badge: "1 Бонус = 1 сом",
  },
  {
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/at3.webp",
    overlay: "linear-gradient(to bottom, rgba(20,10,80,0.75) 35%, rgba(20,10,80,0.2) 70%, transparent 60%), linear-gradient(to top, rgba(20,10,80,0.6) 0%, transparent 40%)",
    textPos: "top",
    title: "Пригласи друга",
    sub: "Друг получает 50 сом, а вы - 100 сом после его первого заказа.",
    badge: "+100 сом",
    btn: "",
  },
];

function BonusSlider() {
  const [idx, setIdx] = React.useState(0);
  const timerRef = React.useRef<any>(null);

  const reset = (i: number) => {
    setIdx(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % 2), 5000);
  };

  React.useEffect(() => {
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % 2), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div>
      <div style={{ position: "relative", borderRadius: 18, aspectRatio: "4/3", overflow: "hidden" }}>
        {BONUS_SLIDES.map((s, i) => (
         <div key={i} style={{ position: "absolute", inset: 0, opacity: idx === i ? 1 : 0, transition: "opacity 0.5s ease", pointerEvents: idx === i ? "all" : "none" }}>
  <img src={s.img} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center" }} />
  <div style={{ position: "absolute", inset: 0, background: s.overlay }} />
  <div style={{ position: "absolute", inset: 0, padding: s.textPos === "center" ? "20%" : "24px 20px", alignItems: s.textPos === "center" ? "center" : "flex-start", textAlign: s.textPos === "center" ? "center" : "left" as const, zIndex: 1 }}>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,215,0,0.2)", border: i === 0 ? "none" : "1px solid rgba(255,215,0,0.4)", color: i === 0 ? "#8B6000" : "#FFD700", fontSize: 12, fontWeight: 800, padding: "5px 12px", borderRadius: 999, marginBottom: 8, width: "fit-content" }}>{s.badge}</div>
    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.2, whiteSpace: "pre-line", textShadow: "0 2px 0 rgba(120,70,0,0.4), 0 4px 8px rgba(0,0,0,0.3)", letterSpacing: "-0.02em" }}>{s.title}</div>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginBottom: 12, lineHeight: 1.4, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{s.sub}</div>
    {s.btn && <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, width: "fit-content" }}>{s.btn}</div>}
  </div>
  {(s as any).footer && (
    <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16, zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", borderRadius: 999, padding: "6px 14px" }}>
        <span style={{ fontSize: 18 }}>🎁</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Бонус</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", borderRadius: 999, padding: "6px 14px" }}>
        <span style={{ fontSize: 18 }}>🪙</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Сом</span>
      </div>
    </div>
  )}
</div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
        {BONUS_SLIDES.map((_, i) => (
          <div key={i} onClick={() => reset(i)} style={{ height: 3, width: 40, borderRadius: 999, background: idx === i ? "#0a1e3d" : "rgba(10,30,61,0.15)", cursor: "pointer", transition: "background 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<"RU" | "KG">("RU");
  // Carousel
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselAnimating = useRef(false);
  const carouselTimer = useRef<ReturnType<typeof setInterval> | null>(null);

const resetCarouselTimer = useCallback(() => {
  if (carouselTimer.current) clearInterval(carouselTimer.current);
  carouselTimer.current = setInterval(() => {
    if (!carouselAnimating.current)
      setCarouselIdx(i => (i + 1) % 2);
  }, 10000);
}, []);

useEffect(() => {
  resetCarouselTimer();
  return () => { if (carouselTimer.current) clearInterval(carouselTimer.current); };
}, [resetCarouselTimer]);

  const goCarousel = (dir: 1 | -1) => {
    if (carouselAnimating.current) return;
    carouselAnimating.current = true;
    setCarouselIdx(i => (i + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
    resetCarouselTimer();
    setTimeout(() => { carouselAnimating.current = false; }, 500);
  };
  const goCarouselTo = (idx: number) => {
    if (carouselAnimating.current || idx === carouselIdx) return;
    carouselAnimating.current = true;
    setCarouselIdx(idx);
    resetCarouselTimer();
    setTimeout(() => { carouselAnimating.current = false; }, 500);
  };

  // Other state
  const [menuOpen, setMenuOpen]       = useState(false);
  const [trackCode, setTrackCode]     = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);
  const [weight, setWeight]           = useState<number | "">("");
  const [length, setLength]           = useState("");
  const [width, setWidth]             = useState("");
  const [height, setHeight]           = useState("");
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [formData, setFormData]       = useState({ name: "", phone: "", message: "" });
  const [formSent, setFormSent]       = useState(false);
  const [activeTab, setActiveTab]     = useState(0);
  const [isMobile, setIsMobile]       = useState(false);
  const handleSetActiveTab = useCallback((i: number) => setActiveTab(i), []);

  useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);
 const tabs = useMemo(() => [
  { label: "Запрещено",        img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/qqq2.webp",  overlay: OVERLAY_ZAPRESHENO, objPos: "center 48%" },
  { label: "Обрешётка",        img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/aw1.webp",   overlay: OVERLAY_OBRESHOTKA, objPos: "center 48%" },
  { label: "Объёмные посылки", img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/ChatGPT%20Image%20Jun%2016,%202026,%2004_01_47%20AM.png",    overlay: OVERLAY_OBEMNYE,   objPos: "center 45%" },
], []);

useEffect(() => {
  const durations = [5000, 10000, 10000];
  const timer = setTimeout(() => {
    handleSetActiveTab((activeTab + 1) % tabs.length);
  }, durations[activeTab]);
  return () => clearTimeout(timer);
}, [activeTab, tabs.length, handleSetActiveTab]);

const [topIdx, setTopIdx] = useState(0);

useEffect(() => {
  const t = setInterval(() => setTopIdx(p => (p + 1) % 2), 8000);
  return () => clearInterval(t);
}, []);

useEffect(() => {
  tabs.forEach(tab => {
    const img = new Image();
    img.src = tab.img;
  });
}, [tabs]);

  const pw = parseFloat(weight.toString()) || 0;
  const vw = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0
    ? (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 6000 : 0;
  const cw = Math.max(pw, vw);
  const price = pw > 0 ? (cw * 2.8).toFixed(2) : null;
  const isVol = vw > pw && pw > 0;

  const handleTrack = async () => {
    if (!trackCode.trim()) return;
    setTrackLoading(true); setTrackResult(null); setTrackSearched(false);
    const { data, error } = await supabase.from("shipments").select("*").eq("tracking_code", trackCode.trim().toUpperCase()).single();
    setTrackLoading(false); setTrackSearched(true);
    setTrackResult(!error && data ? data : null);
  };

 const handleFormSubmit = async () => {
  if (!formData.phone) return;
  try {
    const res = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormSent(true);
    } else {
      const err = await res.json();
      console.error("Telegram error:", err);
    }
  } catch (e) {
    console.error("Fetch error:", e);
  }
};

  return (
    <div style={{ fontFamily: "'Geologica', -apple-system, sans-serif", background: "#fff", color: "#0d1a2e", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geologica:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }

        /* ── CAROUSEL ── */
        .carousel-wrap {
          width: 100%; overflow: hidden; position: relative;
          padding: 24px 0 8px; background: #f5f7fa;
        }
        .carousel-track {
          display: flex; align-items: center; justify-content: center;
          position: relative; height: 500px;
        }
        @media (max-width: 480px) { .carousel-track { height: 440px; } }

        /* В <style> замени .c-slide: */
.c-slide {
  position: absolute; border-radius: 20px; overflow: hidden; cursor: pointer;
  transition: all 0.45s cubic-bezier(0.4,0,0.2,1);
  will-change: transform, opacity;
  transform: translateZ(0);  /* ← форсирует GPU-слой */
  backface-visibility: hidden;
}
        .c-slide img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; user-select: none; }
        .c-slide-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 60px 18px 20px;
          background: linear-gradient(transparent, rgba(5,15,40,0.88));
          pointer-events: none;
        }
        .c-slide-eyebrow { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.7); letter-spacing: .06em; margin-bottom: 5px; text-transform: uppercase; }
        .c-slide-title   { font-size: 20px; font-weight: 900; color: #fff; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 6px; }
        .c-slide-sub     { font-size: 11px; color: rgba(255,255,255,.72); line-height: 1.5; margin-bottom: 14px; }
        .c-slide-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px; background: #fff; color: #005eaa;
          font-size: 13px; font-weight: 800; text-decoration: none; pointer-events: all;
        }
        @media (max-width: 480px) {
          .c-slide-title { font-size: 17px; }
          .c-slide-sub   { display: none; }
          .c-slide-overlay { padding: 40px 14px 16px; }
        }
        .carousel-nav { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 18px; padding-bottom: 4px; }
        .carousel-arrow {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1.5px solid #dce4ef; background: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #0d1a2e; transition: background .15s, border-color .15s; flex-shrink: 0;
        }
        .carousel-arrow:hover { background: #e8f2fb; border-color: #005eaa; color: #005eaa; }
        .carousel-dot { height: 5px; border-radius: 999px; background: #dce4ef; cursor: pointer; transition: all .3s; flex-shrink: 0; }
        .carousel-dot.active { background: #005eaa; }

        /* ── LAYOUT ── */
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 768px) { .wrap { padding: 0 16px; } }
        .sec-pad { padding: 64px 24px; }
        @media (max-width: 768px) { .sec-pad { padding: 44px 16px; } }
        .ps-item-border + .ps-item-border { border-left: 1px solid #dce4ef; }

        /* ── MOBILE MENU ── */
        .mob-nav { position: fixed; inset: 0; z-index: 290; background: #fff; padding: 80px 24px 40px; overflow-y: auto; transform: translateX(100%); transition: transform .3s cubic-bezier(.4,0,.2,1); }
        .mob-nav.open { transform: translateX(0); }
        @media (min-width: 901px) { .hamburger-btn { display: none !important; } }
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .btn-reg-desk { display: none !important; } }

        /* ── FAQ ── */
        .faq-item.open { border-color: #005eaa !important; }

        /* ── HOVER ── */
        .nav-link:hover      { background: #e8f2fb !important; color: #005eaa !important; }
        .btn-outline-h:hover { border-color: #005eaa !important; color: #005eaa !important; }
        .track-btn-h:hover   { background: #004a8a !important; }
        .footer-link-h:hover { color: #fff !important; }

        /* ── TOPBAR MOBILE ── */
        @media (max-width: 768px) {
          .topbar-t { font-size: 12px !important; font-weight: 600 !important; white-space: nowrap; }
          .topbar-s { font-size: 10px !important; white-space: nowrap; }
          .topbar-icon { width: 28px !important; height: 28px !important; }
          .topbar-wrap { padding: 8px 10px !important; gap: 6px !important; }
        }
        @media (max-width: 480px) { .track-input { font-size: 13px !important; } }
        * { -webkit-font-smoothing: antialiased; }
          @keyframes progress {
  from { width: 0%; }
  to   { width: 100%; }
}
  @keyframes topbarSlide {
  0%    { opacity: 0; transform: translateY(10px); }
  3%    { opacity: 1; transform: translateY(0); }
  22%   { opacity: 1; transform: translateY(0); }
  25%   { opacity: 0; transform: translateY(-10px); }
  100%  { opacity: 0; transform: translateY(-10px); }
}@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=swap');

@import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
      `}</style>

      {/* ══ TOP BANNER ══ */}
<div style={{ background: "#052D75", overflow: "hidden", position: "relative", height: 60, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
  {[
    [
  { icon: <Package size={20} color="#F5B301" />, t: "500 000+", s: "доставленных грузов" },
  { icon: <GraduationCap size={20} color="#fff" />, t: "1000+", s: "обученных клиентов" },
],
   [
    { icon: <Gift size={22} color="#F5B301" />, t: "Получайте бонусы с каждого заказа", s: "+ 100 сом за приглашённого друга", sColor: "#F5B301", center: true },
],
  ].map((pair, idx) => (
    <div
  key={idx}
  style={{
    position: "absolute", inset: 0,
    display: "flex",
    opacity: topIdx === idx ? 1 : 0,
    transform: topIdx === idx ? "translateY(0)" : "translateY(100%)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
    pointerEvents: topIdx === idx ? "all" : "none",
  }}
>
      {pair.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "0 14px",
            position: "relative",
          }}
        >
          {i > 0 && (
            <div style={{ position: "absolute", left: 0, top: 16, bottom: 16, width: 1, background: "rgba(255,255,255,.1)" }} />
          )}
          <div style={{
  width: 34, height: 34, borderRadius: 10,
  background: "rgba(255,255,255,.08)",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
}}>
            {item.icon}
          </div>
          <div style={{ minWidth: 0, textAlign: (item as any).center ? "center" : "left" }}>
  <div style={{ color: "#fff", fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{item.t}</div>
  <div style={{ color: (item as any).sColor || "rgba(255,255,255,.55)", fontSize: 11, marginTop: 2, lineHeight: 1.2 }}>{item.s}</div>
</div>
</div>
      ))}
    </div>
  ))}
</div>

     <header style={{ position: "sticky", top: 0, zIndex: 300, background: "#fff", borderBottom: "1px solid #eef2f8" }}>
  <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 20px" }}>

    {/* Лого */}
    <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 2, lineHeight: 1 }}>
      <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 26, fontWeight: 800, color: "#052D75", letterSpacing: "-1.2px" }}>3X</span>
      <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 700, color: "#2A6BC4", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: 5 }}>CARGO</span>
    </a>

    {/* Правая часть */}
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      
      {/* Язык */}
      <button onClick={() => setLang(lang === "RU" ? "KG" : "RU")}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#4a6080", padding: "4px 6px", letterSpacing: ".04em" }}>
        {lang}
      </button>

      {/* Войти */}
      <a href="/login" style={{ fontSize: 13, fontWeight: 700, color: "#052D75", textDecoration: "none", background: "#f0f4f8", borderRadius: 10, padding: "7px 14px" }}>
        Войти
      </a>

      {/* Бургер */}
      <button onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, padding: "6px 4px", borderRadius: 10 }}>
        <span style={{ display: "block", width: 18, height: 2, background: "#052D75", borderRadius: 2 }} />
        <span style={{ display: "block", width: 18, height: 2, background: "#052D75", borderRadius: 2 }} />
        <span style={{ display: "block", width: 12, height: 2, background: "#052D75", borderRadius: 2 }} />
      </button>
    </div>

  </div>

  {/* Mobile menu */}
  {menuOpen && (
    <div className="mob-nav open">
      {[
        "#tracking|Отслеживание",
        "#services|Услуги",
        "#calculator|Калькулятор",
        "#info|Важно знать",
        "#faq|FAQ"
      ].map(item => {
        const [href, label] = item.split("|");
        return (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}
            style={{ display: "block", padding: "14px 0", fontSize: "1rem", fontWeight: 600, color: "#0d1a2e", textDecoration: "none", borderBottom: "1px solid #f0f4f8" }}>
            {label}
          </a>
        );
      })}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        <a href="/login" style={{ padding: 14, borderRadius: 14, background: "#f0f4f8", color: "#0d1a2e", textDecoration: "none", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
          Войти
        </a>
        <a href="/register" style={{ padding: 14, borderRadius: 14, background: "#052D75", color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
          Регистрация
        </a>
      </div>
    </div>
  )}
</header>

      {/* ══ HERO CAROUSEL ══ */}
<div
  style={{ background: "#f5f7fa", overflow: "hidden" }}
  onTouchStart={(e) => { (e.currentTarget as any)._tx = e.touches[0].clientX; }}
  onTouchEnd={(e) => {
    const dx = (e.currentTarget as any)._tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goCarousel(dx > 0 ? 1 : -1);
  }}
>
  <div style={{ position: "relative", width: "100%", height: isMobile ? 470 : 600, overflow: "hidden" }}>
    {HERO_SLIDES.slice(0, 2).map((s, i) => (
  <div key={i} style={{ position: "absolute", inset: 0, opacity: carouselIdx === i ? 1 : 0, transition: "opacity 0.5s ease", pointerEvents: carouselIdx === i ? "all" : "none" }}>
    <img
      src={isMobile && s.bgMobile ? s.bgMobile : s.bg}
      alt={s.title}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.objPos }}
    />
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "18px 20px 24px", background: "none" }}>

      {i === 0 ? (
  <div>
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: ".04em" }}>Китай → Бишкек</span>
</div>
<div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 10, textShadow: "0 2px 12px rgba(0,0,0,.5)" }}>
  
</div>
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px" }}>2.8$/кг</span>
  <span style={{ color: "rgba(255,255,255,.3)" }}>•</span>
  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.9)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px" }}>7–12 дней</span>
</div>
</div>
) : (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: ".06em" }}>
  Оффлайн обучение
</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
  С нуля до<br/>первого заказа
</div>
<div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 6, padding: "5px 10px" }}>
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F5B301" strokeWidth="2" strokeLinecap="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
  <span style={{ fontSize: 11, fontWeight: 700, color: "#F5B301" }}>Бонусом:</span>
  <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.9)" }}>1 кг доставки в подарок на первый заказ</span>
</div>
              </div>
      )}

      <a href={i === 0 ? "/register" : "/learn"} style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "18px", borderRadius: 16, background: "#FFFFFF",
        color: "#0057D9", fontSize: 16, fontWeight: 700, textDecoration: "none",
        width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}>
        {i === 0 ? "Получить адрес склада" : "Подробнее →"}
      </a>

    </div>
  </div>
))}

    {/* Progress bars */}
<div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6, padding: "0 16px" }}>
  {HERO_SLIDES.slice(0, 2).map((_, i) => (
    <div key={i} onClick={() => goCarouselTo(i)}
      style={{ height: 3, width: 50, borderRadius: 999, background: "rgba(255,255,255,0.3)", cursor: "pointer", overflow: "hidden" }}>
      <div
  key={`${i}-${carouselIdx}`}
  style={{
    height: "100%",
    borderRadius: 999,
    background: "#fff",
    width: carouselIdx === i ? "100%" : "0%",
    animation: carouselIdx === i ? "progress 10s linear forwards" : "none",
    transition: carouselIdx === i ? "none" : "width 0s",
  }}
/>
    </div>
  ))}
</div>
  </div>
</div>
      {/* ══ TRACKING ══ */}
<div id="tracking" style={{ background: "#fff", padding: "16px 0" }}>
  <div className="wrap">
    <div style={{ background: "#f8fbff", border: "1px solid #e6edf5", borderRadius: 24, overflow: "hidden" }}>
      
      {/* Хедер */}
      <div
  style={{
    padding: "18px 20px 8px"
  }}
>
  <div
    style={{
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      color: "#0d1a2e"
    }}
  >
    Отследить посылку
  </div>

  <div
    style={{
      marginTop: 4,
      fontSize: 13,
      fontWeight: 500,
      color: "#7a8fa8"
    }}
  >
    Введите трек-код и узнайте статус
  </div>
</div>

      {/* Инпут */}
      <div
  style={{
    padding: "10px 20px 20px"
  }}
>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="Например: YT8812272164356" className="track-input"
  value={trackCode} onChange={e => { setTrackCode(e.target.value); if (!e.target.value.trim()) { setTrackSearched(false); setTrackResult(null); } }}
  onKeyDown={e => e.key === "Enter" && handleTrack()}
            style={{ flex: 1, height: 50, padding: "0 5px", border: "1.5px solid #dde6f0", borderRadius: 14, fontSize: 12, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#fff", }} />
          <button onClick={handleTrack} disabled={trackLoading} className="track-btn-h"
            style={{ height: 50, padding: "0 20px", background: "#052D75", color: "#fff", border: "none", borderRadius: 14, boxShadow: "0 4px 12px rgba(5,45,117,.15)", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Найти
          </button>
        </div>

        {trackSearched && !trackResult && (
          <div style={{ marginTop: 12, padding: "12px 14px", background: "#fef2f2", borderRadius: 12, border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Посылка <strong style={{ marginLeft: 4 }}>{trackCode.toUpperCase()}</strong>&nbsp;не найдена
          </div>
        )}

        {trackResult && (
          <div style={{ marginTop: 12, padding: 14, background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #86efac" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 700, color: "#15803d" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Посылка найдена
            </div>
            {[
              { l: "Трек-код", v: trackResult.tracking_code },
              { l: "Статус", v: STATUS_MAP[trackResult.status] ?? trackResult.status },
              trackResult.weight_kg ? { l: "Вес", v: `${trackResult.weight_kg} кг` } : null,
              trackResult.created_at ? { l: "Принят", v: new Date(trackResult.created_at).toLocaleDateString("ru-RU") } : null,
            ].filter(Boolean).map((row: any) => (
              <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,.05)", fontSize: 13 }}>
                <span style={{ color: "rgba(13,26,46,.55)" }}>{row.l}</span>
                <span style={{ fontWeight: 600, color: "#0d1a2e" }}>{row.v}</span>
                {row.hint && (
               <div style={{ fontSize: 10, color: "#9fb3d0", marginTop: 2 }}>пример: 50×50×50 ÷ 6000 = 20.83 кг</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

{/* ══ STATS ══ */}
<section style={{ padding: "16px 12px", background: "#fff" }}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {[
      { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eaa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: "24/7", sub: "На связи" },
      { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eaa" strokeWidth="2" strokeLinecap="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>, title: "90% грузов", sub: "Поступает за 9 дней" },
      { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eaa" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: "Собственный склад", sub: "В Китае" },
      { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#005eaa" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Бесплатная доставка", sub: "По Бишкеку" },
    ].map(({ icon, title, sub }, i) => (
      <div key={i} style={{ background: "#f7faff", borderRadius: 16, padding: "16px 14px", border: "1.5px solid #e8f0fb" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#e0eaff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
          {icon}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0a1e3d", lineHeight: 1.1, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "#7a8fa8", fontWeight: 500, lineHeight: 1.4 }}>{sub}</div>
      </div>
    ))}
  </div>
</section>

{/* ══ БОНУСЫ ══ */}
<section style={{ padding: "0 12px 10px" }}>
  <BonusSlider />
</section>


      {/* ══ SERVICES ══ */}
{/* ══ SERVICES ══ */}
<section style={{ padding: "24px 0" }} id="services">
  <div className="wrap" style={{ padding: "0 12px" }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0a1e3d", margin: "0 0 12px", letterSpacing: "-0.02em" }}>Наши услуги</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

     {/* Обучение — с фото */}
{/* Обучение — с фото */}
<a href="/learn" style={{ borderRadius: 18, height: 160, display: "flex", overflow: "hidden", textDecoration: "none", position: "relative", background: "#1e3a5f" }}>
  <img src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/1w.webp"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "right center" }} />
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,45,90,0.92) 27%, transparent 100%)" }} />
  <div style={{ position: "relative", padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}>
    <div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.15 }}>Оффлайн обучение</div>
<div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginBottom: 16, maxWidth: 160, lineHeight: 1.4 }}>С нуля до первого заказа из Китая</div>
    </div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, width: "fit-content" }}>
      Подробнее →
    </div>
  </div>
</a>

{/* Юани — с фото */}
<a href="/register" style={{ borderRadius: 18, height: 160, display: "flex", overflow: "hidden", textDecoration: "none", position: "relative", background: "#1a5c42" }}>
  <img src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/22w.webp"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,70,50,0.95) 20%, transparent 100%)" }} />
  <div style={{ position: "relative", padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Обменяйте Юани</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginBottom: 16, lineHeight: 1.5, maxWidth: 150 }}>Всегда в наличии и<br/> Всегда  выгодный курс</div>
    </div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, width: "fit-content" }}>
      Обменять →
    </div>
  </div>
</a>

{/* Туры — с фото */}
<a href="/register" style={{ borderRadius: 18, height: 160, display: "flex", overflow: "hidden", textDecoration: "none", position: "relative", background: "#7c3a1e" }}>
  <img src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/333rrt.webp"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center-right" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(160,45,5,0.98) 18%, rgba(160,45,5,0.5) 45%, transparent 100%)" }} />
  <div style={{ position: "relative", padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}>
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Бизнес - туры в Китай</div>
<div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginBottom: 16, lineHeight: 1.5, maxWidth: 160 }}>Закупки напрямую у поставщиков</div>
    </div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10, width: "fit-content" }}>
      Узнать →
    </div>
  </div>
</a>


{/* Карго — с фото */}
<a href="/register" style={{ borderRadius: 18, height: 160, display: "flex", overflow: "hidden", textDecoration: "none", position: "relative", background: "#5b35c5" }}>
  <img src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/333t.webp"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(60,25,140,0.82) 1%, transparent 100%)" }} />
  <div style={{ position: "relative", padding: "20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 1 }}>
    <div>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Карго партнерство</div>
<div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginBottom: 16, lineHeight: 1.5, maxWidth: 160 }}>Откройте и запустите свое Карго с нами</div>
    </div>
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 8, width: "fit-content" }}>
      Стать партнёром →
    </div>
  </div>
</a>

    </div>
  </div>
</section>

{/* ══ ВАЖНО ЗНАТЬ ══ */}
<section style={{ padding: "24px 0", background: "#fff" }} id="info">
  <div style={{ padding: "0 16px 16px" }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0a1e3d", margin: "0 0 12px", letterSpacing: "-0.02em" }}>Важно знать</h2>
    <div style={{ display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" as const }}>
      {tabs.map((t, i) => (
        <button key={i} onClick={() => handleSetActiveTab(i)} style={{ padding: "8px 10px", borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer", flexShrink: 0,background: activeTab === i ? "#3b6fd4" : "rgba(0,0,0,0.05)", color: activeTab === i ? "#fff" : "#6b7a99", border: activeTab === i ? "none" : "1.5px solid #dce4ef",
 transition: "all .2s", fontFamily: "inherit" }}>
          {t.label}
        </button>
      ))}
    </div>
  </div>
        <div
          style={{ position: "relative", height: isMobile ? 320 : 360, overflow: "hidden" }}
          onTouchStart={e => { (e.currentTarget as any)._tx = e.touches[0].clientX; }}
          onTouchEnd={e => { const dx = (e.currentTarget as any)._tx - e.changedTouches[0].clientX; if (Math.abs(dx) > 40) handleSetActiveTab((activeTab + (dx > 0 ? 1 : -1) + tabs.length) % tabs.length); }}
        >
         {tabs.map((t, i) => {
  const total = tabs.length;
  const diff = (i - activeTab + total) % total;
  const pos = diff === 0 ? 0 : diff === 1 ? 1 : diff === total - 1 ? -1 : null;
  return (
    <TabCard
      key={i}
      t={t}
      pos={pos}
      activeTab={activeTab}
      isMobile={isMobile}
      tabs={tabs}
      setActiveTab={handleSetActiveTab}
    />
  );
})}
        </div>
<div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 0 2px" }}>
  {tabs.map((_, i) => (
    <div key={i} onClick={() => handleSetActiveTab(i)} style={{ width: activeTab === i ? 24 : 6, height: 6, borderRadius: 999, background: activeTab === i ? "#3b6fd4" : "#dce4ef", cursor: "pointer", transition: "all 0.3s" }} />
  ))}
</div>
      </section>

      {/* ══ CALCULATOR ══ */}

<section style={{ padding: "20px 16px", background: "#f0f4f8" }} id="calculator">

  <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", maxWidth: 480, margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>



    {/* Шапка */}

    <div style={{ background: "#1a3a6e", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

      <div>

        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 5 }}>Калькулятор доставки</div>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>

          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>

          <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>Китай → Бишкек</span>

        </div>

      </div>

      <div style={{ border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "7px 14px", textAlign: "center" }}>

  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>$2.8/кг</div>

  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", fontWeight: 500, marginTop: 2 }}>тариф</div>

</div>

    </div>



    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>



      {/* Вес */}

      <div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#4a6080", marginBottom: 8 }}>Вес товара</div>

        <div style={{ position: "relative" }}>

          <input type="number" placeholder="Введите вес" min="0" step="0.1" value={weight}

            onChange={e => setWeight(e.target.value === "" ? "" : +e.target.value)}

            style={{ width: "100%", height: 50, padding: "0 48px 0 16px", border: "1.5px solid #e8edf5", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#0d1a2e", fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" as const }} />

          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: "#9fb3d0" }}>кг</span>

        </div>

      </div>



      {/* Размеры */}

      <div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#4a6080", marginBottom: 8 }}>

          Размеры коробки <span style={{ color: "#9fb3d0", fontWeight: 500 }}>(для объёмных товаров)</span>

        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>

          {[{ ph: "Длина", val: length, set: setLength }, { ph: "Ширина", val: width, set: setWidth }, { ph: "Высота", val: height, set: setHeight }].map(({ ph, val, set }) => (

            <div key={ph} style={{ position: "relative" }}>

              <input type="number" placeholder={ph} min="0" step="1" value={val}

                onChange={e => set(e.target.value)}

                style={{ width: "100%", height: 50, padding: "0 28px 0 12px", border: "1.5px solid #e8edf5", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#0d1a2e", fontFamily: "inherit", outline: "none", background: "#fff", boxSizing: "border-box" as const }} />

              <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 700, color: "#9fb3d0" }}>см</span>

            </div>

          ))}

        </div>

        </div>



     {/* Результаты */}

{pw > 0 && (

  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>



    {/* Блок веса */}

    <div style={{ border: "1.5px solid #e8edf5", borderRadius: 14, padding: "12px 14px", background: "#f7faff" }}>

  {isVol ? (

    <>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>

        <div>

          <div style={{ fontSize: 11, color: "#7a8fa8", fontWeight: 500, marginBottom: 2 }}>Объёмный вес</div>

          <div style={{ fontSize: 18, fontWeight: 800, color:"#0d1a2e" }}>{vw.toFixed(2)} кг</div>

        </div>

        <div style={{ textAlign: "right" }}>

          <div style={{ fontSize: 11, color: "#7a8fa8", fontWeight: 500, marginBottom: 2 }}>Фактический вес</div>

          <div style={{ fontSize: 18, fontWeight: 800, color: "#9fb3d0" }}>{pw.toFixed(2)} кг</div>

        </div>

      </div>

      <div style={{ fontSize: 11, color: "#005eaa", fontWeight: 600, background: "#e8f2fb", borderRadius: 7, padding: "4px 8px", marginBottom: 8, display: "inline-block" }}>

        Расчёт по объёмному весу

      </div>

      <details>

        <summary style={{ fontSize: 12, fontWeight: 600, color: "#4a6080", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "#fff", border: "1.5px solid #e8edf5", borderRadius: 10 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>

            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>

            <span>Почему объёмный вес?</span>

          </div>

          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>

        </summary>

        <div style={{ padding: "10px 12px", fontSize: 12, color: "#7a8fa8", lineHeight: 1.6, background: "#fffbeb", border: "1.5px solid #fcd34d", borderTop: "none", borderRadius: "0 0 10px 10px" }}>

          Груз занимает больше места, чем соответствует его весу. По стандарту карго считается объёмный вес:<br/>

          <strong style={{ color: "#92400e" }}>({parseFloat(length)} × {parseFloat(width)} × {parseFloat(height)}) ÷ 6000 = {vw.toFixed(2)} кг</strong><br/>

        </div>

      </details>

    </>

  ) : (

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

      <span style={{ fontSize: 13, fontWeight: 600, color: "#4a6080" }}>Фактический вес</span>

      <span style={{ fontSize: 20, fontWeight: 900, color: "#0d1a2e" }}>{pw.toFixed(2)} кг</span>

    </div>

  )}

</div>



    {/* Итого */}

    <div style={{ background: "#1a3a6e", padding: "12px 16px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

      <div>

        <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>Итого к оплате</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>

          <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>${price}</span>

          <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>≈ {Math.round(parseFloat(price || "0") * 90).toLocaleString()} сом</span>

        </div>

      </div>

      <div style={{ textAlign: "right" }}>

        <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>Срок доставки</div>

        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>7–12 дней</div>

      </div>

    </div>



  </div>

)}



      {/* Подсказка */}

      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", background: "#f0f6ff", border: "1px solid #dce8f5", borderRadius: 8 }}>

  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a85c2" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>

  <span style={{ fontSize: 11, color: "#5a7fa8", fontWeight: 500 }}>Точная цена подтверждается на складе в Китае</span>

</div>

    </div>

  </div>

{/* Спец тариф */}
<div
  style={{
    marginTop: 12,
    border: "1.5px solid #e8edf5",
    borderRadius: 14,
    padding: "14px",
    background: "#f7faff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap"
  }}
>
  <div style={{ flex: 1, minWidth: 180 }}>
    <div
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 7,
        background: "#e8f2fb",
        color: "#005eaa",
        fontSize: 11,
        fontWeight: 700,
        marginBottom: 6
      }}
    >
      Спецпредложение
    </div>

    <div
      style={{
        fontSize: 17,
        fontWeight: 900,
        color: "#0d1a2e",
        marginBottom: 4
      }}
    >
      от <span style={{ color: "#1a3a6e" }}>$0.80/кг</span>
    </div>

    <div
      style={{
        fontSize: 12,
        color: "#6b7d96",
        lineHeight: 1.55
      }}
    >
      Для крупных партий и тяжёлых грузов действует индивидуальный тариф.
      Напишите нам для расчёта стоимости.
    </div>
  </div>

  <div
    style={{
      display: "flex",
      gap: 10,
      alignItems: "center"
    }}
  >
    {/* WhatsApp */}
    <a
      href="https://wa.me/996XXXXXXXXX"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "#25D366",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textDecoration: "none",
        boxShadow: "0 3px 10px rgba(0,0,0,.08)"
      }}
    >
      <svg
        width="23"
        height="23"
        viewBox="0 0 32 32"
        fill="white"
      >
        <path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.8 2 6.8L3 29l6.6-1.9c1.9 1 4.1 1.6 6.4 1.6 7.2 0 13-5.7 13-12.8C29 8.7 23.2 3 16 3zm7.5 18.3c-.3.8-1.7 1.5-2.4 1.6-.6.1-1.3.2-2.2-.1-.5-.2-1.2-.4-2-.8-3.5-1.5-5.8-5.1-6-5.3-.2-.3-1.4-1.9-1.4-3.6s.9-2.5 1.2-2.9c.3-.4.7-.5.9-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.5.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.5.6c-.2.2-.4.5-.2.9.2.4 1 1.7 2.2 2.7 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.2.9-.1l1.1-1.3c.3-.4.6-.4 1-.2.4.1 2.4 1.1 2.8 1.3.5.2.8.3.9.5.1.1.1.8-.2 1.6z"/>
      </svg>
    </a>

    {/* Telegram */}
    <a
      href="https://t.me/USERNAME"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: "#229ED9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textDecoration: "none",
        boxShadow: "0 3px 10px rgba(0,0,0,.08)"
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M22 3.8L18.7 20c-.2 1.1-.8 1.4-1.6.9l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L7.4 14 3 12.6c-1-.3-1-.9.2-1.4L20.8 4c.8-.3 1.5.2 1.2 1.8z"/>
      </svg>
    </a>
  </div>
</div>
</section>
{/* ══ FAQ ══ */}
<section style={{ padding: "20px 16px", background: "#f7f9fc" }} id="faq">
  <div className="wrap">
    <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#0d1a2e", lineHeight: 1.1, marginBottom: 12 }}>Частые вопросы</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {FAQS.map((f, i) => (
        <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
          style={{ borderRadius: 14, overflow: "hidden", transition: "all .15s", background: "#fff", cursor: "pointer", boxShadow: openFaq === i ? "0 2px 12px rgba(59,111,212,0.1)" : "0 1px 4px rgba(0,0,0,0.04)", border: `1.5px solid ${openFaq === i ? "#3b6fd4" : "transparent"}` }}>
          <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0d1a2e", lineHeight: 1.3, flex: 1 }}>{f.q}</span>
            <div style={{ width: 26, height: 26, flexShrink: 0, background: openFaq === i ? "#3b6fd4" : "#f0f4f8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke={openFaq === i ? "#fff" : "#7a8fa8"} strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
          </div>
          {openFaq === i && (
            <div style={{ padding: "0 14px 14px", fontSize: 13, color: "#4a6080", lineHeight: 1.7, borderTop: "1px solid #eef2f8" }}><br/>{f.a}</div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

{/* ══ CONTACT ══ */}
<section style={{ padding: "24px 16px", background: "#fff" }}>
  <div className="wrap">
    <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#0d1a2e", lineHeight: 1.1, marginBottom: 4 }}>Оставить заявку</h2>
    <p style={{ fontSize: 13, color: "#7a8fa8", marginBottom: 16 }}>Перезвоним в течение 15 минут</p>

    <div style={{ background: "#f8fbff", border: "1.5px solid #e6edf5", borderRadius: 20, padding: 20 }}>
      {formSent ? (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#f0fdf4", borderRadius: 16, border: "1.5px solid #86efac" }}>
          <div style={{ width: 56, height: 56, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d", marginBottom: 6 }}>Заявка отправлена!</div>
          <div style={{ fontSize: 14, color: "#16a34a" }}>Менеджер свяжется с вами в течение 15 минут</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Имя */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4a6080", marginBottom: 6 }}>Ваше имя</label>
            <input type="text" placeholder="Айгуль" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", height: 48, padding: "0 16px", border: "1.5px solid #d0dcea", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#fff", boxSizing: "border-box" as const }} />
          </div>

          {/* Телефон */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4a6080", marginBottom: 6 }}>Телефон <span style={{ color: "#e53e3e" }}>*</span></label>
            <input type="tel" placeholder="+996 700 000 000" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
              style={{ width: "100%", height: 48, padding: "0 16px",border: "1.5px solid #d0dcea", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#fff", boxSizing: "border-box" as const }} />
          </div>

          {/* Сообщение */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4a6080", marginBottom: 6 }}>
              Сообщение <span style={{ color: "#9fb3d0", fontWeight: 400 }}></span>
            </label>
            <textarea placeholder="Ваш вопрос или заявка" rows={3} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
              style={{ width: "100%", padding: "12px 16px",border: "1.5px solid #d0dcea", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#0d1a2e", background: "#fff", resize: "none" as const, boxSizing: "border-box" as const }} />
          </div>

          {/* Кнопка */}
          <button onClick={handleFormSubmit}
            style={{ width: "100%", height: 50, border: "none", background: "#1a3a6e", color: "#fff", borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 18px rgba(26,58,110,.25)", letterSpacing: "-0.01em" }}>
            Отправить заявку →
          </button>

          {/* Разделитель */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e8edf5" }} />
            <span style={{ fontSize: 12, color: "#9fb3d0", fontWeight: 500 }}>или напишите нам</span>
            <div style={{ flex: 1, height: 1, background: "#e8edf5" }} />
          </div>

          {/* Соцсети */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <a href="https://wa.me/996220343053" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12, background: "#f0fdf4", border: "1.5px solid #86efac", textDecoration: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>WhatsApp</span>
            </a>
            <a href="https://t.me/3xcargo" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: 12, background: "#eff8ff", border: "1.5px solid #93c5fd", textDecoration: "none" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#2aabee"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1d6fa4" }}>Telegram</span>
            </a>
          </div>

        </div>
      )}
    </div>
  </div>
</section>

{/* ══ ПАРТНЁРЫ ══ */}
<section style={{ padding: "24px 0", background: "#fff" }}>
  <div>
  <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#0d1a2e", marginBottom: 12, padding: "0 16px" }}>Наши партнёры</h2>
  <div style={{ overflow: "hidden", aspectRatio: "2.35/1" }}>
      <img src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/aaaaa1.webp"
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  </div>
</section>

     {/* ══ FOOTER ══ */}
<footer style={{ background: "#f7f9fc", padding: "32px 16px 24px" }}>
  <div className="wrap">

    {/* Лого + время */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 26, fontWeight: 800, color: "#052D75", letterSpacing: "-1.2px" }}>3X</span>
        <span style={{ fontFamily: "Manrope, sans-serif", fontSize: 13, fontWeight: 700, color: "#2A6BC4", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: 5 }}>CARGO</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, color: "#9fb3d0", marginBottom: 2 }}>Время работы</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#052D75" }}>09:00 – 20:00</div>
      </div>
    </div>

    {/* Адрес + телефон */}
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0c0d0" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span style={{ fontSize: 13, color: "#4a6080" }}> ул. Логвиненко 55а, Бишкек</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b0c0d0" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1.1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
        <span style={{ fontSize: 13, color: "#4a6080" }}> +996 220 343 053</span>
      </div>
    </div>

    <div style={{ height: 1, background: "#e8edf5", marginBottom: 20 }} />

    {/* Навигация */}
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#7a8fa8", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>Навигация</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Отслеживание", href: "#tracking" },
          { label: "Калькулятор", href: "#calculator" },
          { label: "Важно знать", href: "#info" },
          { label: "Частые вопросы", href: "#faq" },
          { label: "Обучение", href: "/learn" },
          { label: "Стать партнёром", href: "/register" },
        ].map((l, i) => (
          <a key={i} href={l.href} style={{ fontSize: 13, color: "#0d1a2e", textDecoration: "none", fontWeight: 600 }}>{l.label}</a>
        ))}
      </div>
    </div>

    <div style={{ height: 1, background: "#e8edf5", marginBottom: 20 }} />

    {/* Соцсети */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#7a8fa8", letterSpacing: ".1em", textTransform: "uppercase" }}>Мы в соцсетях</div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="https://wa.me/996220343053" style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="https://t.me/3xcargo" style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#2aabee"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </a>
        <a href="https://www.instagram.com/3x.cargo" style={{ width: 38, height: 38, borderRadius: 10, background: "#eef2f8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round">
            <defs>
              <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f09433"/>
                <stop offset="50%" stopColor="#dc2743"/>
                <stop offset="100%" stopColor="#bc1888"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig)"/>
            <circle cx="12" cy="12" r="4" stroke="url(#ig)"/>
            <circle cx="17.5" cy="6.5" r="0.5" fill="#dc2743" stroke="none"/>
          </svg>
        </a>
      </div>
    </div>

    <div style={{ height: 1, background: "#e8edf5", marginBottom: 16 }} />

    {/* Копирайт */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 11, color: "#7a8fa8" }}>© 2017–2026 3X Cargo</div>
      <div style={{ fontSize: 11, color: "#7a8fa8" }}>Бишкек, Кыргызстан</div>
    </div>

  </div>
</footer>

      <ChatWidget />
    </div>
  );
}