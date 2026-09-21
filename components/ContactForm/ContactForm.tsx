"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  Headphones,
  MessageCircle,
  Send,
} from "lucide-react";

import styles from "./ContactForm.module.css";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!phone.trim()) return;

    const text = [
      "Здравствуйте! Заявка с сайта Alakel.",
      "",
      name.trim()
        ? `Имя: ${name.trim()}`
        : null,
      `Телефон: ${phone.trim()}`,
      message.trim()
        ? `Сообщение: ${message.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url =
      `https://wa.me/996220343053?text=${encodeURIComponent(text)}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section
      id="contact"
      className={styles.section}
      aria-labelledby="contact-title"
    >
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Headphones
              size={25}
              strokeWidth={2.2}
            />
          </div>

          <div className={styles.headerText}>
            <h2
              id="contact-title"
              className={styles.title}
            >
              Связаться с нами
            </h2>

            <p className={styles.subtitle}>
              Оставьте заявку — мы свяжемся с вами
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label
              htmlFor="contact-name"
              className={styles.label}
            >
              Имя
            </label>

            <input
              id="contact-name"
              type="text"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ваше имя"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="contact-phone"
              className={styles.label}
            >
              Телефон
              <span className={styles.required}>
                *
              </span>
            </label>

            <input
              id="contact-phone"
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="+996 700 000 000"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="contact-message"
              className={styles.label}
            >
              Сообщение
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ваш вопрос или заявка"
              rows={4}
              className={styles.textarea}
            />
          </div>

          <button
            type="submit"
            className={styles.submit}
          >
            <span>Отправить</span>

            <Send
              size={18}
              strokeWidth={2.3}
            />
          </button>
        </form>

        {/* DIVIDER */}
        <div className={styles.divider}>
          <span>
            или напишите напрямую
          </span>
        </div>

        {/* DIRECT CONTACTS */}
        <div className={styles.directGrid}>
          <a
            href="https://wa.me/996220343053"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directButton} ${styles.whatsapp}`}
            aria-label="Написать в WhatsApp"
          >
            <MessageCircle
              className={styles.whatsappIcon}
              size={27}
              strokeWidth={2.15}
            />

            <span className={styles.directCopy}>
              <strong>WhatsApp</strong>
              <small>Быстрый ответ</small>
            </span>
          </a>

          <a
            href="https://t.me/3xcargo"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.directButton} ${styles.telegram}`}
            aria-label="Написать в Telegram"
          >
            <Send
              className={styles.telegramIcon}
              size={26}
              strokeWidth={2.15}
            />

            <span className={styles.directCopy}>
              <strong>Telegram</strong>
              <small>Написать в чат</small>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}