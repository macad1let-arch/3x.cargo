"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import styles from "./FAQ.module.css";

const FAQS = [
  {
    q: "Как получить личный код?",
    a: "Нажмите «Получить код», зарегистрируйтесь и сразу получите свой личный код для отправки товаров на склад.",
  },
  {
    q: "Сколько идёт доставка?",
    a: "В среднем доставка занимает от 7 до 12 дней после отправки со склада в Китае.",
  },
  {
    q: "Сколько стоит доставка?",
    a: "Стандартный тариф — от 2.8$ за кг. Для оптовых грузов действуют специальные условия — от 0.8$ за кг.",
  },
  {
    q: "Как отследить посылку?",
    a: "Введите трек-код в блоке отслеживания на главной странице и сразу увидите текущий статус груза.",
  },
  {
    q: "Можно заказать выкуп товара?",
    a: "Да, мы можем выкупить товар у поставщика за вас и помочь с оформлением заказа.",
  },
  {
    q: "Сколько хранится груз?",
    a: "Бесплатное хранение на складе — до 7 дней после прибытия груза.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className={styles.section} id="faq">
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <HelpCircle size={22} strokeWidth={2.4} />
          </div>

          <div className={styles.headerText}>
            <h2 className={styles.title}>Частые вопросы</h2>
            <p className={styles.subtitle}>Всё самое важное</p>
          </div>
        </div>

        <div className={styles.list}>
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.q}
                className={`${styles.item} ${
                  isOpen ? styles.itemOpen : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.questionText}>
                    {item.q}
                  </span>

                  <span
                    className={`${styles.toggle} ${
                      isOpen ? styles.toggleOpen : ""
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown
                      size={18}
                      strokeWidth={2.6}
                    />
                  </span>
                </button>

                <div
                  className={`${styles.answerWrap} ${
                    isOpen ? styles.answerWrapOpen : ""
                  }`}
                >
                  <div className={styles.answerInner}>
                    <p className={styles.answer}>
                      {item.a}
                    </p>
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