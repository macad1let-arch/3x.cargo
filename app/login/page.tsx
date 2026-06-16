"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const resetPassword = async () => {
    if (!email) { setErrorText("Введите email чтобы сбросить пароль."); return; }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSent(true);
    setErrorText("");
  };

  const login = async () => {
    setErrorText("");
    if (!email || !password) { setErrorText("Введите email и пароль."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error || !data.user) { setErrorText("Неверный email или пароль."); return; }
    const { data: employee } = await supabase
      .from("employees").select("role, status")
      .eq("auth_user_id", data.user.id).eq("status", "active").single();
    router.push(employee ? "/admin" : "/dashboard");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", flexDirection: "column", fontFamily: "Geologica, sans-serif" }}>
      <div style={{ background: "#1a3a6e", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>3X Cargo</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px 48px" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0d1a2e", letterSpacing: "-0.03em", marginBottom: 6 }}>Вход в аккаунт</div>
          <div style={{ fontSize: 13, color: "#7a8fa8", fontWeight: 500 }}>Отслеживайте посылки и управляйте заказами</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,.07)", padding: "24px 20px", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Email" icon={<IconEmail />}>
            <input type="email" placeholder="example@mail.com" value={email}
              onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Пароль" icon={<IconLock />} suffix={
            <button onClick={() => setShowPassword(v => !v)} style={iconBtnStyle}>
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          }>
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </Field>

          <button onClick={login} disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? .7 : 1 }}>
            {loading ? "Входим..." : "Войти"}
          </button>

          {!resetSent && (
            <button onClick={resetPassword} style={ghostBtnStyle}>Забыли пароль?</button>
          )}
        </div>

        {errorText && (
          <div style={{ marginTop: 12, width: "100%", maxWidth: 400, background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#b91c1c", fontWeight: 500, textAlign: "center" }}>
            {errorText}
          </div>
        )}
        {resetSent && (
          <div style={{ marginTop: 12, width: "100%", maxWidth: 400, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#15803d", fontWeight: 500, textAlign: "center" }}>
            Письмо отправлено на {email} — проверьте почту.
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 13, color: "#7a8fa8", textAlign: "center" }}>
          Нет аккаунта?{" "}
          <Link href="/register" style={{ color: "#005eaa", fontWeight: 700, textDecoration: "none" }}>Зарегистрироваться</Link>
        </div>
      </div>
    </main>
  );
}

// ── Стили ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 500,
  color: "#0d1a2e", fontFamily: "Geologica, sans-serif", background: "transparent", minWidth: 0,
};
const primaryBtnStyle: React.CSSProperties = {
  height: 52, borderRadius: 12, border: "none", background: "#005eaa",
  color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "Geologica, sans-serif", cursor: "pointer", marginTop: 4,
};
const ghostBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", fontSize: 13,
  color: "#7a8fa8", fontFamily: "Geologica, sans-serif", padding: 0, textAlign: "center" as const,
};
const iconBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center",
};

// ── Field ──────────────────────────────────────────────────────────

function Field({ label, icon, suffix, error, children }: {
  label: React.ReactNode; icon: React.ReactNode; suffix?: React.ReactNode;
  error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a8fa8", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 14px", border: `1.5px solid ${error ? "#ef4444" : "#e8edf5"}`, borderRadius: 12, background: "#fff" }}>
        {icon}{children}{suffix}
      </div>
      {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ── Иконки ──────────────────────────────────────────────────────────

const IconEmail   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const IconLock    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconEye     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IconEyeOff  = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);