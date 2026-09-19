import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import styles from "./QuickActions.module.css";

export default function InstructionsAction() {
  return (
    <Link href="/instructions" className={styles.card}>
      <span className={styles.iconBox} aria-hidden="true">
        <BookOpen size={27} strokeWidth={2} />
      </span>

      <span className={styles.title}>Инструкции</span>

      <ChevronRight
        className={styles.chevron}
        size={20}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </Link>
  );
}