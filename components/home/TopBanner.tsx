"use client";

import { useEffect, useState } from "react";
import { Gift, GraduationCap, Package } from "lucide-react";

const SLIDE_INTERVAL = 8000;

const DELIVERIES = "500 000+";
const STUDENTS = "3 000+";

export default function TopBanner() {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current === 0 ? 1 : 0));
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="topBanner" aria-label="Информация Alakel">
      <div className="inner">
        {/* ===== СТАТИСТИКА ===== */}
        <div
          className={`slide statsSlide ${
            activeSlide === 0 ? "active" : ""
          }`}
          aria-hidden={activeSlide !== 0}
        >
          <div className="statItem">
            <div className="iconBox packageIcon" aria-hidden="true">
              <Package />
            </div>

            <div className="statText">
              <strong>{DELIVERIES}</strong>
              <span>доставленных грузов</span>
            </div>
          </div>

          <div className="divider" aria-hidden="true" />

          <div className="statItem">
            <div className="iconBox educationIcon" aria-hidden="true">
              <GraduationCap />
            </div>

            <div className="statText">
              <strong>{STUDENTS}</strong>
              <span>обученных клиентов</span>
            </div>
          </div>
        </div>

        {/* ===== БОНУС ===== */}
        <div
          className={`slide bonusSlide ${
            activeSlide === 1 ? "active" : ""
          }`}
          aria-hidden={activeSlide !== 1}
        >
          {/* левая колонка */}
          <div className="bonusSide">
            <div className="iconBox bonusIcon" aria-hidden="true">
              <Gift />
            </div>
          </div>

          {/* центр */}
          <div className="bonusText">
            <strong>Получайте бонусы с каждого заказа</strong>
            <span>+100 сом за приглашённого друга</span>
          </div>

          {/* правая пустая колонка той же ширины */}
          <div className="bonusSide" aria-hidden="true" />
        </div>
      </div>

      <style jsx>{`
        .topBanner {
          --navy: #0a3478;
          --accent: #ffb31a;

          width: 100%;
          height: 60px;

          position: relative;
          overflow: hidden;

          background: var(--navy);
          color: #ffffff;

          border-bottom: 1px solid rgba(255, 255, 255, 0.06);

          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .inner {
          width: 100%;
          max-width: 720px;
          height: 100%;

          position: relative;

          margin: 0 auto;
        }

        /* =========================
           SLIDES
        ========================= */

        .slide {
          position: absolute;
          inset: 0;

          opacity: 0;
          visibility: hidden;
          pointer-events: none;

          transform: translateY(2px);

          transition:
            opacity 200ms ease,
            transform 200ms ease,
            visibility 200ms ease;
        }

        .slide.active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;

          transform: translateY(0);
        }

        /* =========================
           ICON
        ========================= */

        .iconBox {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;

          display: grid;
          place-items: center;

          border-radius: 9px;

          background: rgba(255, 255, 255, 0.085);
        }

        .iconBox :global(svg) {
          width: 18px;
          height: 18px;

          stroke-width: 2.15;
        }

        .packageIcon,
        .bonusIcon {
          color: var(--accent);
        }

        .educationIcon {
          color: rgba(255, 255, 255, 0.96);
        }

        /* =========================
           STATS
        ========================= */

        .statsSlide {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            1px
            minmax(0, 1fr);

          align-items: center;

          padding: 0 14px;
        }

        .statItem {
          min-width: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;
        }

        .statText {
          min-width: 0;

          display: flex;
          flex-direction: column;
          justify-content: center;

          text-align: left;
        }

        .statText strong {
          margin: 0;

          color: #ffffff;

          font-size: 15px;
          line-height: 1;
          font-weight: 850;

          letter-spacing: -0.025em;

          white-space: nowrap;
        }

        .statText span {
          margin-top: 4px;

          color: rgba(255, 255, 255, 0.79);

          font-size: 11.5px;
          line-height: 1;
          font-weight: 600;

          letter-spacing: -0.012em;

          white-space: nowrap;
        }

        .divider {
          width: 1px;
          height: 27px;

          background: rgba(255, 255, 255, 0.14);
        }

        /* =========================
           BONUS
        ========================= */

        /*
          3 симметричные зоны:
          34px | текст | 34px

          Благодаря пустой правой зоне сам текст
          находится точно по центру TopBanner.
        */
        .bonusSlide {
          display: grid;

          grid-template-columns:
            34px
            minmax(0, auto)
            34px;

          align-items: center;
          justify-content: center;

          gap: 9px;

          padding: 0 12px;
        }

        .bonusSide {
          width: 34px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bonusText {
          min-width: 0;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .bonusText strong {
          margin: 0;

          color: #ffffff;

          font-size: 14.5px;
          line-height: 1;
          font-weight: 820;

          letter-spacing: -0.02em;

          white-space: nowrap;
        }

        .bonusText span {
          margin-top: 4px;

          color: var(--accent);

          font-size: 11.2px;
          line-height: 1;
          font-weight: 750;

          letter-spacing: -0.01em;

          white-space: nowrap;
        }

        /* =========================
           MOBILE 430
        ========================= */

        @media (max-width: 430px) {
          .topBanner {
            height: 58px;
          }

          .statsSlide {
            padding: 0 9px;
          }

          .statItem {
            gap: 7px;
          }

          .iconBox {
            width: 32px;
            height: 32px;
            flex-basis: 32px;

            border-radius: 9px;
          }

          .iconBox :global(svg) {
            width: 18px;
            height: 18px;
          }

          .statText strong {
            font-size: 14.5px;
          }

          .statText span {
            margin-top: 4px;

            font-size: 11.5px;
          }

          .divider {
            height: 26px;
          }

          .bonusSlide {
            grid-template-columns:
              32px
              minmax(0, auto)
              32px;

            gap: 8px;

            padding: 0 8px;
          }

          .bonusSide {
            width: 32px;
          }

          .bonusText strong {
            font-size: 13.5px;
          }

          .bonusText span {
            font-size: 10.7px;
          }
        }

        /* =========================
           MOBILE 360
        ========================= */

        @media (max-width: 360px) {
          .topBanner {
            height: 58px;
          }

          .statsSlide {
            padding: 0 5px;
          }

          .statItem {
            gap: 5px;
          }

          .iconBox {
            width: 29px;
            height: 29px;
            flex-basis: 29px;

            border-radius: 8px;
          }

          .iconBox :global(svg) {
            width: 16px;
            height: 16px;
          }

          .statText strong {
            font-size: 12.8px;
          }

          .statText span {
            font-size: 10px;
          }

          .divider {
            height: 24px;
          }

          .bonusSlide {
            grid-template-columns:
              29px
              minmax(0, auto)
              29px;

            gap: 6px;

            padding: 0 6px;
          }

          .bonusSide {
            width: 29px;
          }

          .bonusText strong {
            font-size: 12px;
          }

          .bonusText span {
            font-size: 9.7px;
          }
        }

        /* =========================
           VERY SMALL 320
        ========================= */

        @media (max-width: 320px) {
          .statsSlide {
            padding: 0 3px;
          }

          .statItem {
            gap: 4px;
          }

          .iconBox {
            width: 27px;
            height: 27px;
            flex-basis: 27px;

            border-radius: 7px;
          }

          .iconBox :global(svg) {
            width: 15px;
            height: 15px;
          }

          .statText strong {
            font-size: 11.5px;
          }

          .statText span {
            font-size: 9.2px;
          }

          .bonusSlide {
            grid-template-columns:
              27px
              minmax(0, 1fr)
              27px;

            gap: 5px;
          }

          .bonusSide {
            width: 27px;
          }

          .bonusText strong {
            max-width: 220px;

            font-size: 11px;
            line-height: 1.08;

            white-space: normal;
          }

          .bonusText span {
            max-width: 220px;

            font-size: 9px;
            line-height: 1.08;

            white-space: normal;
          }
        }

        /* =========================
           DESKTOP
        ========================= */

        @media (min-width: 769px) {
          .topBanner {
            height: 62px;
          }

          .inner {
            max-width: 680px;
          }

          .statText strong {
            font-size: 15.5px;
          }

          .statText span {
            font-size: 11.8px;
          }

          .bonusText strong {
            font-size: 15px;
          }

          .bonusText span {
            font-size: 11.5px;
          }
        }

        /* =========================
           ACCESSIBILITY
        ========================= */

        @media (prefers-reduced-motion: reduce) {
          .slide {
            transition: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}