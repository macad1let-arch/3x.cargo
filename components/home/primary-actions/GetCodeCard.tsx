import Image from "next/image";
import Link from "next/link";
import styles from "./PrimaryActions.module.css";

export default function GetCodeCard() {
  return (
    <article className={`${styles.card} ${styles.codeCard}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Получите <span className={styles.accent}>код</span>
        </h2>

        <p className={styles.subtitle}>
          Заказы, статусы и бонусы
        </p>
      </div>

      <div className={styles.visual}>
        <Image
          src="/images/get-code-dashboard.webp"
          alt="Личный кабинет Alakel"
          fill
          priority
          sizes="50vw"
          className={`${styles.image} ${styles.codeImage}`}
        />
      </div>

      <Link
        href="/get-code"
        className={`${styles.cta} ${styles.codeCta}`}
      >
        Получить код
      </Link>
    </article>
  );
}