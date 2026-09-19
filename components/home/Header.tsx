import Link from "next/link";
import { UserRound } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Alakel">
          Alakel
        </Link>

        <Link href="/login" className={styles.login}>
          <UserRound
            className={styles.loginIcon}
            size={17}
            strokeWidth={2.2}
            aria-hidden="true"
          />

          <span>Войти</span>
        </Link>
      </div>
    </header>
  );
}