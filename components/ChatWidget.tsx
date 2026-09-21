"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import styles from "./ChatWidget.module.css";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  text: "Привет 👋 Я Alakel AI. Можешь спросить меня о доставке или вообще о чём угодно.",
};

const QUICK = [
  "Сколько доставка?",
  "Срок доставки",
  "Где мой груз?",
  "Как заказать?",
];

export default function ChatWidget() {
  const [open, setOpen] =
    useState(false);

  const [messages, setMessages] =
    useState<Message[]>([
      INITIAL_MESSAGE,
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const container =
      messagesRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [
    messages,
    loading,
    open,
  ]);

  const send = async (
    customText?: string,
  ) => {
    const text = (
      customText ?? input
    ).trim();

    if (!text || loading) return;

    const currentHistory =
      messages;

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setLoading(true);

    try {
      const res = await fetch(
        "/api/ai",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
            history: currentHistory,
          }),
        },
      );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "Request failed",
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "Не получилось ответить.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Сейчас не получилось ответить. Попробуй ещё раз.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    void send();
  };

  return (
    <>
      {open && (
        <section
          className={styles.window}
          aria-label="Alakel AI"
        >
          <header
            className={styles.header}
          >
            <div
              className={
                styles.headerLeft
              }
            >
              <div
                className={
                  styles.avatar
                }
              >
                <MessageCircle
                  size={23}
                  strokeWidth={2.25}
                />

                <span
                  className={
                    styles.onlineDot
                  }
                />
              </div>

              <div
                className={
                  styles.headerCopy
                }
              >
                <div
                  className={
                    styles.headerTitle
                  }
                >
                  Alakel AI
                </div>

                <div
                  className={
                    styles.status
                  }
                >
                  Онлайн · отвечает быстро
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className={
                styles.closeButton
              }
              aria-label="Закрыть чат"
            >
              <X
                size={21}
                strokeWidth={2.2}
              />
            </button>
          </header>

          <div
            ref={messagesRef}
            className={
              styles.messages
            }
          >
            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`${styles.messageRow} ${
                    message.role ===
                    "user"
                      ? styles.userRow
                      : styles.aiRow
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      message.role ===
                      "user"
                        ? styles.userBubble
                        : styles.aiBubble
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ),
            )}

            {messages.length === 1 &&
              !loading && (
                <div
                  className={
                    styles.quickWrap
                  }
                >
                  {QUICK.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        className={
                          styles.quickButton
                        }
                        onClick={() =>
                          void send(
                            question,
                          )
                        }
                      >
                        {question}
                      </button>
                    ),
                  )}
                </div>
              )}

            {loading && (
              <div
                className={`${styles.messageRow} ${styles.aiRow}`}
              >
                <div
                  className={`${styles.messageBubble} ${styles.aiBubble} ${styles.typing}`}
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          <div
            className={
              styles.inputArea
            }
          >
            <div
              className={
                styles.inputShell
              }
            >
              <input
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                placeholder="Написать сообщение"
                className={
                  styles.input
                }
                aria-label="Сообщение"
              />

              <button
                type="button"
                onClick={() =>
                  void send()
                }
                disabled={
                  !input.trim() ||
                  loading
                }
                className={
                  styles.sendButton
                }
                aria-label="Отправить"
              >
                <Send
                  size={19}
                  strokeWidth={2.35}
                />
              </button>
            </div>

            <span
              className={
                styles.caption
              }
            >
              Alakel AI
            </span>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className={`${styles.floatingButton} ${
          open
            ? styles.floatingButtonOpen
            : ""
        }`}
        aria-label={
          open
            ? "Закрыть чат"
            : "Открыть Alakel AI"
        }
      >
        {open ? (
          <X
            size={25}
            strokeWidth={2.25}
          />
        ) : (
          <MessageCircle
            size={27}
            strokeWidth={2.1}
          />
        )}

        {!open && (
          <span
            className={
              styles.buttonStatus
            }
          />
        )}
      </button>
    </>
  );
}