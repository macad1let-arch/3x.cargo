"use client";

import { useState } from "react";

import {
  CircleHelp,
  DollarSign,
  GraduationCap,
  Key,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";

import styles from "./FAQ.module.css";

type FAQItem = {
  q: string;
  a: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
};

const FAQS: FAQItem[] = [
  {
    icon: Key,
    q: "Как получить личный код?",
    a: "Нажмите «Получить код», зарегистрируйтесь и сразу получите личный код для отправки товаров на склад.",
  },
  {
    icon: Truck,
    q: "Сколько идёт доставка?",
    a: "В среднем доставка занимает от 7 до 12 дней.",
  },
  {
    icon: DollarSign,
    q: "Сколько стоит доставка?",
    a: "Стандартный тариф — от 2.8$ за кг. Для оптовых грузов действуют отдельные условия.",
  },
  {
    icon: Search,
    q: "Как отследить посылку?",
    a: "Введите трек-код в блоке отслеживания и вы сразу увидите текущий статус груза.",
  },
  {
    icon: ShoppingCart,
    q: "Можно заказать выкуп товара?",
    a: "Да, мы можем помочь с выкупом товара у поставщика и его дальнейшей доставкой.",
  },
  {
    icon: Package,
    q: "Сколько хранится груз?",
    a: "Бесплатное хранение груза на складе — до 7 дней после прибытия.",
  },
  {
    icon: GraduationCap,
    q: "Как проходит обучение?",
    a: "Показываем всё с нуля: установку и регистрацию в китайских приложениях, поиск товара, покупку и оформление первого заказа.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] =
    useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <section
      className={styles.section}
      id="faq"
      aria-labelledby="faq-title"
    >
      <div className={styles.wrap}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <CircleHelp
              size={24}
              strokeWidth={2.3}
            />
          </div>

          <div className={styles.headerText}>
            <h2
              id="faq-title"
              className={styles.title}
            >
              Частые вопросы
            </h2>

            <p className={styles.subtitle}>
              Всё самое важное
            </p>
          </div>
        </div>

        {/* QUESTIONS */}
        <div className={styles.list}>
          {FAQS.map((item, index) => {
            const isOpen =
              openIndex === index;

            const Icon = item.icon;

            return (
              <div
                key={item.q}
                className={`${styles.item} ${
                  isOpen
                    ? styles.itemOpen
                    : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() =>
                    toggleFaq(index)
                  }
                  aria-expanded={isOpen}
                >
                  <div
                    className={
                      styles.questionLeft
                    }
                  >
                    <div
                      className={
                        styles.rowIcon
                      }
                    >
                      <Icon
                        size={20}
                        strokeWidth={2.2}
                      />
                    </div>

                    <span
                      className={
                        styles.questionText
                      }
                    >
                      {item.q}
                    </span>
                  </div>

                  <div
                    className={`${styles.plus} ${
                      isOpen
                        ? styles.plusOpen
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    <Plus
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                </button>

                <div
                  className={`${styles.answerWrap} ${
                    isOpen
                      ? styles.answerWrapOpen
                      : ""
                  }`}
                >
                  <div className={styles.answer}>
                    {item.a}
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