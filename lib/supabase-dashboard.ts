import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── ТИПЫ ─────────────────────────────────────────────────────────────────────
export type Client = {
  id: number;
  client_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  balance: number;
  bonus_balance: number;
  total_bonus_earned: number;
  total_bonus_used: number;
  total_orders: number;
  loyalty_level: string;
  referral_code: string;
  referred_by: string;
  referral_bonus_earned: number;
  user_id: string;
  status: string;
  telegram_username: string;
  city: string;
  street: string;
  house: string;
  pickup_point: string;
};

export type Shipment = {
  id: number;
  tracking_code: string;
  status: string;
  weight: number;
  chargeable_weight: number;
  delivery_cost: number;
  final_amount: number;
  created_at: string;
  location: string;
  client_code: string;
};

export type BonusTransaction = {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
  client_code: string;
};

export type BalanceTransaction = {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  balance_after: number;
  balance_before: number;
  tracking_code: string;
  payment_method: string;
  client_code: string;
};

export type ClientNotification = {
  id: number;
  title: string;
  message: string;
  status: string;
  created_at: string;
  tracking_code: string;
};

// ── УРОВНИ ЛОЯЛЬНОСТИ ────────────────────────────────────────────────────────
export const LOYALTY_LEVELS = [
  {
    key: "newbie",
    label: "Новичок",
    color: "#64748b",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    minOrders: 0,
    maxOrders: 2,
    cashback: 1,
    perks: ["1% кэшбэк с каждого заказа"],
  },
  {
    key: "bronze",
    label: "Бронза",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fde68a",
    minOrders: 3,
    maxOrders: 10,
    cashback: 2,
    perks: ["2% кэшбэк с каждого заказа", "Приоритетные уведомления"],
  },
  {
    key: "silver",
    label: "Серебро",
    color: "#475569",
    bg: "#f1f5f9",
    border: "#cbd5e1",
    minOrders: 11,
    maxOrders: 25,
    cashback: 3,
    perks: ["3% кэшбэк с каждого заказа", "Скидка 10% на доставку"],
  },
  {
    key: "gold",
    label: "Золото",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fcd34d",
    minOrders: 26,
    maxOrders: 49,
    cashback: 5,
    perks: ["5% кэшбэк с каждого заказа", "Бесплатная доставка по Бишкеку"],
  },
  {
    key: "platinum",
    label: "Платина",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    minOrders: 50,
    maxOrders: 999,
    cashback: 7,
    perks: ["7% кэшбэк с каждого заказа", "Бесплатная доставка везде", "VIP поддержка"],
  },
];

export function getLoyaltyLevel(orders: number) {
  return [...LOYALTY_LEVELS].reverse().find(l => orders >= l.minOrders) ?? LOYALTY_LEVELS[0];
}

export function getNextLevel(currentKey: string) {
  const idx = LOYALTY_LEVELS.findIndex(l => l.key === currentKey);
  return idx < LOYALTY_LEVELS.length - 1 ? LOYALTY_LEVELS[idx + 1] : null;
}

export function getLevelProgress(orders: number, currentKey: string): number {
  const current = LOYALTY_LEVELS.find(l => l.key === currentKey);
  const next = getNextLevel(currentKey);
  if (!current || !next) return 100;
  const range = next.minOrders - current.minOrders;
  const progress = orders - current.minOrders;
  return Math.min(100, Math.max(5, Math.round((progress / range) * 100)));
}

// ── СТАТУСЫ ЗАКАЗОВ ───────────────────────────────────────────────────────────
export const STATUS_MAP: Record<string, { label: string; iconName: string; color: string; bg: string }> = {
  china_warehouse:      { label: "На складе в Китае", iconName: "warehouse",    color: "#f97316", bg: "#fff7ed" },
  "Поступила на склад в Китае": { label: "На складе в Китае", iconName: "warehouse", color: "#f97316", bg: "#fff7ed" },
  in_transit:           { label: "В пути",            iconName: "ship",         color: "#3b82f6", bg: "#eff6ff" },
  sorting:              { label: "На сортировке",     iconName: "sort",         color: "#8b5cf6", bg: "#f5f3ff" },
  bishkek_arrived:      { label: "На сортировке",     iconName: "sort",         color: "#8b5cf6", bg: "#f5f3ff" },
  ready_pickup:         { label: "Готовы к выдаче",   iconName: "check_circle", color: "#10b981", bg: "#ecfdf5" },
  completed:            { label: "Выдано",             iconName: "check_circle", color: "#10b981", bg: "#ecfdf5" },
};

// ── ФУНКЦИИ ───────────────────────────────────────────────────────────────────

export async function getClient(userId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, client_code, first_name, last_name, full_name, phone, email, balance, bonus_balance, total_bonus_earned, total_bonus_used, total_orders, loyalty_level, referral_code, referred_by, referral_bonus_earned, user_id, status, telegram_username, city, street, house, pickup_point")
    .eq("user_id", userId)
    .single();

  if (error) { console.error("getClient error:", error); return null; }
  return data;
}

export async function getShipments(clientCode: string): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("id, tracking_code, status, weight, chargeable_weight, delivery_cost, final_amount, created_at, location, client_code")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false });

  if (error) { console.error("getShipments error:", error); return []; }
  return data || [];
}

export async function getShipmentCounts(clientCode: string) {
  const shipments = await getShipments(clientCode);
  const counts = { china: 0, transit: 0, sorting: 0, ready: 0 };
  shipments.forEach(s => {
    const st = s.status;
    if (st === "china_warehouse" || st === "Поступила на склад в Китае") counts.china++;
    else if (st === "in_transit") counts.transit++;
    else if (st === "sorting" || st === "bishkek_arrived") counts.sorting++;
    else if (st === "ready_pickup") counts.ready++;
  });
  return counts;
}

export async function getBonusHistory(clientCode: string): Promise<BonusTransaction[]> {
  const { data, error } = await supabase
    .from("bonus_transactions")
    .select("id, type, amount, description, created_at, balance_after, client_code")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) { console.error("getBonusHistory error:", error); return []; }
  return data || [];
}

export async function getBalanceHistory(clientCode: string): Promise<BalanceTransaction[]> {
  const { data, error } = await supabase
    .from("balance_transactions")
    .select("id, type, amount, description, created_at, balance_after, balance_before, tracking_code, payment_method, client_code")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) { console.error("getBalanceHistory error:", error); return []; }
  return data || [];
}

export async function getNotifications(clientCode: string): Promise<ClientNotification[]> {
  const { data, error } = await supabase
    .from("client_notifications")
    .select("id, title, message, status, created_at, tracking_code")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) { console.error("getNotifications error:", error); return []; }
  return data || [];
}

export async function getUnreadCount(clientCode: string): Promise<number> {
  const { count, error } = await supabase
    .from("client_notifications")
    .select("*", { count: "exact", head: true })
    .eq("client_code", clientCode)
    .eq("status", "sent");

  if (error) return 0;
  return count || 0;
}

export default supabase;