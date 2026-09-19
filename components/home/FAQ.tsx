"use client";

import { useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";
import styles from "./FAQ.module.css";

const FAQS = [
  {
    q: "Как получить личный код?",
    a: "Зарегистрируйтесь — личный код появится в вашем кабинете.",
  },
  {
    q: "Сколько идёт доставка?",
    a: "Обычно доставка из Китая занимает 7–12 дней.",
  },
  {
    q: "Сколько стоит доставка?",
    a: "Базовый тариф — $2.8 за кг. Для оптовых грузов действуют отдельные условия.",
  },
  {
    q: "Как отследить посылку?",
    a: "Введите трек-код в разделе отслеживания — мы покажем текущий статус.",
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
    <section
      id="faq"
      className={styles.section}
      aria-labelledby="faq-title"
    >
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span
              className={styles.headerIcon}
              aria-hidden="true"
            >
              <CircleHelp />
            </span>

            <div className={styles.headerText}>
              <h2
                id="faq-title"
                className={styles.heading}
              >
                Частые вопросы
              </h2>

              <p className={styles.subheading}>
                Всё самое важное
              </p>
            </div>
          </div>

          <div className={styles.list}>
            {FAQS.map((item, index) => {
              const isOpen = open === index;
              const answerId = `faq-answer-${index}`;

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
                    onClick={() =>
                      setOpen(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span className={styles.questionText}>
                      {item.q}
                    </span>

                    <span
                      className={`${styles.chevron} ${
                        isOpen ? styles.chevronOpen : ""
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown />
                    </span>
                  </button>

                  <div
                    id={answerId}
                    className={`${styles.answerWrap} ${
                      isOpen ? styles.answerOpen : ""
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
      </div>
    </section>
  );
}