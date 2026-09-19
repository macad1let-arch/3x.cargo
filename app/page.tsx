"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ChatWidget from "@/components/ChatWidget";
import TopBanner from "@/components/home/TopBanner";
import Header from "@/components/home/Header";
import TrackingBlock from "@/components/home/TrackingBlock";
import QuickActions from "@/components/home/quick-actions/QuickActions";
import PrimaryActions from "@/components/home/primary-actions/PrimaryActions";
import SecondaryActions from "@/components/home/secondary-actions/SecondaryActions";
import FAQ from "@/components/home/FAQ";
import styles from "./FAQ.module.css";

// ── DATA ──────────────────────────────────────────────────────────────────────



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
    pos === 0 ? { position: "absolute", width: "88%", maxWidth: 400, height: isMobile ? 320 : 420, top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", zIndex: 3, opacity: 1, borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.15)", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", backfaceVisibility: "hidden" as const }
    : pos === 1 ? { position: "absolute", width: "54%", maxWidth: 280, height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(calc(-50% + 42%), -50%) translateZ(0)", zIndex: 2, opacity: 0.55, borderRadius: 20, overflow: "hidden", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", backfaceVisibility: "hidden" as const }
    : pos === -1 ? { position: "absolute", width: "54%", maxWidth: 280, height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(calc(-50% - 42%), -50%) translateZ(0)", zIndex: 2, opacity: 0.55, borderRadius: 20, overflow: "hidden", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", backfaceVisibility: "hidden" as const }
    : { position: "absolute", opacity: 0, pointerEvents: "none" as const, zIndex: 1, width: "54%", height: isMobile ? 270 : 320, top: "50%", left: "50%", transform: "translate(-50%, -50%) translateZ(0)", transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s", backfaceVisibility: "hidden" as const };

  return (
    <div style={style} onClick={() => {
      if (pos === 1) setActiveTab((activeTab + 1) % tabs.length);
      if (pos === -1) setActiveTab((activeTab - 1 + tabs.length) % tabs.length);
    }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <img src={t.img} alt={t.label} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: t.objPos || "center 45%", display: "block", cursor: pos !== 0 ? "pointer" : "default" }} />
        <div style={{ position: "absolute", inset: 0, opacity: pos === 0 ? 1 : 0, transition: "opacity 0.3s" }}>
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
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIdx((current) => (current + 1) % BONUS_SLIDES.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [idx]);

  const reset = (i: number) => setIdx(i);

  return (
    <div>
      <div style={{ position: "relative", borderRadius: 18, aspectRatio: "4/3", overflow: "hidden" }}>
        {BONUS_SLIDES.map((s, i) => (
         <div key={i} style={{ position: "absolute", inset: 0, opacity: idx === i ? 1 : 0, transition: "opacity 0.5s ease", pointerEvents: idx === i ? "all" : "none" }}>
  <img src={s.img} alt="" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center" }} />
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

  // Other state
const [weight, setWeight] = useState<number | "">("");
const [length, setLength] = useState("");
const [width, setWidth] = useState("");
const [height, setHeight] = useState("");

const [formData, setFormData] = useState({
  name: "",
  phone: "",
  message: "",
});

const [formSent, setFormSent] = useState(false);
const [formSending, setFormSending] = useState(false);
const [activeTab, setActiveTab] = useState(0);
const [isMobile, setIsMobile] = useState(false);

const handleSetActiveTab = useCallback(
  (i: number) => setActiveTab(i),
  []
);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
 const tabs = useMemo(() => [
  { label: "Запрещено",        img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/qqq2.webp",  overlay: OVERLAY_ZAPRESHENO, objPos: "center 48%" },
  { label: "Обрешётка",        img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/aw1.webp",   overlay: OVERLAY_OBRESHOTKA, objPos: "center 48%" },
  { label: "Объёмные посылки", img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/ChatGPT%20Image%20Jun%2016,%202026,%2004_01_47%20AM.png",    overlay: OVERLAY_OBEMNYE,   objPos: "center 45%" },
], []);



  const pw = parseFloat(weight.toString()) || 0;
  const vw = parseFloat(length) > 0 && parseFloat(width) > 0 && parseFloat(height) > 0
    ? (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 6000 : 0;
  const cw = Math.max(pw, vw);
  const price = pw > 0 ? (cw * 2.8).toFixed(2) : null;
  const isVol = vw > pw && pw > 0;



  const handleFormSubmit = async () => {
    if (!formData.phone.trim() || formSending) return;

    setFormSending(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const message = await res.text();
        console.error("Telegram error:", message || res.statusText);
        return;
      }

      setFormSent(true);
    } catch (error) {
      console.error("Telegram request failed:", error);
    } finally {
      setFormSending(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Geologica', -apple-system, sans-serif", background: "#f5f7fb", color: "#0d1a2e", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geologica:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }


        /* ── LAYOUT ── */
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 768px) { .wrap { padding: 0 16px; } }
        .sec-pad { padding: 64px 24px; }
        @media (max-width: 768px) { .sec-pad { padding: 44px 16px; } }
        .ps-item-border + .ps-item-border { border-left: 1px solid #dce4ef; }



      `}</style>


<TopBanner />
      <Header />
          <PrimaryActions />
             <QuickActions />
      <TrackingBlock />
      <SecondaryActions />



{/* ══ БОНУСЫ ══ */}
<section style={{ padding: "0 12px 10px" }}>
  <BonusSlider />
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

      
<FAQ />

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
          <button onClick={handleFormSubmit} disabled={formSending}
            style={{ width: "100%", height: 50, border: "none", background: "#1a3a6e", color: "#fff", borderRadius: 14, fontSize: 15, fontWeight: 800, fontFamily: "inherit", cursor: formSending ? "wait" : "pointer", opacity: formSending ? 0.72 : 1, boxShadow: "0 4px 18px rgba(26,58,110,.25)", letterSpacing: "-0.01em" }}>
            {formSending ? "Отправляем..." : "Отправить заявку →"}
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


     {/* ══ FOOTER ══ */}
<footer style={{ background: "#f7f9fc", padding: "32px 16px 24px" }}>
  <div className="wrap">

    {/* Лого + время */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 25, fontWeight: 800, color: "#F47A32", letterSpacing: "-1.1px" }}>Alakel</span>
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
          { label: "Обучение", href: "/services/education" },
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
      <div style={{ fontSize: 11, color: "#7a8fa8" }}>© 2017–2026 Alakel</div>
      <div style={{ fontSize: 11, color: "#7a8fa8" }}>Бишкек, Кыргызстан</div>
    </div>

  </div>
</footer>

      <ChatWidget />
    </div>
  );
}