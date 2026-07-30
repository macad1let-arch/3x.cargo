"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gift,
  LogOut,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  getClient,
  type Client,
} from "@/lib/supabase-dashboard";

type Tab = "info" | "address" | "security";

const tabs: Array<{
  key: Tab;
  label: string;
  icon: typeof UserRound;
}> = [
  { key: "info", label: "Данные", icon: UserRound },
  { key: "address", label: "Адрес", icon: MapPin },
  { key: "security", label: "Пароль", icon: ShieldCheck },
];

export default function ProfilePage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const router = useRouter();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    telegram_username: "",
    city: "",
    street: "",
    house: "",
    pickup_point: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const currentClient = await getClient(user.id);

      if (!currentClient) {
        setLoading(false);
        return;
      }

      setClient(currentClient);
      setForm({
        first_name: (currentClient as any).first_name || "",
        last_name: (currentClient as any).last_name || "",
        phone: (currentClient as any).phone || "",
        email: (currentClient as any).email || "",
        telegram_username:
          (currentClient as any).telegram_username || "",
        city: (currentClient as any).city || "",
        street: (currentClient as any).street || "",
        house: (currentClient as any).house || "",
        pickup_point: (currentClient as any).pickup_point || "",
      });
      setLoading(false);
    }

    load();
  }, []);

  async function save() {
    if (!client) return;

    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("client_code", client.client_code);

    if (!error) {
      setClient({ ...client, ...form } as any);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    }

    setSaving(false);
  }

  async function changePassword() {
    setPwMsg(null);

    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      setPwMsg({ ok: false, text: "Пароли не совпадают" });
      return;
    }

    if (passwords.newPass.length < 6) {
      setPwMsg({
        ok: false,
        text: "Пароль должен содержать минимум 6 символов",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwords.newPass,
    });

    if (error) {
      setPwMsg({ ok: false, text: error.message });
      return;
    }

    setPwMsg({ ok: true, text: "Пароль успешно изменён" });
    setPasswords({ current: "", newPass: "", confirm: "" });
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function copyReferralLink() {
    const referralCode = (client as any)?.referral_code || "";
    if (!referralCode) return;

    const referralLink = `${window.location.origin}/register?ref=${encodeURIComponent(
      referralCode,
    )}`;

    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setReferralCopied(true);
    window.setTimeout(() => setReferralCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="grid min-h-[70dvh] place-items-center bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E7EDF7] border-t-[#1846B1]" />
      </div>
    );
  }

  const firstName = (client as any)?.first_name || "Клиент";
  const lastName = (client as any)?.last_name || "";
  const initials =
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "A";

  return (
    <div className="min-h-full bg-white px-5 pb-7 pt-6 text-[#0A1E3D]">
      <header className="flex items-center gap-3.5">
        <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-[#EDF3FF] text-[22px] font-bold text-[#1645AD]">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-4 text-[#71809A]">
            Личный кабинет
          </p>
          <h1 className="mt-0.5 truncate text-[22px] font-semibold leading-7 tracking-[-0.35px]">
            {firstName} {lastName}
          </h1>
        </div>
      </header>

      <section className="mt-5 flex min-h-[66px] items-center gap-3 rounded-[18px] border border-[#DCE5F3] bg-[#F7F9FD] px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium leading-4 text-[#71809A]">
            Ваш индивидуальный код
          </p>
          <p className="mt-0.5 truncate text-[20px] font-semibold leading-6 tracking-[0.2px] text-[#1744A7]">
            {client?.client_code || "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(client?.client_code || "")
              .catch(() => {});
            setCodeCopied(true);
            window.setTimeout(() => setCodeCopied(false), 1500);
          }}
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border",
            "transition active:scale-95",
            codeCopied
              ? "border-[#BDE9D4] bg-[#EAF8F1] text-[#087A50]"
              : "border-[#D7E3F7] bg-white text-[#1744A7]",
          ].join(" ")}
          aria-label="Скопировать индивидуальный код"
        >
          {codeCopied ? (
            <Check size={20} strokeWidth={2.2} />
          ) : (
            <Copy size={20} strokeWidth={1.9} />
          )}
        </button>
      </section>

      <section className="mt-3 flex min-h-[64px] items-center gap-3 rounded-[18px] border border-[#DCE5F3] bg-white px-3.5 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#EDF3FF] text-[#1744A7]">
          <Gift size={20} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-5">
            Пригласить друга
          </p>
          <p className="truncate text-[12px] font-medium leading-4 text-[#71809A]">
            Код: {(client as any)?.referral_code || "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={copyReferralLink}
          disabled={!(client as any)?.referral_code}
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border",
            "transition active:scale-95 disabled:cursor-not-allowed",
            referralCopied
              ? "border-[#BDE9D4] bg-[#EAF8F1] text-[#087A50]"
              : "border-[#D7E3F7] bg-[#F7F9FD] text-[#1744A7]",
          ].join(" ")}
          aria-label="Скопировать реферальную ссылку"
        >
          {referralCopied ? (
            <Check size={20} strokeWidth={2.2} />
          ) : (
            <Copy size={20} strokeWidth={1.9} />
          )}
        </button>
      </section>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-[16px] bg-[#F1F4F9] p-1">
        {tabs.map(({ key, label, icon: TabIcon }) => {
          const active = tab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPwMsg(null);
              }}
              className={[
                "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[12px]",
                "text-[12px] transition",
                active
                  ? "bg-white font-semibold text-[#1744A7]"
                  : "font-medium text-[#71809A]",
              ].join(" ")}
            >
              <TabIcon size={16} strokeWidth={active ? 2.1 : 1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <section className="pt-5">
        {tab === "info" && (
          <div className="space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.2px]">
              Личные данные
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Имя">
                <input
                  className={inputClass}
                  value={form.first_name}
                  onChange={(event) =>
                    setForm({ ...form, first_name: event.target.value })
                  }
                  placeholder="Имя"
                />
              </Field>
              <Field label="Фамилия">
                <input
                  className={inputClass}
                  value={form.last_name}
                  onChange={(event) =>
                    setForm({ ...form, last_name: event.target.value })
                  }
                  placeholder="Фамилия"
                />
              </Field>
            </div>

            <Field label="Телефон">
              <input
                className={inputClass}
                inputMode="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                placeholder="+996 000 000 000"
              />
            </Field>

            <Field label="Email">
              <input
                className={inputClass}
                inputMode="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="name@example.com"
              />
            </Field>

            <Field label="Telegram">
              <input
                className={inputClass}
                value={form.telegram_username}
                onChange={(event) =>
                  setForm({
                    ...form,
                    telegram_username: event.target.value,
                  })
                }
                placeholder="@username"
              />
            </Field>

            <SaveButton saving={saving} saved={saved} onClick={save} />
          </div>
        )}

        {tab === "address" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.2px]">
                Адрес доставки
              </h2>
              <p className="mt-1 text-[13px] leading-[18px] text-[#71809A]">
                Укажите адрес, куда удобно получить посылку
              </p>
            </div>

            <Field label="Город">
              <input
                className={inputClass}
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                placeholder="Бишкек"
              />
            </Field>

            <Field label="Улица">
              <input
                className={inputClass}
                value={form.street}
                onChange={(event) =>
                  setForm({ ...form, street: event.target.value })
                }
                placeholder="Название улицы"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Дом / квартира">
                <input
                  className={inputClass}
                  value={form.house}
                  onChange={(event) =>
                    setForm({ ...form, house: event.target.value })
                  }
                  placeholder="55А / 12"
                />
              </Field>
              <Field label="Пункт выдачи">
                <input
                  className={inputClass}
                  value={form.pickup_point}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      pickup_point: event.target.value,
                    })
                  }
                  placeholder="Не выбран"
                />
              </Field>
            </div>

            <SaveButton saving={saving} saved={saved} onClick={save} />
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.2px]">
                Пароль
              </h2>
              <p className="mt-1 text-[13px] leading-[18px] text-[#71809A]">
                Используйте пароль длиной не менее 6 символов
              </p>
            </div>

            <Field label="Новый пароль">
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwords.newPass}
                  onChange={(event) => {
                    setPwMsg(null);
                    setPasswords({
                      ...passwords,
                      newPass: event.target.value,
                    });
                  }}
                  placeholder="Минимум 6 символов"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#71809A]"
                  aria-label={
                    showNewPassword ? "Скрыть пароль" : "Показать пароль"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={20} strokeWidth={1.8} />
                  ) : (
                    <Eye size={20} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </Field>

            <Field label="Повторите пароль">
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwords.confirm}
                  onChange={(event) => {
                    setPwMsg(null);
                    setPasswords({
                      ...passwords,
                      confirm: event.target.value,
                    });
                  }}
                  placeholder="Введите пароль ещё раз"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-[#71809A]"
                  aria-label={
                    showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} strokeWidth={1.8} />
                  ) : (
                    <Eye size={20} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </Field>

            <button
              type="button"
              onClick={changePassword}
              disabled={
                !passwords.newPass ||
                !passwords.confirm
              }
              className={[
                "flex h-[52px] w-full items-center justify-center rounded-[15px]",
                "text-[15px] font-semibold transition active:scale-[0.99]",
                !passwords.newPass || !passwords.confirm
                  ? "cursor-not-allowed bg-[#E8EDF5] text-[#8A97AA]"
                  : "bg-[#1744A7] text-white",
              ].join(" ")}
            >
              Изменить пароль
            </button>

            {pwMsg && (
              <div
                role="status"
                className={[
                  "rounded-[14px] border px-4 py-3 text-[13px] font-medium",
                  pwMsg.ok
                    ? "border-[#BDE9D4] bg-[#F2FBF7] text-[#087A50]"
                    : "border-[#F4CECE] bg-[#FFF7F7] text-[#C43D4B]",
                ].join(" ")}
              >
                {pwMsg.text}
              </div>
            )}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={logout}
        className="mt-7 flex h-[50px] w-full items-center justify-between rounded-[15px] border border-[#E4E9F1] bg-white px-4 text-[14px] font-semibold text-[#C43D4B] transition active:bg-[#FFF7F7]"
      >
        <span className="flex items-center gap-2.5">
          <LogOut size={19} strokeWidth={1.9} />
          Выйти из аккаунта
        </span>
        <ChevronRight size={18} strokeWidth={1.9} />
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12px] font-medium leading-4 text-[#65758D]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SaveButton({
  saving,
  saved,
  onClick,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className={[
        "flex h-[50px] w-full items-center justify-center gap-2 rounded-[15px]",
        "text-[14px] font-semibold transition active:scale-[0.99]",
        saving
          ? "cursor-not-allowed bg-[#E9EDF4] text-[#8A97AA]"
          : saved
            ? "bg-[#EAF8F1] text-[#087A50]"
            : "bg-[#1744A7] text-white",
      ].join(" ")}
    >
      {saved && <Check size={18} strokeWidth={2.2} />}
      {saving ? "Сохранение..." : saved ? "Сохранено" : "Сохранить изменения"}
    </button>
  );
}

const inputClass = [
  "h-[50px] w-full rounded-[14px] border border-[#DCE4EF] bg-white px-3.5",
  "text-[14px] font-medium text-[#0A1E3D] outline-none",
  "placeholder:font-normal placeholder:text-[#9AA6B8]",
  "transition focus:border-[#6F94E8] focus:ring-2 focus:ring-[#EAF0FF]",
].join(" ");