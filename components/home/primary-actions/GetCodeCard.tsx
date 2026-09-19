import Image from "next/image";
import Link from "next/link";
import styles from "./PrimaryActions.module.css";

export default function GetCodeCard() {
  return (
    <article className={`${styles.card} ${styles.codeCard}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          Получите <span className={styles.accent}>код</span>
        </h2>

        <p className={styles.subtitle}>
          Заказы, статусы и бонусы
        </p>
      </header>

      <div className={styles.visual}>
        <Image
          src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%202/f18e705c-362b-456e-ac76-ed420ccff7b6.png"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 50vw, 320px"
          className={`${styles.image} ${styles.codeImage}`}
        />
      </div>

      <Link
        href="/get-code"
        className={`${styles.cta} ${styles.codeCta}`}
      >
        <span className={styles.ctaMain}>Получить код</span>
      </Link>
    </article>
  );
}