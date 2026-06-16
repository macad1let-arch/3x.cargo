"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const register = async () => {
    setErrorText("");
    if (!name || !email || !password || !phone) { setErrorText("Заполните все поля."); return; }
    if (password.length < 6) { setErrorText("Пароль минимум 6 символов."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) { setLoading(false); setErrorText(error?.message ?? "Ошибка регистрации."); return; }
    await supabase.from("clients").insert({
      auth_user_id: data.user.id,
      full_name: name,
      phone,
      email,
    });
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", flexDirection: "column", fontFamily: "Geologica, sans-serif" }}>

      {/* Хедер */}
      <div style={{ background: "#1a3a6e", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>3X Cargo</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>

        {/* Заголовок */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0d1a2e", letterSpacing: "-0.03em", marginBottom: 6 }}>
            {mode === "login" ? "Вход в аккаунт" : "Регистрация"}
          </div>
          <div style={{ fontSize: 13, color: "#7a8fa8", fontWeight: 500 }}>
            {mode === "login" ? "Отслеживайте посылки и управляйте заказами" : "Создайте аккаунт для отслеживания посылок"}
          </div>
        </div>

        {/* Переключатель */}
        <div style={{ display: "flex", background: "#e8edf5", borderRadius: 12, padding: 4, marginBottom: 20, width: "100%", maxWidth: 360 }}>
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setErrorText(""); setResetSent(false); }}
              style={{ flex: 1, height: 38, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all .2s",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0d1a2e" : "#7a8fa8",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,.10)" : "none",
              }}>
              {m === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          ))}
        </div>

        {/* Карточка */}
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,.07)", padding: "24px 20px", width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>

          {mode === "register" && (
            <Field label="Ваше имя" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            }>
              <input type="text" placeholder="Иван Иванов" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </Field>
          )}

          <Field label="Email" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          }>
            <input type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </Field>

          {mode === "register" && (
            <Field label="Телефон" icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 7.36 7.36l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            }>
              <input type="tel" placeholder="+996 700 000 000" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            </Field>
          )}

          <Field label="Пароль" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          } suffix={
            <button onClick={() => setShowPassword(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              {showPassword
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          }>
            <input type={showPassword ? "text" : "password"} placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </Field>

          {/* Кнопка */}
          <button onClick={mode === "login" ? login : register} disabled={loading}
            style={{ height: 52, borderRadius: 12, border: "none", background: loading ? "#7a8fa8" : "#005eaa", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          {/* Забыли пароль */}
          {mode === "login" && !resetSent && (
            <button onClick={resetPassword} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#7a8fa8", fontFamily: "inherit", padding: 0, textAlign: "center" }}>
              Забыли пароль?
            </button>
          )}
        </div>

        {/* Ошибка */}
        {errorText && (
          <div style={{ marginTop: 12, width: "100%", maxWidth: 360, background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#b91c1c", fontWeight: 500, textAlign: "center" }}>
            {errorText}
          </div>
        )}

        {/* Успех сброса */}
        {resetSent && (
          <div style={{ marginTop: 12, width: "100%", maxWidth: 360, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#15803d", fontWeight: 500, textAlign: "center" }}>
            Письмо отправлено на {email} — проверьте почту.
          </div>
        )}

      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 500, color: "#0d1a2e", fontFamily: "Geologica, sans-serif", background: "transparent", minWidth: 0,
};

function Field({ label, icon, suffix, children }: { label: string; icon: React.ReactNode; suffix?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a8fa8", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 14px", border: "1.5px solid #e8edf5", borderRadius: 12, background: "#fff" }}>
        {icon}
        {children}
        {suffix}
      </div>
    </div>
  );
}