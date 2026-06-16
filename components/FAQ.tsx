"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Как получить личный код?",
    a: "Зарегистрируйтесь на сайте, после этого вы получите личный код для отправки товаров на склад.",
  },
  {
    q: "Сколько идёт доставка?",
    a: "В среднем доставка занимает от 7 до 12 дней.",
  },
  {
    q: "Можно ли заказать выкуп товара?",
    a: "Да, мы можем выкупить товар у поставщика за вас.",
  },
  {
    q: "Как отследить посылку?",
    a: "Введите трек-код на странице отслеживания и вы увидите статус груза.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-16">
      <h2 className="text-2xl font-bold text-center mb-8">
        Часто задаваемые вопросы
      </h2>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((item, index) => (
          <div key={index} className="border rounded-xl p-4">
            <button
              onClick={() => setOpen(open === index ? null : index)}
              className="w-full text-left font-medium"
            >
              {item.q}
            </button>

            {open === index && (
              <p className="mt-2 text-sm text-gray-600">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}