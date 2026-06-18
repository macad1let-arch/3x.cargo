"use client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Icon } from "@/lib/dashboard";
import { getClient, Client } from "@/lib/supabase-dashboard";

export default function ReferralPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [client, setClient] = useState<Client | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const c = await getClient(user.id);
      if (!c) { setLoading(false); return; }
      setClient(c);

      // Получаем рефералов — клиентов у которых referred_by = наш код
      const { data: refs } = await supabase
        .from("clients")
        .select("client_code, full_name, first_name, created_at, total_orders")
        .eq("referred_by", c.client_code)
        .order("created_at", { ascending: false });

      setReferrals(refs || []);
      setLoading(false);
    }
    load();
  }, []);

  const copy = () => {
    navigator.clipboard?.writeText(`https://3x-cargo.vercel.app/register?ref=${client?.referral_code ?? ""}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: "3X Cargo",
        text: `Присоединяйся к 3X Cargo! Используй мой код ${client?.referral_code} при регистрации — оба получим по 100 бонусов.`,
        url: `https://3x-cargo.vercel.app/register?ref=${client?.referral_code}`,
      });
    } else {
      copy();
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f5" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e8edf2", borderTopColor: "#005eaa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalBonusFromRefs = (client as any)?.referral_bonus_earned ?? 0;
  const activeReferrals = referrals.filter(r => r.total_orders > 0).length;

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#0a1e3d", padding: "20px 20px 28px" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 20 }}>Реферальная программа</div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "Приглашено", value: referrals.length },
            { label: "Активных", value: activeReferrals },
            { label: "Бонусов", value: totalBonusFromRefs },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 14px 24px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Referral code */}
        <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d", marginBottom: 4 }}>Ваш реферальный код</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>Поделитесь кодом с друзьями</div>

          <div style={{ background: "#f4f6f9", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#005eaa", wordBreak: "break-all" as const }}>
  3xcargo.kg/register?ref={client?.referral_code || "—"}
</span>
            <button onClick={copy} style={{ background: copied ? "#10b981" : "#005eaa", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}>
              {copied ? "Скопировано ✓" : "Скопировать"}
            </button>
          </div>

          <button onClick={share} style={{ width: "100%", height: 46, borderRadius: 12, border: "1.5px solid #005eaa", background: "#eff6ff", color: "#005eaa", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="users" size={18} color="#005eaa" />
            Поделиться
          </button>
        </div>

        {/* How it works */}
        <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d", marginBottom: 16 }}>Как это работает</div>
          {[
            { step: "1", text: "Поделитесь кодом с другом", icon: "users" },
            { step: "2", text: "Друг регистрируется и вводит ваш код", icon: "user" },
            { step: "3", text: "Друг делает первый заказ", icon: "package" },
            { step: "4", text: "Оба получаете по 100 бонусов", icon: "gift" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: i < 3 ? 14 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#005eaa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{s.step}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{s.text}</span>
              </div>
              {i < 3 && <div style={{ position: "absolute", left: 31, marginTop: 36, width: 2, height: 14, background: "#e2e8f0" }} />}
            </div>
          ))}
        </div>

        {/* Bonus info */}
        <div style={{ background: "linear-gradient(135deg, #005eaa 0%, #0a1e3d 100%)", borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Заработано с рефералов</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{totalBonusFromRefs} бонусов</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>≈ {Math.round(totalBonusFromRefs * 0.1).toLocaleString()} сом</div>
          </div>
          <Icon name="gift" size={40} color="rgba(255,255,255,0.2)" />
        </div>

        {/* Referrals list */}
        <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8edf2", padding: "20px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0a1e3d", marginBottom: 14 }}>
            Приглашённые клиенты
            {referrals.length > 0 && <span style={{ marginLeft: 8, fontSize: 12, background: "#eff6ff", color: "#005eaa", borderRadius: 10, padding: "2px 8px", fontWeight: 600 }}>{referrals.length}</span>}
          </div>

          {referrals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0a1e3d", marginBottom: 6 }}>Пока никого нет</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Поделитесь кодом с друзьями</div>
            </div>
          ) : (
            referrals.map((r, i) => {
              const hasOrder = r.total_orders > 0;
              const date = new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
              return (
                <div key={r.client_code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < referrals.length - 1 ? "1px solid #f0f2f5" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: hasOrder ? "#ecfdf5" : "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: hasOrder ? "#10b981" : "#94a3b8" }}>
                        {(r.full_name || r.first_name || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0a1e3d" }}>{r.full_name || r.first_name || r.client_code}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>Зарегистрирован {date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: hasOrder ? "#10b981" : "#94a3b8", background: hasOrder ? "#ecfdf5" : "#f0f2f5", borderRadius: 8, padding: "3px 8px" }}>
                      {hasOrder ? `${r.total_orders} заказов` : "Нет заказов"}
                    </div>
                    {hasOrder && <div style={{ fontSize: 10, color: "#10b981", marginTop: 2 }}>+100 бонусов</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}