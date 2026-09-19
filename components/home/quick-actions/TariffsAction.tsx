import Link from "next/link";
import { ReceiptText, ChevronRight } from "lucide-react";
import styles from "./QuickActions.module.css";

export default function TariffsAction() {
  return (
    <Link href="/tariffs" className={styles.card}>
      <span className={styles.iconBox} aria-hidden="true">
        <ReceiptText size={25} strokeWidth={2.1} />
      </span>

      <span className={styles.title}>Тарифы</span>

      <ChevronRight
        className={styles.chevron}
        size={20}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </Link>
  );
}