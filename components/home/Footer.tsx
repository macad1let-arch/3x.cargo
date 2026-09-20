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
    <footer className={styles.footer} id="contact">
      <div className={styles.inner}>
        {/* BRAND + WORK TIME */}
        <div className={styles.top}>
          <div>
            <div className={styles.logo}>
              Alakel
            </div>

            <div className={styles.tagline}>
              Доставка из Китая
            </div>
          </div>

          <div className={styles.work}>
            <Clock
              size={17}
              strokeWidth={2.2}
            />

            <div className={styles.workText}>
              <span>Ежедневно</span>

              <strong>
                09:00 – 20:00
              </strong>
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
            <span className={styles.contactIcon}>
              <MapPin
                size={19}
                strokeWidth={2.2}
              />
            </span>

            <span className={styles.contactText}>
              <small>
                Адрес
              </small>

              <strong>
                ул. Логвиненко 55а, Бишкек
              </strong>
            </span>
          </a>

          <a
            href="tel:+996220343053"
            className={styles.contact}
          >
            <span className={styles.contactIcon}>
              <Phone
                size={18}
                strokeWidth={2.2}
              />
            </span>

            <span className={styles.contactText}>
              <small>
                Телефон
              </small>

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
            {/* WhatsApp */}
            <a
              href="https://wa.me/996220343053"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="WhatsApp"
            >
              <MessageCircle
                size={20}
                strokeWidth={2}
              />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/3xcargo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Telegram"
            >
              <Send
                size={19}
                strokeWidth={2}
              />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/3x.cargo"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.social}
              aria-label="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
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
                  cx="17.5"
                  cy="6.5"
                  r="0.75"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* BOTTOM */}
        <div className={styles.bottom}>
          <span>
            © 2017–2026 Alakel
          </span>

          <span>
            Бишкек, Кыргызстан
          </span>
        </div>
      </div>
    </footer>
  );
}