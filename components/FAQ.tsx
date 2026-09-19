"use client";

import { useState } from "react";
import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

const faqs = [
  {
    q: "Как получить личный код?",
    a: "Зарегистрируйтесь — личный код появится в вашем кабинете.",
  },
  {
    q: "Сколько идёт доставка?",
    a: "Обычно 7–12 дней из Китая в Бишкек.",
  },
  {
    q: "Сколько стоит доставка?",
    a: "От $2.8 за кг. Для оптовых грузов действуют отдельные тарифы.",
  },
  {
    q: "Как отследить посылку?",
    a: "Введите трек-код в блоке «Отследить посылку».",
  },
  {
    q: "Можно заказать выкуп товара?",
    a: "Да. Отправьте ссылку на товар — мы поможем с выкупом.",
  },
  {
    q: "Сколько хранится груз?",
    a: "После прибытия груз хранится бесплатно 7 дней.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full px-[5px] pt-2 pb-4">
      <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-[18px] border border-[#DFE7F1] bg-white">
        
        {/* Header */}
        <div className="flex items-center gap-3 px-[14px] pb-[12px] pt-[14px]">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#FFF0E5] text-[#FF7600]">
            <CircleHelp size={19} strokeWidth={2.25} />
          </div>

          <div>
            <h2 className="m-0 text-[16px] font-[850] leading-none tracking-[-0.035em] text-[#0A2F68]">
              Частые вопросы
            </h2>

            <p className="mt-[5px] text-[11.5px] font-semibold leading-none text-[#6B7D97]">
              Всё самое важное
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-[#EDF1F6]">
          {faqs.map((item, index) => {
            const isOpen = open === index;

            return (
              <div
                key={item.q}
                className={
                  index !== faqs.length - 1
                    ? "border-b border-[#EDF1F6]"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpen(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                  className="flex min-h-[54px] w-full items-center justify-between gap-3 px-[14px] text-left transition-colors active:bg-[#F8FAFD]"
                >
                  <span
                    className={`text-[13.5px] font-[750] leading-[1.2] tracking-[-0.015em] transition-colors ${
                      isOpen
                        ? "text-[#FF7600]"
                        : "text-[#0A2F68]"
                    }`}
                  >
                    {item.q}
                  </span>

                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-all duration-200 ${
                      isOpen
                        ? "rotate-180 bg-[#FFF0E5] text-[#FF7600]"
                        : "bg-[#F3F6FA] text-[#8192A9]"
                    }`}
                  >
                    <ChevronDown
                      size={15}
                      strokeWidth={2.3}
                    />
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-[14px] pb-[14px]">
                      <div className="rounded-[12px] bg-[#F6F8FB] px-3 py-[10px]">
                        <p className="m-0 text-[12.5px] font-medium leading-[1.45] text-[#607592]">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}