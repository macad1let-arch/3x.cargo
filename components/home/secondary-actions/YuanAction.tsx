import Link from "next/link";
import { Coins } from "lucide-react";
import styles from "./SecondaryActions.module.css";

export default function YuanAction() {
  return (
    <Link href="/yuan" className={styles.card}>
      <span className={`${styles.iconBox} ${styles.yuanIcon}`}>
        <Coins size={34} strokeWidth={1.9} />
      </span>

      <strong className={styles.title}>Купить юани</strong>
    </Link>
  );
}