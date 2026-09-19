"use client";

import {
  memo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import styles from "./ImportantInfo.module.css";

/* =========================
   OVERLAYS
========================= */

function OverlayForbidden() {
  const topLabels = [
    "Горючие вещества",
    "Химикаты",
    "Лекарства и наркотики",
  ];

  const bottomLabels = [
    "Продукты питания",
    "Оружие и острые предметы",
    "Ноутбуки и смартфоны",
  ];

  return (
    <>
      <div className={styles.topShade} />

      <div className={styles.forbiddenTitle}>
        Запрещено к перевозке
      </div>

      <div
        className={`${styles.forbiddenLabels} ${styles.forbiddenLabelsTop}`}
      >
        {topLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div
        className={`${styles.forbiddenLabels} ${styles.forbiddenLabelsBottom}`}
      >
        {bottomLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className={styles.bottomShade} />
    </>
  );
}

function OverlayCrate() {
  return (
    <>
      <div className={styles.topShade} />

      <div className={styles.crateHeader}>
        <span className={styles.eyebrow}>
          Хрупкий груз?
        </span>

        <h3 className={styles.overlayTitle}>
          Защитите обрешёткой
        </h3>
      </div>

      <div className={styles.crateBottom}>
        <div className={styles.notice}>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>

          <p>
            Без обрешётки хрупкий груз отправляется{" "}
            <strong>
              под ответственность клиента.
            </strong>
          </p>
        </div>

        <a
          href="https://wa.me/996220343053?text=Хочу%20заказать%20обрешётку"
          target="_blank"
          rel="noreferrer"
          className={styles.whiteAction}
        >
          <svg
            viewBox="0 0 24 24"
            className={styles.whatsappIcon}
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          <span>Заказать обрешётку</span>
        </a>
      </div>
    </>
  );
}

function OverlayVolume() {
  return (
    <>
      <div className={styles.volumeTopShade} />

      <div className={styles.volumeHeader}>
        <h3 className={styles.overlayTitle}>
          Объёмные посылки
        </h3>

        <p>
          Если коробка лёгкая и занимает много места,
          стоимость рассчитывается по объёму
        </p>
      </div>

      <div className={styles.volumeBottom}>
        <a
          href="#calculator"
          className={styles.whiteAction}
        >
          <svg
            viewBox="0 0 24 24"
            className={styles.calcIcon}
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <line x1="14" y1="14" x2="21" y2="14" />
            <line x1="14" y1="17.5" x2="21" y2="17.5" />
            <line x1="14" y1="21" x2="21" y2="21" />
          </svg>

          <span>Рассчитать стоимость</span>
        </a>

        <p className={styles.actionHint}>
          Узнайте цену перед доставкой
        </p>
      </div>
    </>
  );
}

/* =========================
   DATA
========================= */

type TabItem = {
  label: string;
  img: string;
  overlay: ReactNode;
  objPos: string;
};

const TABS: TabItem[] = [
  {
    label: "Запрещено",
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/qqq2.webp",
    overlay: <OverlayForbidden />,
    objPos: "center 48%",
  },
  {
    label: "Обрешётка",
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/aw1.webp",
    overlay: <OverlayCrate />,
    objPos: "center 48%",
  },
  {
    label: "Объёмные посылки",
    img: "https://grrwtedzdbxtkaodfvvd.supabase.co/storage/v1/object/public/hero%201/ChatGPT%20Image%20Jun%2016,%202026,%2004_01_47%20AM.png",
    overlay: <OverlayVolume />,
    objPos: "center 45%",
  },
];

/* =========================
   CARD
========================= */

type TabCardProps = {
  tab: TabItem;
  pos: -1 | 0 | 1 | null;
  onSelect: () => void;
};

const TabCard = memo(function TabCard({
  tab,
  pos,
  onSelect,
}: TabCardProps) {
  const positionClass =
    pos === 0
      ? styles.cardActive
      : pos === 1
        ? styles.cardNext
        : pos === -1
          ? styles.cardPrev
          : styles.cardHidden;

  return (
    <div
      className={`${styles.slide} ${positionClass}`}
      onClick={pos !== 0 ? onSelect : undefined}
      aria-hidden={pos === null}
    >
      <div className={styles.imageWrap}>
        <img
          src={tab.img}
          alt={tab.label}
          loading="lazy"
          decoding="async"
          className={styles.image}
          style={
            {
              objectPosition: tab.objPos,
            } as CSSProperties
          }
        />

        <div
          className={`${styles.overlay} ${
            pos === 0
              ? styles.overlayVisible
              : ""
          }`}
        >
          {tab.overlay}
        </div>
      </div>
    </div>
  );
});

/* =========================
   COMPONENT
========================= */

export default function ImportantInfo() {
  const [activeTab, setActiveTab] = useState(0);

  const touchStartX = useRef<number | null>(
    null
  );

  const setTab = (index: number) => {
    const total = TABS.length;

    setActiveTab(
      (index + total) % total
    );
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current =
      event.touches[0].clientX;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (touchStartX.current === null) return;

    const diff =
      touchStartX.current -
      event.changedTouches[0].clientX;

    touchStartX.current = null;

    if (Math.abs(diff) < 40) return;

    setTab(
      activeTab + (diff > 0 ? 1 : -1)
    );
  };

  return (
    <section
      id="info"
      className={styles.section}
      aria-labelledby="important-title"
    >
      <div className={styles.header}>
        <h2
          id="important-title"
          className={styles.heading}
        >
          Важно знать
        </h2>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Важная информация"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={
                activeTab === index
              }
              className={`${styles.tab} ${
                activeTab === index
                  ? styles.tabActive
                  : ""
              }`}
              onClick={() => setTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={styles.stage}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {TABS.map((tab, index) => {
          const total = TABS.length;

          const diff =
            (index - activeTab + total) %
            total;

          const pos: -1 | 0 | 1 | null =
            diff === 0
              ? 0
              : diff === 1
                ? 1
                : diff === total - 1
                  ? -1
                  : null;

          return (
            <TabCard
              key={tab.label}
              tab={tab}
              pos={pos}
              onSelect={() =>
                setTab(index)
              }
            />
          );
        })}
      </div>

      <div className={styles.dots}>
        {TABS.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            aria-label={`Открыть: ${tab.label}`}
            className={`${styles.dot} ${
              activeTab === index
                ? styles.dotActive
                : ""
            }`}
            onClick={() => setTab(index)}
          />
        ))}
      </div>
    </section>
  );
}