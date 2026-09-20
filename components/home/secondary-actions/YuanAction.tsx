import Image from "next/image";
import Link from "next/link";
import styles from "./SecondaryActions.module.css";

const YUAN_IMAGE =
  "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%202/qqw1.webp";

export default function YuanAction() {
  return (
    <Link
      href="/services/exchange"
      className={`${styles.card} ${styles.yuanCard}`}
      aria-label="Обменять юани"
    >
      <Image
        src={YUAN_IMAGE}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        className={styles.backgroundImage}
      />

      <div className={`${styles.overlay} ${styles.yuanOverlay}`} />

      <div className={styles.content}>
        <div className={styles.copy}>
          <h3 className={styles.title}>Обменяйте юани</h3>

          <p className={styles.subtitle}>
            Всегда в наличии
            <br />
            и всегда выгодный курс
          </p>
        </div>

        <span className={styles.cta}>
          Обменять
        </span>
      </div>
    </Link>
  );
}