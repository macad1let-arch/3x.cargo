import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";
import styles from "./QuickActions.module.css";

export default function PurchaseAction() {
  return (
    <Link href="/purchase" className={styles.card}>
      <span className={styles.iconBox} aria-hidden="true">
        <ShoppingCart size={26} strokeWidth={2.1} />
      </span>

      <span className={styles.title}>Выкуп</span>

      <ChevronRight
        className={styles.chevron}
        size={20}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </Link>
  );
}