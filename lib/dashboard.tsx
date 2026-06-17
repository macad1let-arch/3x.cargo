"use client";
import React from "react";

// ── ICON ─────────────────────────────────────────────────────────────────────
export function Icon({
  name,
  size = 18,
  color = "currentColor",
  style: sx,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const s: React.CSSProperties = { width: size, height: size, display: "block", flexShrink: 0, ...sx };

  const svgProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "1.75",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: s,
  };

  switch (name) {
    case "home":
      return <svg {...svgProps}><path d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" /></svg>;
    case "package":
      return <svg {...svgProps}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
    case "star":
      return <svg {...svgProps}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "user":
      return <svg {...svgProps}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "bell":
      return <svg {...svgProps}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
    case "headphones":
      return <svg {...svgProps}><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;
    case "wallet":
      return <svg {...svgProps}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "search":
      return <svg {...svgProps}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case "calculator":
      return <svg {...svgProps}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="12" y1="10" x2="14" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="12" y1="14" x2="14" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="12" y1="18" x2="16" y2="18"/></svg>;
    case "yuan":
      return <svg {...svgProps}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
    case "warehouse":
      return <svg {...svgProps}><path d="M22 20v-9H2v9a2 2 0 002 2h16a2 2 0 002-2z"/><path d="M2 11l10-9 10 9"/></svg>;
    case "ship":
      return <svg {...svgProps}><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0121 14l-9-4-9 4c1.34 3.25 2 5.25 7.38 6z"/><path d="M2 14V8l9-4 9 4v6"/></svg>;
    case "sort":
      return <svg {...svgProps}><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg>;
    case "check_circle":
      return <svg {...svgProps}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    case "copy":
      return <svg {...svgProps}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
    case "users":
      return <svg {...svgProps}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "truck":
      return <svg {...svgProps}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case "newspaper":
      return <svg {...svgProps}><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>;
    case "gift":
      return <svg {...svgProps}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>;
    case "city":
      return <svg {...svgProps}><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/></svg>;
    case "map":
      return <svg {...svgProps}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
    case "mail":
      return <svg {...svgProps}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    case "phone":
      return <svg {...svgProps}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.03z"/></svg>;
    case "lock":
      return <svg {...svgProps}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case "id":
      return <svg {...svgProps}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case "logout":
      return <svg {...svgProps}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
    case "chevron_right":
      return <svg {...svgProps}><polyline points="9 18 15 12 9 6"/></svg>;
    case "chevron_left":
      return <svg {...svgProps}><polyline points="15 18 9 12 15 6"/></svg>;
    case "message":
      return <svg {...svgProps}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
    case "award":
      return <svg {...svgProps}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
    case "diamond":
      return <svg {...svgProps}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3l-4 6 5 13 5-13-4-6"/><line x1="2" y1="9" x2="22" y2="9"/></svg>;
    case "check":
      return <svg {...svgProps}><polyline points="20 6 9 17 4 12"/></svg>;
    case "alert":
      return <svg {...svgProps}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    case "plus":
      return <svg {...svgProps}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    default:
      return null;
  }
}

// ── DATA ─────────────────────────────────────────────────────────────────────
export const USER = {
  name: "Адилет",
  uid: "3X-0042-KG",
  balance: 12450,
  bonus: 1280,
  level: 1,
  orders: 17,
};

export const LEVELS = [
  { key: "bronze",   label: "Бронза",   iconName: "award",   color: "#cd7f32", bg: "#fdf3e7", cashback: 1, min: 0,  max: 9   },
  { key: "silver",   label: "Серебро",  iconName: "award",   color: "#7a8fa0", bg: "#eef2f5", cashback: 3, min: 10, max: 24  },
  { key: "gold",     label: "Золото",   iconName: "award",   color: "#c9a227", bg: "#fefce8", cashback: 5, min: 25, max: 49  },
  { key: "platinum", label: "Платинум", iconName: "diamond", color: "#6366f1", bg: "#eef2ff", cashback: 8, min: 50, max: 999 },
];

export const ORDERS = [
  { id: "3X-0042-KG", status: "ready",   label: "Готов к выдаче",    desc: "Кроссовки Nike Air Max", weight: "1.2 кг", date: "Склад А2, Бишкек" },
  { id: "3X-0041-KG", status: "transit", label: "В пути",            desc: "Смартфон Xiaomi 14",     weight: "0.4 кг", date: "Отправлен 10 июн" },
  { id: "3X-0040-KG", status: "china",   label: "На складе в Китае", desc: "Одежда, 5 единиц",       weight: "3.1 кг", date: "Принят 8 июн"     },
  { id: "3X-0039-KG", status: "china",   label: "На складе в Китае", desc: "Аксессуары",             weight: "0.8 кг", date: "Принят 7 июн"     },
  { id: "3X-0038-KG", status: "sorting", label: "На сортировке",     desc: "Детские игрушки",        weight: "2.4 кг", date: "Прибыл 12 июн"    },
  { id: "3X-0037-KG", status: "transit", label: "В пути",            desc: "Электроника",            weight: "1.8 кг", date: "Отправлен 9 июн"  },
];

export type StatusKey = "china" | "transit" | "sorting" | "ready";

export const STATUS_META: Record<StatusKey, { label: string; iconName: string; color: string; bg: string; count: number }> = {
  china:   { label: "На складе в Китае", iconName: "warehouse",    color: "#f97316", bg: "#fff7ed", count: 3 },
  transit: { label: "В пути",            iconName: "ship",         color: "#3b82f6", bg: "#eff6ff", count: 7 },
  sorting: { label: "На сортировке",     iconName: "sort",         color: "#8b5cf6", bg: "#f5f3ff", count: 2 },
  ready:   { label: "Готовы к выдаче",   iconName: "check_circle", color: "#10b981", bg: "#ecfdf5", count: 1 },
};

export const BONUS_HISTORY = [
  { label: "Заказ #3X-0042",        date: "12 июн 2026", amount: 150, plus: true  },
  { label: "Оплата заказа #3X-039", date: "5 июн 2026",  amount: 200, plus: false },
  { label: "Реферал: Бекжан А.",    date: "1 июн 2026",  amount: 50,  plus: true  },
  { label: "Заказ #3X-0038",        date: "28 май 2026", amount: 80,  plus: true  },
];

export const NOTIFS = [
  { iconName: "check_circle", title: "Заказ готов к выдаче", desc: "3X-0042-KG · Кроссовки Nike", time: "2 ч назад", color: "#10b981", bg: "#ecfdf5" },
  { iconName: "ship",         title: "Заказ отправлен",      desc: "3X-0041-KG · Гаджеты",       time: "Вчера",     color: "#3b82f6", bg: "#eff6ff" },
  { iconName: "star",         title: "Начислены бонусы",     desc: "+150 за заказ #3X-0042",     time: "12 июн",    color: "#c9a227", bg: "#fefce8" },
];

export const currentLevel  = LEVELS[USER.level];
export const nextLevel     = LEVELS[USER.level + 1];
export const levelProgress = Math.round(
  ((USER.orders - currentLevel.min) / (currentLevel.max - currentLevel.min + 1)) * 100
);

export const S: Record<string, React.CSSProperties> = {
  page:        { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f0f2f5", minHeight: "100vh", maxWidth: 430, margin: "0 auto", position: "relative", WebkitFontSmoothing: "antialiased" },
  topbarHero:  { background: "#0a1e3d", padding: "54px 20px 16px" },
  heroTitle:   { fontSize: 20, fontWeight: 700, color: "#fff" },
  pBody:       { padding: "14px 16px" },
  card:        { background: "#fff", borderRadius: 18, border: "0.5px solid #e8edf2", overflow: "hidden" },
  secTitle:    { fontSize: 15, fontWeight: 700, color: "#0a1e3d" },
  infoBox:     { background: "#eff6ff", borderRadius: 12, border: "0.5px solid #bfdbfe", padding: "12px 14px", fontSize: 11.5, color: "#1e40af", lineHeight: 1.6, marginBottom: 12 },
  bigNumCard:  { background: "#fff", borderRadius: 18, border: "0.5px solid #e8edf2", padding: "20px", textAlign: "center", marginBottom: 12 },
  bigNum:      { fontSize: 36, fontWeight: 800, color: "#0a1e3d" },
  bigSub:      { fontSize: 12, color: "#94a3b8", marginTop: 5 },
  histItem:    { background: "#fff", borderRadius: 12, border: "0.5px solid #e8edf2", padding: "12px 14px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" },
  hiLabel:     { fontSize: 12.5, fontWeight: 500, color: "#0a1e3d" },
  hiDate:      { fontSize: 10.5, color: "#c4c9d4", marginTop: 2 },
  hiPlus:      { fontSize: 15, fontWeight: 700, color: "#10b981" },
  hiMinus:     { fontSize: 15, fontWeight: 700, color: "#ef4444" },
  orderCard:   { background: "#fff", borderRadius: 14, border: "0.5px solid #e8edf2", padding: "14px", marginBottom: 8 },
  ocTop:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  ocId:        { fontSize: 13.5, fontWeight: 700, color: "#0a1e3d" },
  ocBadge:     { fontSize: 10.5, padding: "3px 10px", borderRadius: 20, fontWeight: 600 },
  ocDesc:      { fontSize: 12, color: "#475569", marginBottom: 5 },
  ocFoot:      { display: "flex", justifyContent: "space-between" },
  ocFootSpan:  { fontSize: 10.5, color: "#c4c9d4" },
  filterPill:  { flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", border: "0.5px solid #e2e8f0", background: "#fff", color: "#64748b" },
  filterActive:{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, border: "0.5px solid #005eaa", background: "#eff6ff", color: "#005eaa" },
  levelRowItem:{ background: "#fff", borderRadius: 14, border: "0.5px solid #e8edf2", padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 },
  lrIco:       { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  lrName:      { fontSize: 13.5, fontWeight: 700, color: "#0a1e3d" },
  lrRange:     { fontSize: 10.5, color: "#94a3b8", marginTop: 2 },
  pfSecTitle:  { fontSize: 10.5, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, margin: "14px 16px 6px" },
  pfGroup:     { background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", overflow: "hidden", margin: "0 16px" },
  pfRow:       { padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "0.5px solid #f0f4f8", cursor: "pointer" },
  pfRowLast:   { padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" },
  pfIconWrap:  { width: 22, display: "flex", alignItems: "center", justifyContent: "center" },
  pfRowLabel:  { flex: 1, fontSize: 13, color: "#0a1e3d" },
  pfRowVal:    { fontSize: 12, color: "#c4c9d4" },
  supportRow:  { background: "#fff", borderRadius: 14, border: "0.5px solid #e8edf2", padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" },
  srIco:       { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  calcInput:   { width: "100%", padding: "10px 12px", borderRadius: 10, border: "0.5px solid #e2e8f0", fontSize: 14, outline: "none", color: "#0a1e3d", background: "#fff" },
  calcLabel:   { fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 },
  calcResult:  { background: "#eff6ff", borderRadius: 14, border: "0.5px solid #bfdbfe", padding: "16px", marginTop: 10 },
  notifRow:    { background: "#fff", borderRadius: 14, border: "0.5px solid #e8edf2", padding: "13px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start" },
  notifIco:    { width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sheetBg:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 90, display: "flex", alignItems: "flex-end", maxWidth: 430, left: "50%", transform: "translateX(-50%)" },
  sheet:       { background: "#fff", width: "100%", borderRadius: "22px 22px 0 0", padding: "22px 20px 40px" },
};