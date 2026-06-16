"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase автоматически читает токен из URL и устанавливает сессию
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          // Сессия установлена, можно менять пароль
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const updatePassword = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Заполните оба поля.");
      return;
    }

    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("Ошибка при смене пароля. Попробуйте запросить письмо заново.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f3f1ed] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-4xl font-bold">Новый пароль</h1>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          {success ? (
            <p className="text-center text-green-700 font-semibold">
              Пароль изменён! Перенаправляем на вход...
            </p>
          ) : (
            <div className="grid gap-4">
              <input
                type="password"
                placeholder="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-600"
              />

              <input
                type="password"
                placeholder="Повторите пароль"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-blue-600"
              />

              <button
                onClick={updatePassword}
                disabled={loading}
                className="rounded-2xl bg-blue-600 py-4 font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Сохраняем..." : "Сохранить пароль"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}