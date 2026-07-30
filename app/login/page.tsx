"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  async function resetPassword() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorText("Введите email, чтобы восстановить пароль.");
      return;
    }

    setResetLoading(true);
    setErrorText("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    setResetLoading(false);

    if (error) {
      setErrorText("Не удалось отправить письмо. Проверьте email.");
      return;
    }

    setResetSent(true);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");
    setResetSent(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorText("Введите email и пароль.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      setErrorText("Неверный email или пароль.");
      return;
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("role, status")
      .eq("auth_user_id", data.user.id)
      .eq("status", "active")
      .maybeSingle();

    router.replace(employee ? "/admin" : "/dashboard");
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

      <div className="mx-auto flex min-h-[calc(100dvh-68px)] w-full max-w-[430px] flex-col px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-12">
        <div className="text-center">
          
          <h1 className="mt-1 text-[28px] font-semibold leading-[34px] tracking-[-0.7px]">
            Вход в аккаунт
          </h1>
          <p className="mx-auto mt-2 max-w-[340px] text-[14px] leading-5 text-[#71809A]">
            Отслеживайте посылки и управляйте заказами
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={login} noValidate>
          <Field label="Email" icon={<Mail size={20} strokeWidth={1.8} />}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="example@mail.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorText("");
                setResetSent(false);
              }}
              className={inputClass}
            />
          </Field>

          <Field
            label="Пароль"
            icon={<LockKeyhole size={20} strokeWidth={1.8} />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
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
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Введите пароль"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorText("");
              }}
              className={inputClass}
            />
          </Field>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetPassword}
              disabled={resetLoading || resetSent}
              className="min-h-10 rounded-[10px] px-1 text-[13px] font-semibold text-[#1744A7] disabled:text-[#8A97AA]"
            >
              {resetLoading
                ? "Отправляем..."
                : resetSent
                  ? "Письмо отправлено"
                  : "Забыли пароль?"}
            </button>
          </div>

          {errorText && (
            <div
              role="alert"
              className="rounded-[14px] border border-[#F1CCCC] bg-[#FFF7F7] px-4 py-3 text-[13px] font-medium leading-[18px] text-[#BD3445]"
            >
              {errorText}
            </div>
          )}

          {resetSent && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-[14px] border border-[#BDE9D4] bg-[#F3FBF7] px-4 py-3 text-[13px] font-medium leading-[18px] text-[#087A50]"
            >
              <CheckCircle2
                size={18}
                strokeWidth={2}
                className="mt-px shrink-0"
              />
              <span>Письмо отправлено на {email.trim()}</span>
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
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] leading-5 text-[#71809A]">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#1744A7] no-underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <style jsx global>{`
        input.loginInput:-webkit-autofill,
        input.loginInput:-webkit-autofill:hover,
        input.loginInput:-webkit-autofill:focus,
        input.loginInput:-webkit-autofill:active {
          -webkit-text-fill-color: #0a1e3d !important;
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          caret-color: #0a1e3d;
          transition: background-color 9999s ease-out 0s;
        }

        input.loginInput::selection {
          background: rgba(23, 68, 167, 0.14);
          color: #0a1e3d;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  icon,
  suffix,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-left text-[13px] font-medium leading-5 text-[#5F708A]">
        {label}
      </span>
      <span className="flex h-[56px] items-center rounded-[16px] border border-[#DCE4EF] bg-white px-1.5 text-[#7890B2] transition focus-within:border-[#6F94E8] focus-within:ring-2 focus-within:ring-[#EAF0FF]">
        <span className="grid h-11 w-11 shrink-0 place-items-center">
          {icon}
        </span>
        {children}
        {suffix || (
          <span aria-hidden="true" className="h-11 w-11 shrink-0" />
        )}
      </span>
    </label>
  );
}

const inputClass = [
  "loginInput min-w-0 flex-1 border-0 bg-transparent p-0 text-left",
  "text-[16px] font-medium leading-6 text-[#0A1E3D]",
  "outline-none placeholder:font-normal placeholder:text-[#9AA6B8]",
].join(" ");