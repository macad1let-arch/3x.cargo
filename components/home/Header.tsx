import Link from "next/link";
import { UserRound } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="Alakel — главная"
        >
          Alakel
        </Link>

        <Link
          href="/login"
          className={styles.login}
        >
          <span
            className={styles.loginIconWrap}
            aria-hidden="true"
          >
            <UserRound className={styles.loginIcon} />
          </span>

          <span className={styles.loginText}>
            Войти
          </span>
        </Link>
      </div>
    </header>
  );
}