import Link from "next/link";
import { Boxes } from "lucide-react";
import styles from "./SecondaryActions.module.css";

export default function WholesaleAction() {
  return (
    <Link href="/wholesale" className={styles.card}>
      <span className={`${styles.iconBox} ${styles.wholesaleIcon}`}>
        <Boxes size={34} strokeWidth={1.9} />
      </span>

      <strong className={styles.title}>Оптовые грузы</strong>
    </Link>
  );
}