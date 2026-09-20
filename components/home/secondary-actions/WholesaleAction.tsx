import Image from "next/image";
import Link from "next/link";
import styles from "./SecondaryActions.module.css";

const WHOLESALE_IMAGE =
  "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%202/wwq1.webp";

export default function WholesaleAction() {
  return (
    <Link
      href="/services/open-cargo"
      className={`${styles.card} ${styles.wholesaleCard}`}
      aria-label="Оптовые грузы"
    >
      <Image
        src={WHOLESALE_IMAGE}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        className={styles.backgroundImage}
      />

      <div
        className={`${styles.overlay} ${styles.wholesaleOverlay}`}
      />

      <div className={styles.content}>
        <div className={styles.copy}>
          <h3 className={styles.title}>Оптовые грузы</h3>

          <p className={styles.subtitle}>
            Для магазинов, бизнеса
            <br />
            и оборудования
          </p>

          <div className={styles.price}>
            от <strong>$0.8</strong>/кг
          </div>
        </div>

        <span className={styles.cta}>
          Подробнее
        </span>
      </div>
    </Link>
  );
}