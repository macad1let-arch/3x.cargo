"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const warehousePhone = "18745081507";
const warehouseRegion = "广东省 广州市 荔湾区";
const warehouseAddress = "站前路宇宙鞋城D区512-档口";

const steps = [
  {
    title: "Выберите товар",
    text: "Оформите заказ в китайском магазине.",
    icon: Search,
  },
  {
    title: "Укажите адрес склада",
    text: "Скопируйте данные ниже и обязательно добавьте свой код.",
    icon: MapPin,
  },
  {
    title: "Следите за заказом",
    text: "После поступления на склад статус появится в личном кабинете.",
    icon: Truck,
  },
  {
    title: "Получите посылку",
    text: "Заберите заказ в Бишкеке по адресу Логвиненко, 55А.",
    icon: PackageCheck,
  },
];

const notes = [
  {
    title: "Срок и хранение",
    text: "Доставка обычно занимает 7–12 дней. После прибытия посылка бесплатно хранится 7 дней.",
  },
  {
    title: "Объёмный вес",
    text: "Для лёгкой, но большой коробки стоимость может рассчитываться по объёмному весу: длина × ширина × высота / 6000.",
  },
  {
    title: "Хрупкие и особые товары",
    text: "Для хрупкого груза заранее закажите дополнительную упаковку. Электронику, жидкости и другие особые категории согласуйте с менеджером до покупки.",
  },
];

export default function InstructionsPage() {
  const [clientCode, setClientCode] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [openNote, setOpenNote] = useState<number | null>(0);

  useEffect(() => {
    async function loadClientCode() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("client_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.client_code) setClientCode(data.client_code);
    }

    loadClientCode();
  }, []);

  const code = clientCode || "ВАШ КОД";
  const recipient = `龙生 ${code}`;
  const fullAddress = `${warehouseAddress} ${code}`;

  function copyText(text: string, key: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    const text = [
      `Получатель: ${recipient}`,
      `Телефон: ${warehousePhone}`,
      `Регион: ${warehouseRegion}`,
      `Адрес: ${fullAddress}`,
    ].join("\n");

    copyText(text, "all");
  }

  return (
    <div className="min-h-full bg-white px-5 pb-7 pt-6 text-[#0A1E3D]">
      <header>
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.45px]">
          Инструкции
        </h1>
        <p className="mt-1 text-[13px] leading-[18px] text-[#71809A]">
          Как заказать товар из Китая
        </p>
      </header>

      <section className="mt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.15px]">
          Как это работает
        </h2>

        <div className="mt-3 overflow-hidden rounded-[18px] border border-[#DCE5F3]">
          {steps.map(({ title, text, icon: StepIcon }, index) => (
            <div
              key={title}
              className={[
                "flex gap-3.5 px-4 py-3.5",
                index !== steps.length - 1
                  ? "border-b border-[#E9EDF4]"
                  : "",
              ].join(" ")}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#EDF3FF] text-[#1744A7]">
                <StepIcon size={20} strokeWidth={1.9} />
              </span>

              <div className="min-w-0 pt-px">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#1744A7]">
                    {index + 1}
                  </span>
                  <h3 className="text-[14px] font-semibold leading-5">
                    {title}
                  </h3>
                </div>
                <p className="mt-0.5 text-[12px] leading-[17px] text-[#71809A]">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold tracking-[-0.15px]">
              Адрес склада
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-[#71809A]">
              Для Taobao, 1688, Pinduoduo и Poizon
            </p>
          </div>

          <span className="rounded-full bg-[#EDF3FF] px-2.5 py-1 text-[12px] font-semibold text-[#1744A7]">
            {code}
          </span>
        </div>

        <div className="mt-3 overflow-hidden rounded-[18px] border border-[#DCE5F3] bg-white">
          <AddressRow
            label="Получатель"
            value={recipient}
            copied={copied === "recipient"}
            onCopy={() => copyText(recipient, "recipient")}
          />
          <AddressRow
            label="Телефон"
            value={warehousePhone}
            copied={copied === "phone"}
            onCopy={() => copyText(warehousePhone, "phone")}
          />
          <AddressRow
            label="Регион"
            value={warehouseRegion}
            copied={copied === "region"}
            onCopy={() => copyText(warehouseRegion, "region")}
          />
          <AddressRow
            label="Подробный адрес"
            value={fullAddress}
            copied={copied === "address"}
            onCopy={() => copyText(fullAddress, "address")}
            last
          />

          <div className="border-t border-[#E9EDF4] p-3">
            <button
              type="button"
              onClick={copyAll}
              className={[
                "flex h-[50px] w-full items-center justify-center gap-2 rounded-[15px]",
                "text-[14px] font-semibold transition active:scale-[0.99]",
                copied === "all"
                  ? "bg-[#EAF8F1] text-[#087A50]"
                  : "bg-[#1744A7] text-white",
              ].join(" ")}
            >
              {copied === "all" ? (
                <Check size={19} strokeWidth={2.2} />
              ) : (
                <Copy size={18} strokeWidth={1.9} />
              )}
              {copied === "all" ? "Данные скопированы" : "Скопировать всё"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-[14px] bg-[#F7F9FD] px-3.5 py-3 text-[12px] leading-[17px] text-[#5F708A]">
          <CircleAlert
            size={18}
            strokeWidth={1.9}
            className="mt-px shrink-0 text-[#1744A7]"
          />
          <span>
            Код <strong className="font-semibold text-[#1744A7]">{code}</strong>{" "}
            должен быть указан в имени получателя и в подробном адресе.
          </span>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[17px] font-semibold tracking-[-0.15px]">
          Важно знать
        </h2>

        <div className="mt-3 overflow-hidden rounded-[18px] border border-[#DCE5F3]">
          {notes.map((note, index) => {
            const open = openNote === index;

            return (
              <div
                key={note.title}
                className={
                  index !== notes.length - 1
                    ? "border-b border-[#E9EDF4]"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() => setOpenNote(open ? null : index)}
                  className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left"
                  aria-expanded={open}
                >
                  <Box
                    size={19}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#1744A7]"
                  />
                  <span className="min-w-0 flex-1 text-[14px] font-semibold">
                    {note.title}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={1.9}
                    className={[
                      "shrink-0 text-[#71809A] transition-transform",
                      open ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {open && (
                  <p className="px-4 pb-4 pl-[50px] text-[12px] leading-[18px] text-[#5F708A]">
                    {note.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-[18px] border border-[#DCE5F3] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#EAF8F1] text-[#08A866]">
            <MessageCircle size={20} strokeWidth={1.9} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-5">
              Нужна помощь?
            </p>
            <p className="text-[12px] leading-4 text-[#71809A]">
              Напишите менеджеру в WhatsApp
            </p>
          </div>

          <a
            href="https://wa.me/996220343053"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 shrink-0 items-center rounded-[12px] bg-[#1744A7] px-3.5 text-[13px] font-semibold text-white no-underline"
          >
            Написать
          </a>
        </div>
      </section>
    </div>
  );
}

function AddressRow({
  label,
  value,
  copied,
  onCopy,
  last = false,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  last?: boolean;
}) {
  return (
    <div
      className={[
        "flex min-h-[62px] items-center gap-3 px-4 py-2.5",
        !last ? "border-b border-[#E9EDF4]" : "",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium leading-4 text-[#71809A]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13px] font-medium leading-[18px] text-[#0A1E3D]">
          {value}
        </p>
      </div>

      <button
        type="button"
        onClick={onCopy}
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-[12px] border",
          "transition active:scale-95",
          copied
            ? "border-[#BDE9D4] bg-[#EAF8F1] text-[#087A50]"
            : "border-[#D7E3F7] bg-[#F7F9FD] text-[#1744A7]",
        ].join(" ")}
        aria-label={`Скопировать: ${label}`}
      >
        {copied ? (
          <Check size={18} strokeWidth={2.2} />
        ) : (
          <Copy size={18} strokeWidth={1.9} />
        )}
      </button>
    </div>
  );
}