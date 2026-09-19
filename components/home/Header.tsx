import Link from "next/link";
import { UserRound } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Alakel
        </Link>

        <Link href="/login" className={styles.login}>
          <span className={styles.loginIcon}>
            <UserRound size={16} strokeWidth={2.2} />
          </span>

          <span>Войти</span>
        </Link>
      </div>
    </header>
  );
}