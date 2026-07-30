"use client";

export const dynamic = "force-dynamic";

import {
  Suspense,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type FormKey = "first_name" | "last_name" | "phone" | "email" | "password";

type RegisterForm = Record<FormKey, string>;

const initialForm: RegisterForm = {
  first_name: "",
  last_name: "",
  phone: "+996",
  email: "",
  password: "",
};

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<FormKey, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    setRefCode(searchParams.get("ref"));
  }, [searchParams]);

  useEffect(() => {
    const hiddenElements = new Set<HTMLElement>();

    function hideFloatingChatButton() {
      const controls = document.querySelectorAll<HTMLElement>(
        'button, a, [role="button"]',
      );

      controls.forEach((control) => {
        if (control.closest("main")) return;
        if (control.closest('nav[aria-label="Основная навигация"]')) return;

        const rect = control.getBoundingClientRect();
        const isFloatingBottomControl =
          rect.width >= 44 &&
          rect.width <= 96 &&
          rect.height >= 44 &&
          rect.height <= 96 &&
          rect.bottom >= window.innerHeight - 160;

        if (!isFloatingBottomControl) return;

        let element: HTMLElement | null = control;

        while (element && element !== document.body) {
          if (window.getComputedStyle(element).position === "fixed") {
            element.style.setProperty("display", "none", "important");
            hiddenElements.add(element);
            break;
          }

          element = element.parentElement;
        }
      });
    }

    hideFloatingChatButton();
    const observer = new MutationObserver(hideFloatingChatButton);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      hiddenElements.forEach((element) => {
        element.style.removeProperty("display");
      });
      hiddenElements.clear();
    };
  }, []);

  function value(key: FormKey) {
    return form[key].trim();
  }

  function change(event: ChangeEvent<HTMLInputElement>) {
    const { name } = event.target;
    let nextValue = event.target.value;

    if (name === "phone") {
      let digits = nextValue.replace(/\D/g, "");
      if (digits.startsWith("996")) digits = digits.slice(3);
      nextValue = `+996${digits.slice(0, 9)}`;
    }

    setForm((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
  }

  function validate() {
    const nextErrors: Partial<Record<FormKey, string>> = {};

    if (!value("first_name")) nextErrors.first_name = "Введите имя";
    if (!value("last_name")) nextErrors.last_name = "Введите фамилию";

    if (value("phone").replace(/\D/g, "").length !== 12) {
      nextErrors.phone = "Введите полный номер телефона";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) {
      nextErrors.email = "Введите корректный email";
    }

    if (value("password").length < 6) {
      nextErrors.password = "Минимум 6 символов";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!validate()) return;

    setLoading(true);

    const normalizedEmail = value("email").toLowerCase();

    const [{ data: existingPhone }, { data: existingEmail }] =
      await Promise.all([
        supabase
          .from("clients")
          .select("id")
          .eq("phone", value("phone"))
          .maybeSingle(),
        supabase
          .from("clients")
          .select("id")
          .eq("email", normalizedEmail)
          .maybeSingle(),
      ]);

    if (existingPhone) {
      setLoading(false);
      setErrors((current) => ({
        ...current,
        phone: "Такой номер уже зарегистрирован",
      }));
      return;
    }

    if (existingEmail) {
      setLoading(false);
      setErrors((current) => ({
        ...current,
        email: "Такая почта уже зарегистрирована",
      }));
      return;
    }

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: normalizedEmail,
        password: value("password"),
      });

    if (signUpError || !signUpData.user) {
      setLoading(false);
      setMessage("Не удалось зарегистрироваться. Проверьте введённые данные.");
      return;
    }

    const clientCode = `3X-${Math.floor(1000 + Math.random() * 9000)}`;
    const referralCode = `REF-${clientCode.replace("3X-", "")}`;

    const { error: insertError } = await supabase.from("clients").insert([
      {
        user_id: signUpData.user.id,
        client_code: clientCode,
        first_name: value("first_name"),
        last_name: value("last_name"),
        phone: value("phone"),
        email: normalizedEmail,
        city: "Бишкек",
        street: "",
        house: "",
        pickup_point: "Логвиненко 55",
        telegram_username: "",
        source: "direct",
        offer_accepted: false,
        referred_by: refCode || null,
        referral_code: referralCode,
        loyalty_level: "newbie",
        total_orders: 0,
        bonus_balance: refCode ? 100 : 0,
      },
    ]);

    if (insertError) {
      setLoading(false);
      setMessage("Аккаунт создан, но профиль не сохранился. Обратитесь в поддержку.");
      return;
    }

    if (refCode) {
      const { data: referer } = await supabase
        .from("clients")
        .select("client_code, bonus_balance, referral_bonus_earned")
        .eq("referral_code", refCode)
        .maybeSingle();

      if (referer) {
        const nextBalance = (referer.bonus_balance ?? 0) + 100;

        await supabase
          .from("clients")
          .update({
            bonus_balance: nextBalance,
            referral_bonus_earned:
              (referer.referral_bonus_earned ?? 0) + 100,
          })
          .eq("client_code", referer.client_code);

        await supabase.from("bonus_transactions").insert({
          client_code: referer.client_code,
          type: "referral",
          amount: 100,
          description: `Реферал: ${value("first_name")} ${value("last_name")}`,
          balance_after: nextBalance,
        });
      }

      await supabase.from("bonus_transactions").insert({
        client_code: clientCode,
        type: "referral",
        amount: 100,
        description: "Приветственный бонус за регистрацию по реферальной ссылке",
        balance_after: 100,
      });
    }

    await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${value("first_name")} ${value("last_name")}`,
        phone: value("phone"),
        message: `Новая регистрация клиента: ${clientCode}${
          refCode ? ` (реферал: ${refCode})` : ""
        }`,
      }),
    }).catch(() => {});

    router.replace("/dashboard");
  }

  return (
    <main className="min-h-[100dvh] bg-white font-[Geologica,sans-serif] text-[#0A1E3D]">
      <header className="border-b border-[#E8EDF4] bg-white">
        <div className="mx-auto flex h-[68px] w-full max-w-[430px] items-center justify-center px-5 text-center">
          <span className="text-[19px] font-bold tracking-[-0.35px] text-[#1744A7]">
            3X Cargo
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[430px] px-5 pb-[max(30px,env(safe-area-inset-bottom))] pt-9">
        <div className="text-center">
        
          <h1 className="mt-1 text-[28px] font-semibold leading-[34px] tracking-[-0.7px]">
            Регистрация
          </h1>
          <p className="mx-auto mt-2 max-w-[350px] text-[13px] leading-5 text-[#71809A]">
            Заполните данные, чтобы получить индивидуальный код
          </p>

          {refCode && (
            <div className="mt-4 rounded-[14px] border border-[#BDE9D4] bg-[#F3FBF7] px-4 py-3 text-[13px] font-medium leading-[18px] text-[#087A50]">
              Реферальный код применён
            </div>
          )}
        </div>

        <form className="mt-7 space-y-4" onSubmit={submit} noValidate>
          <Field
            label="Имя"
            icon={<UserRound size={20} strokeWidth={1.8} />}
            error={errors.first_name}
          >
            <input
              name="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="Введите имя"
              value={form.first_name}
              onChange={change}
              className={inputClass}
            />
          </Field>

          <Field
            label="Фамилия"
            icon={<UserRound size={20} strokeWidth={1.8} />}
            error={errors.last_name}
          >
            <input
              name="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Введите фамилию"
              value={form.last_name}
              onChange={change}
              className={inputClass}
            />
          </Field>

          <Field
            label="Номер телефона"
            icon={<Phone size={20} strokeWidth={1.8} />}
            error={errors.phone}
          >
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={change}
              className={inputClass}
            />
          </Field>

          <Field
            label="Email"
            icon={<Mail size={20} strokeWidth={1.8} />}
            error={errors.email}
          >
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="example@mail.com"
              value={form.email}
              onChange={change}
              className={inputClass}
            />
          </Field>

          <Field
            label="Создайте пароль"
            icon={<LockKeyhole size={20} strokeWidth={1.8} />}
            error={errors.password}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-[#71809A] transition active:bg-[#F1F4F9]"
                aria-label={
                  showPassword ? "Скрыть пароль" : "Показать пароль"
                }
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.8} />
                ) : (
                  <Eye size={20} strokeWidth={1.8} />
                )}
              </button>
            }
          >
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Минимум 6 символов"
              value={form.password}
              onChange={change}
              className={inputClass}
            />
          </Field>

          {message && (
            <div
              role="alert"
              className="rounded-[14px] border border-[#F1CCCC] bg-[#FFF7F7] px-4 py-3 text-center text-[13px] font-medium leading-[18px] text-[#BD3445]"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={[
              "flex h-[54px] w-full items-center justify-center rounded-[16px]",
              "text-[15px] font-semibold text-white transition active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[#6F94E8] focus-visible:ring-offset-2",
              loading
                ? "cursor-wait bg-[#7896D8]"
                : "bg-[#1744A7] active:bg-[#123B9F]",
            ].join(" ")}
          >
            {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] leading-5 text-[#71809A]">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#1744A7] no-underline"
          >
            Войти
          </Link>
        </p>
      </div>

      <style jsx global>{`
        input.registerInput:-webkit-autofill,
        input.registerInput:-webkit-autofill:hover,
        input.registerInput:-webkit-autofill:focus,
        input.registerInput:-webkit-autofill:active {
          -webkit-text-fill-color: #0a1e3d !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          caret-color: #0a1e3d;
          transition: background-color 9999s ease-out 0s;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  icon,
  suffix,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  suffix?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-left text-[13px] font-medium leading-5 text-[#5F708A]">
        {label}
      </span>

      <span
        className={[
          "flex h-[56px] items-center rounded-[16px] border bg-white px-1.5",
          "text-[#7890B2] transition focus-within:ring-2",
          error
            ? "border-[#E9A8B0] focus-within:ring-[#FDEBEC]"
            : "border-[#DCE4EF] focus-within:border-[#6F94E8] focus-within:ring-[#EAF0FF]",
        ].join(" ")}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center">
          {icon}
        </span>
        {children}
        {suffix || <span aria-hidden="true" className="h-11 w-2 shrink-0" />}
      </span>

      {error && (
        <span className="mt-1.5 block text-[12px] font-medium leading-4 text-[#BD3445]">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass = [
  "registerInput min-w-0 flex-1 border-0 bg-transparent p-0 text-left",
  "text-[16px] font-medium leading-6 text-[#0A1E3D]",
  "outline-none placeholder:font-normal placeholder:text-[#9AA6B8]",
].join(" ");

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[100dvh] place-items-center bg-white">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E7EDF7] border-t-[#1744A7]" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}