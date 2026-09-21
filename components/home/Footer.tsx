import Link from "next/link";

import {
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer
      className={styles.footer}
      id="contact"
    >
      <div className={styles.inner}>
        {/* TOP */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link
              href="/"
              className={styles.logo}
            >
              Alakel
            </Link>

            <span className={styles.tagline}>
              Доставка из Китая
            </span>
          </div>

          <div className={styles.schedule}>
            <Clock
              size={18}
              strokeWidth={2.2}
            />

            <div>
              <span>Ежедневно</span>
              <strong>09:00 – 20:00</strong>
            </div>
          </div>
        </div>

        {/* CONTACTS */}
        <div className={styles.contacts}>
          <a
            href="https://maps.google.com/?q=ул.+Логвиненко+55а,+Бишкек"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.contact}
          >
            <MapPin
              size={19}
              strokeWidth={2.2}
            />

            <span>
              <small>Адрес</small>
              <strong>
                ул. Логвиненко 55а, Бишкек
              </strong>
            </span>
          </a>

          <a
            href="tel:+996220343053"
            className={styles.contact}
          >
            <Phone
              size={18}
              strokeWidth={2.2}
            />

            <span>
              <small>Телефон</small>
              <strong>
                +996 220 343 053
              </strong>
            </span>
          </a>
        </div>

        {/* SOCIALS */}
        <div className={styles.socialRow}>
          <span className={styles.socialTitle}>
            Мы на связи
          </span>

          <div className={styles.socials}>
            <a
              href="https://wa.me/996220343053"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="WhatsApp"
            >
              <MessageCircle
                size={21}
                strokeWidth={2.1}
              />
            </a>

            <a
              href="https://t.me/3xcargo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Telegram"
            >
              <Send
                size={20}
                strokeWidth={2.1}
              />
            </a>

            <a
              href="https://www.instagram.com/3x.cargo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={styles.instagram}
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <circle
                  cx="17.4"
                  cy="6.6"
                  r="0.8"
                  className={styles.instagramDot}
                />
              </svg>
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className={styles.bottom}>
          <span>© 2017–2026 Alakel</span>
          <span>Бишкек, Кыргызстан</span>
        </div>
      </div>
    </footer>
  );
}