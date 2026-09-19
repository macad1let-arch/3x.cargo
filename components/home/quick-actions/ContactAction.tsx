import Link from "next/link";
import { Headphones, ChevronRight } from "lucide-react";
import styles from "./QuickActions.module.css";

export default function ContactAction() {
  return (
    <Link href="/contacts" className={styles.card}>
      <span className={styles.iconBox} aria-hidden="true">
        <Headphones size={27} strokeWidth={2} />
      </span>

      <span className={styles.title}>Связь</span>

      <ChevronRight
        className={styles.chevron}
        size={20}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </Link>
  );
}