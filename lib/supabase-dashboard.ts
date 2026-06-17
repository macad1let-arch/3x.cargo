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
  user_id: string;
  status: string;
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
};

export type ClientNotification = {
  id: number;
  title: string;
  message: string;
  status: string;
  created_at: string;
  tracking_code: string;
};

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

// Получить профиль клиента по user_id
export async function getClient(userId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, client_code, first_name, last_name, full_name, phone, email, balance, bonus_balance, user_id, status")
    .eq("user_id", userId)
    .single();

  if (error) { console.error("getClient error:", error); return null; }
  return data;
}

// Получить заказы клиента
export async function getShipments(clientCode: string): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("id, tracking_code, status, weight, chargeable_weight, delivery_cost, final_amount, created_at, location, client_code")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false });

  if (error) { console.error("getShipments error:", error); return []; }
  return data || [];
}

// Получить счётчики заказов по статусам
export async function getShipmentCounts(clientCode: string) {
  const shipments = await getShipments(clientCode);

  const counts = {
    china:   0,
    transit: 0,
    sorting: 0,
    ready:   0,
  };

  shipments.forEach(s => {
    const st = s.status;
    if (st === "china_warehouse" || st === "Поступила на склад в Китае") counts.china++;
    else if (st === "in_transit") counts.transit++;
    else if (st === "sorting" || st === "bishkek_arrived") counts.sorting++;
    else if (st === "ready_pickup") counts.ready++;
  });

  return counts;
}

// Получить историю бонусов
export async function getBonusHistory(clientCode: string): Promise<BonusTransaction[]> {
  const { data, error } = await supabase
    .from("bonus_transactions")
    .select("id, type, amount, description, created_at, balance_after")
    .eq("client_code", clientCode)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) { console.error("getBonusHistory error:", error); return []; }
  return data || [];
}

// Получить уведомления
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

// Получить непрочитанные уведомления (счётчик)
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