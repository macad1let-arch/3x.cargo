"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FormKey = "first_name" | "last_name" | "phone" | "email" | "password" | "confirm" | "city" | "street" | "house" | "pickup_point" | "telegram_username" | "source" | "offer_accepted";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});

  const [form, setForm] = useState<Record<FormKey, string | boolean>>({
    first_name: "", last_name: "", phone: "+996", email: "",
    password: "", confirm: "", city: "Бишкек", street: "",
    house: "", pickup_point: "Логвиненко 55", telegram_username: "",
    source: "", offer_accepted: false,
  });

  const getValue = (key: FormKey) => String(form[key] || "").trim();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    let finalValue = value;
    if (name === "phone") {
      let digits = value.replace(/\D/g, "");
      if (digits.startsWith("996")) digits = digits.slice(3);
      digits = digits.slice(0, 9);
      finalValue = "+996" + digits;
    }
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : finalValue }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Partial<Record<FormKey, string>> = {};
    const required: FormKey[] = ["first_name", "last_name", "phone", "email", "password", "confirm", "city", "street", "house", "pickup_point", "source"];
    required.forEach(f => { if (!getValue(f)) newErrors[f] = "Обязательное поле"; });
    if (getValue("password") && getValue("password").length < 6) newErrors.password = "Минимум 6 символов";
    if (getValue("password") && getValue("confirm") && getValue("password") !== getValue("confirm")) newErrors.confirm = "Пароли не совпадают";
    if (!form.offer_accepted) newErrors.offer_accepted = "Нужно согласиться с офертой";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    setMsg("");
    if (!validate()) return;

    const { data: existingPhone } = await supabase.from("clients").select("id").eq("phone", getValue("phone")).maybeSingle();
    if (existingPhone) { setErrors(p => ({ ...p, phone: "Такой номер уже зарегистрирован" })); return; }

    const { data: existingEmail } = await supabase.from("clients").select("id").eq("email", getValue("email")).maybeSingle();
    if (existingEmail) { setErrors(p => ({ ...p, email: "Такая почта уже зарегистрирована" })); return; }

    setLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: getValue("email"), password: getValue("password") });
    if (signUpError || !signUpData.user) { setLoading(false); setMsg("Ошибка регистрации. Проверьте email или пароль."); return; }

    const client_code = `3X-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error: insertError } = await supabase.from("clients").insert([{
      user_id: signUpData.user.id, client_code,
      first_name: getValue("first_name"), last_name: getValue("last_name"),
      phone: getValue("phone"), email: getValue("email"),
      city: getValue("city"), street: getValue("street"),
      house: getValue("house"), pickup_point: getValue("pickup_point"),
      telegram_username: getValue("telegram_username"),
      source: getValue("source"),
      offer_accepted: form.offer_accepted,
    }]);
    if (insertError) { setLoading(false); setMsg("Ошибка сохранения профиля."); return; }

    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${getValue("first_name")} ${getValue("last_name")}`, phone: getValue("phone"), message: `Новая регистрация клиента: ${client_code}` }),
    });

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", flexDirection: "column", fontFamily: "Geologica, sans-serif" }}>
      <div style={{ background: "#1a3a6e", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>3X Cargo</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 48px" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0d1a2e", letterSpacing: "-0.03em", marginBottom: 6 }}>Регистрация</div>
          <div style={{ fontSize: 13, color: "#7a8fa8", fontWeight: 500 }}>Заполните данные, чтобы получить личный код для доставки</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,.07)", padding: "24px 20px", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 }}>

          <Field label="Имя *" icon={<IconUser />} error={errors.first_name}>
            <input name="first_name" type="text" placeholder="Иван" value={getValue("first_name")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Фамилия *" icon={<IconUser />} error={errors.last_name}>
            <input name="last_name" type="text" placeholder="Иванов" value={getValue("last_name")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Телефон / WhatsApp *" icon={<IconPhone />} error={errors.phone}>
            <input name="phone" type="tel" inputMode="tel" value={getValue("phone")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Email *" icon={<IconEmail />} error={errors.email}>
            <input name="email" type="email" placeholder="example@mail.com" value={getValue("email")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Пароль *" icon={<IconLock />} error={errors.password} suffix={
            <button onClick={() => setShowPassword(v => !v)} style={iconBtnStyle}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
          }>
            <input name="password" type={showPassword ? "text" : "password"} placeholder="Минимум 6 символов" value={getValue("password")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Повторите пароль *" icon={<IconLock />} error={errors.confirm} suffix={
            <button onClick={() => setShowConfirm(v => !v)} style={iconBtnStyle}>{showConfirm ? <IconEyeOff /> : <IconEye />}</button>
          }>
            <input name="confirm" type={showConfirm ? "text" : "password"} placeholder="Повторите пароль" value={getValue("confirm")} onChange={onChange} style={inputStyle} />
          </Field>

          <div style={{ height: 1, background: "#f0f4f8", margin: "4px 0" }} />

          <Field label="Город *" icon={<IconPin />} error={errors.city} suffix={<IconChevron />}>
            <select name="city" value={getValue("city")} onChange={onChange} style={{ ...inputStyle, flex: 1, appearance: "none" as const }}>
              <option>Бишкек</option>
            </select>
          </Field>

          <Field label="Улица / мкр / жм *" icon={<IconHome />} error={errors.street}>
            <input name="street" type="text" placeholder="Например: Ленина" value={getValue("street")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Дом / квартира *" icon={<IconBuilding />} error={errors.house}>
            <input name="house" type="text" placeholder="Например: 55" value={getValue("house")} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Пункт выдачи *" icon={<IconBox />} error={errors.pickup_point} suffix={<IconChevron />}>
            <select name="pickup_point" value={getValue("pickup_point")} onChange={onChange} style={{ ...inputStyle, flex: 1, appearance: "none" as const }}>
              <option>Логвиненко 55</option>
            </select>
          </Field>

          <Field label={<span>Telegram <span style={{ color: "#9fb3d0", fontWeight: 500, fontSize: 11 }}>(для уведомлений)</span></span>} icon={<IconTelegram />}>
            <input name="telegram_username" type="text" placeholder="@username" value={getValue("telegram_username")} onChange={onChange} style={inputStyle} />
          </Field>

          <div style={{ height: 1, background: "#f0f4f8", margin: "4px 0" }} />

          <Field label="Откуда узнали о нас? *" icon={<IconSource />} error={errors.source} suffix={<IconChevron />}>
            <select name="source" value={getValue("source")} onChange={onChange} style={{ ...inputStyle, flex: 1, appearance: "none" as const }}>
              <option value="">Выберите источник</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="friends">Знакомые / сарафанное радио</option>
              <option value="google">Google / поиск</option>
              <option value="2gis">2GIS</option>
              <option value="other">Другое</option>
            </select>
          </Field>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 0" }}>
              <div onClick={() => { setForm(p => ({ ...p, offer_accepted: !p.offer_accepted })); setErrors(p => ({ ...p, offer_accepted: "" })); }}
                style={{ width: 20, height: 20, minWidth: 20, borderRadius: 6, border: `2px solid ${form.offer_accepted ? "#005eaa" : errors.offer_accepted ? "#ef4444" : "#d1dce8"}`, background: form.offer_accepted ? "#005eaa" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: 1, transition: "all .15s" }}>
                {form.offer_accepted && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{ fontSize: 13, color: "#4a6080", fontWeight: 500, lineHeight: 1.5 }}>
                Я согласен с <a href="/oferta" target="_blank" style={{ color: "#005eaa", textDecoration: "none" }}>публичной офертой</a> *
              </span>
            </div>
            {errors.offer_accepted && <span style={{ fontSize: 12, color: "#ef4444", paddingLeft: 30 }}>{errors.offer_accepted}</span>}
          </div>

          <button onClick={submit} disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? .7 : 1 }}>
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: 12, width: "100%", maxWidth: 400, background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#b91c1c", fontWeight: 500, textAlign: "center" }}>
            {msg}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 13, color: "#7a8fa8", textAlign: "center" }}>
          Уже есть аккаунт?{" "}
          <Link href="/login" style={{ color: "#005eaa", fontWeight: 700, textDecoration: "none" }}>Войти</Link>
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
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a8fa8", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 50, padding: "0 14px", border: `1.5px solid ${error ? "#ef4444" : "#e8edf5"}`, borderRadius: 12, background: "#fff" }}>
        {icon}{children}{suffix}
      </div>
      {error && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ── Иконки ──────────────────────────────────────────────────────────

const IconEmail    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>);
const IconLock     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const IconUser     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const IconPhone    = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 7.36 7.36l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const IconPin      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const IconHome     = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const IconBuilding = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></svg>);
const IconBox      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
const IconTelegram = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l3.9 1.205 2.306 6.54a.75.75 0 0 0 1.317.166l2.352-3.548 4.165 3.049a2.25 2.25 0 0 0 3.432-1.327l2.25-13.5a2.25 2.25 0 0 0-2.326-2.373z"/></svg>);
const IconSource   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>);
const IconEye      = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IconEyeOff   = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>);
const IconChevron  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9fb3d0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>);