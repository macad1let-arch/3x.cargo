import Link from "next/link";
import {
  ReceiptText,
  ShoppingCart,
  CirclePlay,
  Headphones,
} from "lucide-react";

import styles from "./QuickActions.module.css";

const actions = [
  {
    title: "Тарифы",
    subtitle: "Выгодные условия",
    href: "/tariffs",
    icon: ReceiptText,
    tone: "blue",
  },
  {
    title: "Выкуп",
    subtitle: "Выкупим за вас",
    href: "/purchase",
    icon: ShoppingCart,
    tone: "orange",
  },
  {
    title: "Инструкции",
    subtitle: "Видео по шагам",
    href: "/instructions",
    icon: CirclePlay,
    tone: "purple",
  },
  {
    title: "Связь",
    subtitle: "Поддержка 24/7",
    href: "/contacts",
    icon: Headphones,
    tone: "green",
  },
] as const;

export default function QuickActions() {
  return (
    <section
      className={styles.section}
      aria-label="Быстрые действия"
    >
      <div className={styles.grid}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={styles.card}
              data-tone={action.tone}
            >
              <span
                className={styles.iconBox}
                aria-hidden="true"
              >
                <Icon />
              </span>

              <span className={styles.content}>
                <strong className={styles.title}>
                  {action.title}
                </strong>

                <span className={styles.subtitle}>
                  {action.subtitle}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}