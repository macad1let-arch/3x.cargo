"use client";

import { useEffect, useState } from "react";

import ChatWidget from "@/components/ChatWidget";
import TopBanner from "@/components/home/TopBanner";
import Header from "@/components/home/Header";
import PrimaryActions from "@/components/home/primary-actions/PrimaryActions";
import QuickActions from "@/components/home/quick-actions/QuickActions";
import TrackingBlock from "@/components/home/TrackingBlock";
import SecondaryActions from "@/components/home/secondary-actions/SecondaryActions";
import ImportantInfo from "@/components/ImportantInfo/ImportantInfo";
import FAQ from "@/components/home/FAQ";
import ContactForm from "@/components/ContactForm/ContactForm";
import Footer from "@/components/home/Footer";

import styles from "./page.module.css";

const BONUS_SLIDES = [
  {
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/at1.webp",
    overlay:
      "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
    textPos: "center",
    title: "До 5% бонусов на каждый заказ",
    sub: "Копите и тратьте на доставки",
    badge: "1 Бонус = 1 сом",
  },
  {
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/at3.webp",
    overlay:
      "linear-gradient(to bottom, rgba(20,10,80,0.75) 35%, rgba(20,10,80,0.2) 70%, transparent 60%), linear-gradient(to top, rgba(20,10,80,0.6) 0%, transparent 40%)",
    textPos: "top",
    title: "Пригласи друга",
    sub: "Друг получает 50 сом, а вы — 100 сом после его первого заказа.",
    badge: "+100 сом",
  },
];

function BonusSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % BONUS_SLIDES.length);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <div className={styles.bonus}>
      <div className={styles.bonusViewport}>
        {BONUS_SLIDES.map((slide, slideIndex) => {
          const active = index === slideIndex;

          return (
            <div
              key={slide.img}
              className={`${styles.bonusSlide} ${
                active ? styles.bonusSlideActive : ""
              }`}
            >
              <img
                src={slide.img}
                alt=""
                loading="lazy"
                decoding="async"
                className={styles.bonusImage}
              />

              <div
                className={styles.bonusOverlay}
                style={{ background: slide.overlay }}
              />

              <div
                className={`${styles.bonusContent} ${
                  slide.textPos === "center"
                    ? styles.bonusContentCenter
                    : styles.bonusContentTop
                }`}
              >
                <div
                  className={`${styles.bonusBadge} ${
                    slideIndex === 0
                      ? styles.bonusBadgeLight
                      : styles.bonusBadgeGold
                  }`}
                >
                  {slide.badge}
                </div>

                <h2 className={styles.bonusTitle}>
                  {slide.title}
                </h2>

                <p className={styles.bonusSubtitle}>
                  {slide.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.bonusDots}>
        {BONUS_SLIDES.map((_, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            aria-label={`Слайд ${slideIndex + 1}`}
            onClick={() => setIndex(slideIndex)}
            className={`${styles.bonusDot} ${
              index === slideIndex ? styles.bonusDotActive : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.topZone}>
        <TopBanner />
      </div>

      <Header />
      <PrimaryActions />
      <QuickActions />
      <TrackingBlock />
      <SecondaryActions />

      <section className={styles.bonusSection}>
        <BonusSlider />
      </section>

      <ImportantInfo />
      <ContactForm />
      <FAQ />

      <ChatWidget />
      <Footer />
    </main>
  );
}