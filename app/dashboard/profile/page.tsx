"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Icon } from "@/lib/dashboard";
import {
  getClient, getLoyaltyLevel, getNextLevel, getLevelProgress, Client
} from "@/lib/supabase-dashboard";

export default function ProfilePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"info" | "address" | "security">("info");

  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "", telegram_username: "",
    city: "", street: "", house: "", pickup_point: "",
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const c = await getClient(user.id);
      if (!c) { setLoading(false); return; }
      setClient(c);
      setForm({
        first_name: (c as any).first_name || "",
        last_name: (c as any).last_name || "",
        phone: (c as any).phone || "",
        email: (c as any).email || "",
        telegram_username: (c as any).telegram_username || "",
        city: (c as any).city || "",
        street: (c as any).street || "",
        house: (c as any).house || "",
        pickup_point: (c as any).pickup_point || "",
      });
      setLoading(false);
    }
    load();
  }, []);

  const save = async () => {
    if (!client) return;
    setSaving(true);
    const { error } = await supabase.from("clients").update({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      email: form.email,
      telegram_username: form.telegram_username,
      city: form.city,
      street: form.street,
      house: form.house,
      pickup_point: form.pickup_point,
      updated_at: new Date().toISOString(),
    }).eq("client_code", client.client_code);

    if (!error) {
      setClient({ ...client, ...form } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      setPwMsg({ ok: false, text: "Пароли не совпадают" }); return;
    }
    if (passwords.newPass.length < 6) {
      setPwMsg({ ok: false, text: "Пароль должен быть не менее 6 символов" }); return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
    if (error) { setPwMsg({ ok: false, text: error.message }); return; }
    setPwMsg({ ok: true, text: "Пароль успешно изменён" });
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f5" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const orders = (client as any)?.total_orders ?? 0;
  const level = getLoyaltyLevel(orders);
  const nextLevel = getNextLevel(level.key);
  const progress = getLevelProgress(orders, level.key);
  const initials = ((client as any)?.first_name?.[0] || "") + ((client as any)?.last_name?.[0] || "");

  const inp: React.CSSProperties = { width: "100%", height: 44, padding: "0 14px", borderRadius: 10, border: "1.5px solid #e8edf2", fontSize: 14, color: "#0a1e3d", background: "#fff", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  const TABS = [
    { key: "info",     label: "Личные данные" },
    { key: "address",  label: "Адрес"         },
    { key: "security", label: "Безопасность"  },
  ];

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#0a1e3d", padding: "24px 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: level.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{initials || "?"}</span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
              {(client as any)?.first_name} {(client as any)?.last_name}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{client?.client_code}</div>
          </div>
        </div>

        {/* Level */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: level.bg, borderRadius: 6, padding: "3px 10px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: level.color }}>{level.label}</span>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{level.cashback}% кэшбэк</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{orders} заказов</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: level.color, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            {nextLevel ? `Ещё ${nextLevel.minOrders - orders} заказов до ${nextLevel.label}` : "Максимальный уровень"}
          </div>
        </div>
      </div>

      {/* REFERRAL */}
      <div style={{ margin: "14px 14px 0", background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", padding: "16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d", marginBottom: 10 }}>Реферальный код</div>
       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f6f9", borderRadius: 10, padding: "12px 16px" }}>
  <span style={{ fontSize: 13, fontWeight: 600, color: "#005eaa", wordBreak: "break-all" as const }}>
    3x-cargo.vercel.app/register?ref={(client as any)?.referral_code || "—"}
  </span>
  <button onClick={() => copy(`https://3xcargo.kg/register?ref=${(client as any)?.referral_code || ""}`)}
            style={{ background: copied ? "#10b981" : "#005eaa", border: "none", borderRadius: 8, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}>
            {copied ? "Скопировано" : "Скопировать"}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Пригласите друга — оба получите 100 бонусов после его первого заказа</div>
      </div>

      {/* TABS */}
      <div style={{ margin: "14px 14px 0", background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #f0f2f5" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{ flex: 1, padding: "13px 0", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#005eaa" : "#64748b", borderBottom: tab === t.key ? "2px solid #005eaa" : "2px solid transparent", fontFamily: "inherit" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* INFO */}
          {tab === "info" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={s.g2}>
                <div>
                  <div style={s.lbl}>Имя</div>
                  <input style={inp} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Имя" />
                </div>
                <div>
                  <div style={s.lbl}>Фамилия</div>
                  <input style={inp} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Фамилия" />
                </div>
              </div>
              <div>
                <div style={s.lbl}>Телефон</div>
                <input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+996 XXX XXX XXX" />
              </div>
              <div>
                <div style={s.lbl}>Email</div>
                <input style={inp} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <div style={s.lbl}>Telegram</div>
                <input style={inp} value={form.telegram_username} onChange={e => setForm({ ...form, telegram_username: e.target.value })} placeholder="@username" />
              </div>
              <button onClick={save} disabled={saving}
                style={{ height: 46, borderRadius: 12, border: "none", background: saving ? "#e2e8f0" : "#005eaa", color: saving ? "#94a3b8" : "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
              </button>
            </div>
          )}

          {/* ADDRESS */}
          {tab === "address" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={s.g2}>
                <div>
                  <div style={s.lbl}>Город</div>
                  <input style={inp} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Бишкек" />
                </div>
                <div>
                  <div style={s.lbl}>Улица</div>
                  <input style={inp} value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Улица" />
                </div>
              </div>
              <div style={s.g2}>
                <div>
                  <div style={s.lbl}>Дом</div>
                  <input style={inp} value={form.house} onChange={e => setForm({ ...form, house: e.target.value })} placeholder="Дом / квартира" />
                </div>
                <div>
                  <div style={s.lbl}>Пункт выдачи</div>
                  <input style={inp} value={form.pickup_point} onChange={e => setForm({ ...form, pickup_point: e.target.value })} placeholder="Адрес пункта" />
                </div>
              </div>
              <button onClick={save} disabled={saving}
                style={{ height: 46, borderRadius: 12, border: "none", background: saving ? "#e2e8f0" : "#005eaa", color: saving ? "#94a3b8" : "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
              </button>
            </div>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={s.lbl}>Новый пароль</div>
                <input style={inp} type="password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} placeholder="Минимум 6 символов" />
              </div>
              <div>
                <div style={s.lbl}>Подтвердите пароль</div>
                <input style={inp} type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Повторите пароль" />
              </div>
              <button onClick={changePassword}
                style={{ height: 46, borderRadius: 12, border: "none", background: "#005eaa", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Изменить пароль
              </button>
              {pwMsg && (
                <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 13, background: pwMsg.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${pwMsg.ok ? "#86efac" : "#fca5a5"}`, color: pwMsg.ok ? "#15803d" : "#b91c1c" }}>
                  {pwMsg.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT */}
      <div style={{ padding: "14px 14px 32px" }}>
        <button onClick={logout} style={{ width: "100%", height: 48, borderRadius: 14, border: "1.5px solid #fca5a5", background: "#fff", color: "#dc2626", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="logout" size={18} color="#dc2626" />
          Выйти из аккаунта
        </button>
      </div>

    </div>
  );
}

const s = {
  lbl: { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 } as React.CSSProperties,
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as React.CSSProperties,
};