import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import styles from "./PrimaryActions.module.css";

export default function EducationCard() {
  return (
    <article className={`${styles.card} ${styles.educationCard}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Обучение <span className={styles.accent}>с нуля</span>
        </h2>

        <p className={styles.subtitle}>
          До первого заказа
        </p>
      </div>

      <div className={styles.visual}>
        <div className={styles.giftBadge}>
          <Gift size={13} strokeWidth={2.4} />
          <span>1 кг в подарок</span>
        </div>

        <Image
          src="https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%202/ChatGPT%20Image%20Sep%2018,%202026,%2007_06_11%20PM.png"
          alt="Обучение с нуля"
          fill
          priority
          sizes="(max-width: 768px) 48vw, 340px"
          className={`${styles.image} ${styles.educationImage}`}
        />
      </div>

      <Link href="/training" className={`${styles.cta} ${styles.educationCta}`}>
        Записаться
      </Link>
    </article>
  );
}