"use client";

import { Search } from "lucide-react";
import styles from "./TrackingBlock.module.css";

export default function TrackingBlock() {
  return (
    <section className={styles.wrap} aria-label="Отследить посылку">
      <h2 className={styles.title}>Отследить посылку</h2>

      <form className={styles.form}>
        <div className={styles.inputWrap}>
          <Search className={styles.icon} size={22} strokeWidth={2.2} />
          <input
            type="text"
            placeholder="Введите трек-номер"
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.button}>
          Найти
        </button>
      </form>
    </section>
  );
}