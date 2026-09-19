"use client";

import { Search } from "lucide-react";
import styles from "./TrackingBlock.module.css";

export default function TrackingBlock() {
  return (
    <section
      className={styles.section}
      aria-labelledby="tracking-title"
    >
      <div className={styles.card}>
        <h2
          id="tracking-title"
          className={styles.title}
        >
          Отследить посылку
        </h2>

        <form className={styles.form}>
          <div className={styles.inputWrap}>
            <Search
              className={styles.inputIcon}
              aria-hidden="true"
            />

            <input
              type="text"
              name="tracking"
              className={styles.input}
              placeholder="Введите трек-код"
              aria-label="Трек-код посылки"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
          >
            Найти
          </button>
        </form>
      </div>
    </section>
  );
}